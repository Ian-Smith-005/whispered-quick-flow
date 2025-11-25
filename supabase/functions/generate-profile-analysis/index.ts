import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch comprehensive user data
    const { data: meals } = await supabaseClient
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .order('meal_time', { ascending: false })
      .limit(30);

    const { data: glucose } = await supabaseClient
      .from('glucose_readings')
      .select('*')
      .eq('user_id', user.id)
      .order('reading_time', { ascending: false })
      .limit(30);

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Calculate statistics
    const totalMeals = meals?.length || 0;
    const avgCalories = meals?.length 
      ? Math.round(meals.reduce((sum, m) => sum + (m.calories || 0), 0) / meals.length)
      : 0;
    const avgCarbs = meals?.length
      ? Math.round(meals.reduce((sum, m) => sum + (m.carbohydrates || 0), 0) / meals.length)
      : 0;
    const avgGlucose = glucose?.length
      ? Math.round(glucose.reduce((sum, r) => sum + r.glucose_value, 0) / glucose.length)
      : 0;

    const systemPrompt = `You are a diabetes care specialist analyzing a patient's profile. Based on their actual meal and glucose data, provide a comprehensive health assessment.

User Data:
- Diabetes Type: ${profile?.diabetes_type || 'Not specified'}
- Total Meals Logged: ${totalMeals}
- Average Calories per Meal: ${avgCalories}
- Average Carbs per Meal: ${avgCarbs}g
- Average Glucose Level: ${avgGlucose} mg/dL
- Recent Meals: ${meals?.slice(0, 10).map(m => m.meal_name).join(', ') || 'None'}

Generate a professional health profile analysis including:
1. Overall Health Status (1-2 sentences)
2. Diet Patterns Analysis (2-3 sentences)
3. Glucose Control Assessment (2-3 sentences)
4. Top 3 Strengths (bullet points)
5. Top 3 Areas for Improvement (bullet points)
6. Personalized Recommendations (3-4 specific actions)

Format as JSON:
{
  "healthStatus": "...",
  "dietAnalysis": "...",
  "glucoseControl": "...",
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "recommendations": ["...", "...", "..."]
}`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze my health profile.' }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      throw new Error('Failed to generate profile analysis');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;

    let analysis = {};
    try {
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || analysisText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analysis = {
        healthStatus: analysisText.substring(0, 200),
        dietAnalysis: "Analysis based on your recent meals.",
        glucoseControl: "Glucose monitoring data analyzed.",
        strengths: ["Tracking meals regularly", "Monitoring glucose levels", "Engaged in health management"],
        improvements: ["Continue consistent tracking", "Focus on carb balance", "Regular meal timing"],
        recommendations: ["Keep logging meals", "Monitor glucose after meals", "Consult with healthcare provider"]
      };
    }

    // Add statistics
    analysis.statistics = {
      totalMeals,
      avgCalories,
      avgCarbs,
      avgGlucose,
      glucoseReadings: glucose?.length || 0
    };

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
