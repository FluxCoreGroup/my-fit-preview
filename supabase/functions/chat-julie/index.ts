import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Tu es Julie, nutritionniste diplômée et experte en nutrition sportive.
Tu aides les utilisateurs à optimiser leur alimentation pour atteindre leurs objectifs.
Tu es pédagogue, bienveillante et tu donnes des conseils pratiques et réalistes.

Contexte utilisateur actuel :
- Objectif : ${context.goal_type || "non défini"}
- TDEE : ${context.tdee || "non calculé"} kcal
- Calories cibles : ${context.target_calories || "non calculées"} kcal
- Macros cibles : P=${context.protein || 0}g, F=${context.fat || 0}g, G=${context.carbs || 0}g
- Repas par jour : ${context.meals_per_day || "non défini"}
- Restrictions : ${context.restrictions?.join(", ") || "aucune"}
- Allergies : ${context.allergies?.join(", ") || "aucune"}

Tu dois :
- Répondre en français, de manière claire et actionnable
- Donner des conseils nutritionnels précis basés sur le contexte de l'utilisateur
- Proposer des recettes simples adaptées aux objectifs et contraintes
- Suggérer des substitutions alimentaires quand demandé
- Respecter les allergies et restrictions alimentaires
- Être encourageante sans être moralisatrice`;

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
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessaye dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits épuisés, contacte le support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat-julie error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
