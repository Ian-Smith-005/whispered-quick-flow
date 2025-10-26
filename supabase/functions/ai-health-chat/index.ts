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
    const { messages } = await req.json();
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

    // Fetch user's recent health data to provide context to AI
    const [mealsData, glucoseData, metricsData] = await Promise.all([
      supabase.from('meals').select('*').eq('user_id', user.id).order('meal_time', { ascending: false }).limit(10),
      supabase.from('glucose_readings').select('*').eq('user_id', user.id).order('reading_time', { ascending: false }).limit(10),
      supabase.from('user_metrics').select('*').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(10),
    ]);

    // Build context from user data
    let contextInfo = "User's recent health data:\n";
    
    if (mealsData.data && mealsData.data.length > 0) {
      contextInfo += "\nRecent meals:\n";
      mealsData.data.forEach(meal => {
        contextInfo += `- ${meal.meal_name} (${meal.meal_type}): ${meal.calories || 'N/A'} cal, ${meal.carbohydrates || 'N/A'}g carbs\n`;
      });
    }

    if (glucoseData.data && glucoseData.data.length > 0) {
      contextInfo += "\nRecent glucose readings:\n";
      glucoseData.data.forEach(reading => {
        contextInfo += `- ${reading.glucose_value} mg/dL (${reading.reading_context})\n`;
      });
    }

    if (metricsData.data && metricsData.data.length > 0) {
      contextInfo += "\nRecent health metrics:\n";
      metricsData.data.forEach(metric => {
        contextInfo += `- ${metric.metric_type}: ${JSON.stringify(metric.value)}\n`;
      });
    }

    const systemPrompt = `You are Diacare AI, a helpful and empathetic diabetes health assistant. You provide personalized advice based on the user's health data.

${contextInfo}

Guidelines:
- Provide clear, actionable advice for managing diabetes
- Be empathetic and supportive
- Reference the user's actual data when relevant
- Suggest healthy meal options and lifestyle changes
- Remind users to consult healthcare professionals for medical decisions
- Keep responses concise and easy to understand`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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

    // Save chat response to ai_insights table
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      await supabase.from('ai_insights').insert({
        user_id: user.id,
        insight_type: 'chat_response',
        content: lastUserMessage.content,
        metadata: { timestamp: new Date().toISOString() }
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
