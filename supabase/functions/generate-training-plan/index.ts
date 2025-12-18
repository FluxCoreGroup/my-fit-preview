import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema for goals data from database
const goalsSchema = z.object({
  goal_type: z.string().max(100),
  frequency: z.number().min(1).max(7).nullable(),
  session_duration: z.number().min(15).max(180).nullable(),
  location: z.string().max(100).nullable(),
  equipment: z.array(z.string().max(100)).max(20).nullable(),
  health_conditions: z.array(z.string().max(200)).max(20).nullable(),
}).passthrough();

// Validation schema for preferences data from database
const preferencesSchema = z.object({
  experience_level: z.string().max(50),
  session_type: z.string().max(50),
  split_preference: z.string().max(100).nullable(),
  progression_focus: z.string().max(100),
  priority_zones: z.array(z.string().max(100)).max(10).nullable(),
  limitations: z.array(z.string().max(200)).max(20).nullable(),
}).passthrough();

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

    // Verify subscription for training plan generation
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!subscription) {
      console.log('User has no active subscription for training plan');
      return new Response(
        JSON.stringify({ error: 'Abonnement requis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user data
    const { data: goalsRaw } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: preferencesRaw } = await supabase
      .from('training_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!goalsRaw) {
      return new Response(
        JSON.stringify({ error: 'Objectifs non définis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize goals data
    const goalsResult = goalsSchema.safeParse(goalsRaw);
    if (!goalsResult.success) {
      console.error('Goals validation error:', goalsResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Données objectifs invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const goals = goalsResult.data;

    // Validate and sanitize preferences data (optional)
    let preferences = null;
    if (preferencesRaw) {
      const prefResult = preferencesSchema.safeParse(preferencesRaw);
      if (prefResult.success) {
        preferences = prefResult.data;
      } else {
        console.warn('Preferences validation warning:', prefResult.error.errors);
      }
    }

    // Sanitize array values for prompt injection prevention
    const sanitizeArray = (arr: string[] | null | undefined): string => {
      if (!arr || arr.length === 0) return 'Aucun';
      return arr.map(s => s.replace(/[<>{}]/g, '')).join(', ');
    };

    const sanitizeString = (str: string | null | undefined, defaultVal: string): string => {
      if (!str) return defaultVal;
      return str.replace(/[<>{}]/g, '').substring(0, 100);
    };

    // Build system prompt with sanitized data
    const systemPrompt = `Tu es un coach sportif expert. Génère un plan d'entraînement global personnalisé.

INFORMATIONS UTILISATEUR:
- Objectif: ${sanitizeString(goals.goal_type, 'non défini')}
- Fréquence: ${goals.frequency || 3} séances/semaine
- Durée par séance: ${goals.session_duration || 60} minutes
- Lieu: ${sanitizeString(goals.location, 'non défini')}
- Équipements: ${sanitizeArray(goals.equipment)}
- Niveau: ${sanitizeString(preferences?.experience_level, 'Débutant')}
- Type de séances: ${sanitizeString(preferences?.session_type, 'Mixte')}
- Split préféré: ${sanitizeString(preferences?.split_preference, 'Full Body')}
- Focus progression: ${sanitizeString(preferences?.progression_focus, 'Force')}
- Zones prioritaires: ${sanitizeArray(preferences?.priority_zones)}
- Limitations: ${sanitizeArray(preferences?.limitations)}
- Conditions de santé: ${sanitizeArray(goals.health_conditions)}

INSTRUCTIONS:
1. Génère un plan hebdomadaire complet avec ${goals.frequency || 3} séances
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

    console.log('🏋️ Generating training plan for user:', user.id);

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
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Trop de requêtes, réessaye dans quelques instants' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants, contacte le support' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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

    console.log('✅ Training plan generated successfully');

    return new Response(
      JSON.stringify(trainingPlan),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    // Log detailed error server-side only
    console.error('Error in generate-training-plan:', error);
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la génération du plan' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
