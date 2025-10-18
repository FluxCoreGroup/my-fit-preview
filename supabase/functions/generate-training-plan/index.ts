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
      throw new Error('Unauthorized');
    }

    // Fetch user data
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: preferences } = await supabase
      .from('training_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!goals) {
      throw new Error('User goals not found');
    }

    // Build system prompt
    const systemPrompt = `Tu es un coach sportif expert. Génère un plan d'entraînement global personnalisé.

INFORMATIONS UTILISATEUR:
- Objectif: ${goals.goal_type}
- Fréquence: ${goals.frequency} séances/semaine
- Durée par séance: ${goals.session_duration} minutes
- Lieu: ${goals.location}
- Équipements: ${goals.equipment?.join(', ') || 'Poids du corps'}
- Niveau: ${preferences?.experience_level || 'Débutant'}
- Type de séances: ${preferences?.session_type || 'Mixte'}
- Split préféré: ${preferences?.split_preference || 'Full Body'}
- Focus progression: ${preferences?.progression_focus || 'Force'}
- Zones prioritaires: ${preferences?.priority_zones?.join(', ') || 'Corps entier'}
- Limitations: ${preferences?.limitations?.join(', ') || 'Aucune'}
- Conditions de santé: ${goals.health_conditions?.join(', ') || 'Aucune'}

INSTRUCTIONS:
1. Génère un plan hebdomadaire complet avec ${goals.frequency} séances
2. Chaque séance doit inclure: nom, focus, durée estimée, exercices détaillés
3. Respecte le split préféré et les limitations
4. Fournis une explication de la stratégie globale
5. Inclus des conseils de progression

Réponds UNIQUEMENT avec un JSON structuré (pas de markdown, juste le JSON pur):
{
  "weeklyPlan": [
    {
      "day": "Jour 1",
      "sessionName": "Nom de la séance",
      "focus": "Focus principal",
      "duration": number (minutes),
      "exercises": [
        {
          "name": "Nom exercice",
          "sets": number,
          "reps": "X-Y" ou "temps",
          "rest": "temps de repos",
          "notes": "consignes techniques"
        }
      ]
    }
  ],
  "strategy": "Explication de la stratégie du programme (3-4 phrases)",
  "progressionTips": ["conseil 1", "conseil 2", "conseil 3"]
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
          { role: 'user', content: 'Génère le plan d\'entraînement maintenant.' }
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
    const trainingPlan = JSON.parse(cleanContent);

    return new Response(
      JSON.stringify(trainingPlan),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-training-plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
