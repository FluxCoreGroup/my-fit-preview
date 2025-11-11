import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { allergies, restrictions, healthConditions } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Tu es un assistant qui reformate des informations de santé et nutrition de manière claire et professionnelle.

Reformate les textes suivants de manière concise et lisible :
- Allergies : "${allergies || 'Aucune'}"
- Restrictions : "${restrictions || 'Aucune'}"
- Conditions de santé : "${healthConditions || 'Aucune'}"

Réponds uniquement en JSON avec cette structure exacte :
{
  "allergies": "texte formaté ou 'Aucune allergie signalée'",
  "restrictions": "texte formaté ou 'Aucune restriction alimentaire'",
  "healthConditions": "texte formaté ou 'Aucune condition particulière'"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Formate ces données.' }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Nettoyer le contenu pour enlever les balises markdown
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const formatted = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(formatted),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in format-health-data:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur de formatage',
        allergies: 'Aucune allergie signalée',
        restrictions: 'Aucune restriction alimentaire',
        healthConditions: 'Aucune condition particulière'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
