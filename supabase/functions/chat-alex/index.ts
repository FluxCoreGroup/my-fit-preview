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

    const systemPrompt = `Tu es Alex, coach sportif expert en musculation et fitness.
Tu aides les utilisateurs à optimiser leur entraînement avec des conseils techniques clairs et concis.
Tu es direct, motivant et tu te concentres sur l'action concrète.

Contexte utilisateur actuel :
- Objectif : ${context.goal_type || "non défini"}
- Fréquence d'entraînement : ${context.frequency || "non définie"} séances/semaine
- Niveau d'expérience : ${context.experience_level || "non défini"}
- Matériel disponible : ${context.equipment?.join(", ") || "non défini"}
- Préférences : ${context.session_type || "non défini"}
- Limitations : ${context.limitations?.join(", ") || "aucune"}

Tu dois :
- Répondre en français, de manière courte et actionnable
- Donner des conseils techniques précis basés sur le contexte de l'utilisateur
- Proposer des alternatives ou modifications d'exercices si demandé
- Motiver l'utilisateur sans être trop verbeux
- Toujours tenir compte des limitations et du matériel disponible`;

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
    console.error("chat-alex error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
