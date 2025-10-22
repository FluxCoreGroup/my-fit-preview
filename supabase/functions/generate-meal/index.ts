import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { protein, carbs, fats, type, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const calories = protein * 4 + carbs * 4 + fats * 9;

    const categoryNames: Record<string, string> = {
      breakfast: "petit-déjeuner",
      lunch: "déjeuner",
      dinner: "dîner",
      snack: "snack",
    };

    const typeDesc = type === "sweet" ? "sucré" : "salé";

    const systemPrompt = `Tu es un nutritionniste expert. Génère un repas ${typeDesc} pour le ${categoryNames[category] || "repas"} avec exactement ces macros : ${protein}g protéines, ${carbs}g glucides, ${fats}g lipides (environ ${calories} kcal).

Réponds UNIQUEMENT avec un objet JSON valide dans ce format exact :
{
  "name": "Nom du repas",
  "description": "Description courte et appétissante",
  "ingredients": ["ingredient 1 avec quantité", "ingredient 2 avec quantité", ...],
  "instructions": ["étape 1", "étape 2", ...],
  "macros": {
    "protein": ${protein},
    "carbs": ${carbs},
    "fats": ${fats},
    "calories": ${calories}
  }
}

Règles strictes :
- Le repas doit être réaliste, équilibré et savoureux
- Les quantités d'ingrédients doivent correspondre précisément aux macros demandées
- Liste 5-8 ingrédients maximum
- 3-5 étapes de préparation maximum
- Adapte la complexité au type de repas
- Pas de markdown, juste le JSON brut`;

    console.log("🍽️ Generating meal with params:", { protein, carbs, fats, type, category });

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
          { role: "user", content: `Génère un repas ${typeDesc} pour le ${categoryNames[category]}` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessaye dans quelques instants" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants, contacte le support" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("✅ AI Response received:", content.substring(0, 200));

    // Parse JSON from response
    let mealData;
    try {
      // Remove potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      mealData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log("✅ Meal generated successfully:", mealData.name);

    return new Response(JSON.stringify(mealData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in generate-meal:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
