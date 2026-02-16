import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing environment variables');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify subscription for nutrition plan generation
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!subscription) {
      console.log('User has no active subscription for nutrition plan');
      return new Response(
        JSON.stringify({ error: 'Abonnement requis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user data
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!goals) {
      throw new Error('User goals not found');
    }

    // Build system prompt
    const systemPrompt = `Tu es un expert en nutrition sportive. Génère un plan nutritionnel personnalisé sur 7 JOURS COMPLETS.

INFORMATIONS UTILISATEUR:
- Objectif: ${Array.isArray(goals.goal_type) ? goals.goal_type.join(', ') : goals.goal_type}
- Âge: ${goals.age} ans
- Sexe: ${goals.sex}
- Poids: ${goals.weight} kg
- Taille: ${goals.height} cm
- Niveau d'activité: ${goals.activity_level}
- Fréquence d'entraînement: ${goals.frequency}x/semaine
- Repas par jour: ${goals.meals_per_day}
- Petit-déjeuner: ${goals.has_breakfast ? 'Oui' : 'Non'}
- Restrictions alimentaires: ${goals.restrictions?.join(', ') || 'Aucune'}
- Allergies: ${goals.allergies?.join(', ') || 'Aucune'}
${goals.target_weight_loss ? `- Objectif de perte: ${goals.target_weight_loss} kg` : ''}

INSTRUCTIONS:
1. Génère 7 JOURS COMPLETS de repas variés
2. Chaque jour doit avoir ${goals.meals_per_day} repas
3. Respecte l'objectif calorique calculé (TDEE ajusté selon le goal)
4. Varie les aliments entre les jours
5. Respecte les restrictions et allergies

Réponds UNIQUEMENT avec un JSON (pas de markdown):
{
  "days": [
    {
      "day": 1,
      "meals": [
        {
          "name": "Petit-déjeuner",
          "food": "Description détaillée des aliments",
          "kcal": 400,
          "p": 25,
          "f": 10,
          "g": 50
        }
      ]
    }
  ]
}`;

    // Call Lovable AI
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
          { role: 'user', content: 'Génère le plan nutritionnel maintenant.' }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON response
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const nutritionPlan = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(nutritionPlan),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    // Log detailed error server-side only
    console.error('Error in generate-nutrition-plan:', error);
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la génération du plan nutritionnel' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
