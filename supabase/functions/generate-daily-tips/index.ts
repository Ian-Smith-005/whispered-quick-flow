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

    // Fetch user's recent meals (last 7 days)
    const { data: meals, error: mealsError } = await supabaseClient
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('meal_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('meal_time', { ascending: false })
      .limit(20);

    if (mealsError) throw mealsError;

    // Fetch recent glucose readings
    const { data: glucoseReadings, error: glucoseError } = await supabaseClient
      .from('glucose_readings')
      .select('*')
      .eq('user_id', user.id)
      .gte('reading_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('reading_time', { ascending: false })
      .limit(20);

    if (glucoseError) throw glucoseError;

    // Fetch user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Prepare context for AI
    const mealsSummary = meals?.length 
      ? meals.map(m => `${m.meal_name} (${m.calories || 'N/A'} cal, ${m.carbohydrates || 'N/A'}g carbs)`).join(', ')
      : 'No recent meals logged';

    const avgGlucose = glucoseReadings?.length
      ? (glucoseReadings.reduce((sum, r) => sum + r.glucose_value, 0) / glucoseReadings.length).toFixed(1)
      : 'N/A';

    const systemPrompt = `You are a diabetes care expert. Generate 5 personalized daily health tips based on the user's actual meal and glucose data. Each tip should be:
- Actionable and specific to their eating patterns
- Between 50-80 words
- Focus on diabetes management
- Include both encouragement and practical advice

User Profile:
- Diabetes Type: ${profile?.diabetes_type || 'Not specified'}
- Recent Meals: ${mealsSummary}
- Average Glucose (7 days): ${avgGlucose} mg/dL
- Total Meals Logged: ${meals?.length || 0}

Format your response as a JSON array with this structure:
[
  {
    "title": "Tip Title",
    "content": "Detailed tip content",
    "icon": "fas fa-icon-name",
    "category": "nutrition|activity|monitoring|lifestyle"
  }
]`;

    // Call Lovable AI
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
          { role: 'user', content: 'Generate 5 personalized daily health tips for me based on my recent data.' }
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
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('Failed to generate tips');
    }

    const aiData = await aiResponse.json();
    const tipsText = aiData.choices[0].message.content;

    // Parse JSON from response
    let tips = [];
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = tipsText.match(/```json\s*([\s\S]*?)\s*```/) || tipsText.match(/\[([\s\S]*)\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : tipsText;
      tips = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: create basic tips structure
      tips = [
        {
          title: "Personalized Tips Generated",
          content: tipsText.substring(0, 300),
          icon: "fas fa-lightbulb",
          category: "general"
        }
      ];
    }

    return new Response(
      JSON.stringify({ tips }),
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
