import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageContent = imageBase64 || imageUrl;
    if (!imageContent) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a nutrition expert AI specializing in analyzing food images for diabetes management. 
Analyze the food in the image and provide:
1. Identification of all food items visible
2. Estimated portion sizes
3. Nutritional breakdown (calories, carbohydrates, protein, fat, fiber)
4. Glycemic impact assessment
5. Recommendations for diabetes management

Provide your response in JSON format:
{
  "foods": ["list of identified foods"],
  "portionSizes": "description of portions",
  "nutrition": {
    "calories": estimated_calories,
    "carbohydrates": estimated_carbs_in_grams,
    "protein": estimated_protein_in_grams,
    "fat": estimated_fat_in_grams,
    "fiber": estimated_fiber_in_grams
  },
  "glycemicImpact": "low|medium|high",
  "recommendations": "specific recommendations for this meal",
  "mealName": "descriptive name for this meal"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: systemPrompt 
          },
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: "Please analyze this food image and provide nutritional information."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageContent
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      analysis = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      analysis = {
        foods: ["Unable to parse"],
        portionSizes: "Unknown",
        nutrition: {
          calories: 0,
          carbohydrates: 0,
          protein: 0,
          fat: 0,
          fiber: 0
        },
        glycemicImpact: "unknown",
        recommendations: aiResponse,
        mealName: "Analyzed Meal"
      };
    }

    // Save the meal analysis to the database
    const { data: mealData, error: mealError } = await supabase.from('meals').insert({
      user_id: user.id,
      meal_name: analysis.mealName || "AI Analyzed Meal",
      description: analysis.foods?.join(', ') || '',
      calories: analysis.nutrition?.calories || null,
      carbohydrates: analysis.nutrition?.carbohydrates || null,
      protein: analysis.nutrition?.protein || null,
      fat: analysis.nutrition?.fat || null,
      fiber: analysis.nutrition?.fiber || null,
      image_url: imageUrl || null,
      ai_analyzed: true,
      meal_time: new Date().toISOString()
    }).select().single();

    if (mealError) {
      console.error("Error saving meal:", mealError);
    }

    // Save AI insight
    await supabase.from('ai_insights').insert({
      user_id: user.id,
      insight_type: 'meal_suggestion',
      content: analysis.recommendations || 'Meal analyzed',
      metadata: {
        meal_id: mealData?.id,
        glycemic_impact: analysis.glycemicImpact,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({ 
      analysis,
      mealId: mealData?.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Meal analysis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
