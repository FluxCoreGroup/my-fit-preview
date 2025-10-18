import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

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
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify subscription status (server-side check)
    const { count: feedbackCount } = await supabase
      .from('feedback')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // If user has completed at least one session, check for active subscription
    if (feedbackCount && feedbackCount > 0) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!subscription) {
        console.log('User has no active subscription');
        return new Response(
          JSON.stringify({ error: 'Abonnement requis pour continuer' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Fetching user data for:', user.id);

    // Récupérer les données utilisateur avec maybeSingle pour éviter les erreurs
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: prefs, error: prefsError } = await supabase
      .from('training_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Vérifier les erreurs de requête
    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      throw new Error('Erreur lors de la récupération des données utilisateur.');
    }

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError);
      throw new Error('Erreur lors de la récupération des préférences d\'entraînement.');
    }

    // Vérifier que les données existent
    if (!goals) {
      console.error('Goals data missing for user:', user.id);
      throw new Error('DATA_MISSING:goals');
    }

    if (!prefs) {
      console.error('Training preferences missing for user:', user.id);
      throw new Error('DATA_MISSING:prefs');
    }

    // Vérifier que les données personnelles essentielles sont présentes
    if (!goals.age || !goals.sex || !goals.height || !goals.weight) {
      console.error('Personal data incomplete:', { age: goals.age, sex: goals.sex, height: goals.height, weight: goals.weight });
      throw new Error('Données personnelles incomplètes. Vérifie ton profil.');
    }

    console.log('User data fetched successfully', {
      age: goals.age,
      sex: goals.sex,
      height: goals.height,
      weight: goals.weight,
      goal: goals.goal_type
    });

    // Construire le prompt système
    const systemPrompt = `Tu es un coach sportif expert. Tu dois générer une séance d'entraînement personnalisée.

DONNÉES UTILISATEUR :
- Âge : ${goals.age} ans
- Sexe : ${goals.sex}
- Taille : ${goals.height} cm
- Poids : ${goals.weight} kg
- Objectif : ${goals.goal_type}
- Niveau : ${prefs.experience_level}
- Type de séance : ${prefs.session_type}
- Split : ${prefs.split_preference || 'non défini'}
- Fréquence : ${goals.frequency} séances/semaine
- Durée : ${goals.session_duration} minutes
- Lieu : ${goals.location}
- Équipement : ${goals.equipment?.join(', ') || 'aucun'}
- Zones prioritaires : ${prefs.priority_zones?.join(', ') || 'équilibré'}
- Limitations : ${prefs.limitations?.join(', ') || 'aucune'}
- Exercices favoris : ${prefs.favorite_exercises || 'aucune préférence'}
- Exercices à éviter : ${prefs.exercises_to_avoid || 'aucun'}
- Focus progression : ${prefs.progression_focus}
- Historique : ${sessions?.length || 0} séances complétées

CONTRAINTES :
- Générer 5-7 exercices adaptés
- Respecter l'équipement disponible et le lieu
- Éviter les exercices contre-indiqués par les limitations
- Adapter l'intensité au niveau d'expérience
- Durée totale : ${goals.session_duration} minutes (incluant échauffement et repos)

FORMAT DE RÉPONSE :
Chaque exercice doit avoir :
- name: Nom de l'exercice en français
- sets: Nombre de séries (2-5)
- reps: Répétitions ou durée (ex: "10-12", "30s", "max")
- rest: Temps de repos en secondes (30-180)
- rpe: Niveau d'effort perçu 1-10 (string)
- rir: Répétitions en réserve 0-4 (string)
- tips: 2-3 conseils d'exécution (array)
- commonMistakes: 2-3 erreurs fréquentes (array)
- alternatives: 2-3 exercices alternatifs (array)`;

    // Appel à Lovable AI avec tool calling
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
          { role: 'user', content: 'Génère une séance d\'entraînement personnalisée pour cet utilisateur.' }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_training_session',
            description: 'Génère une séance d\'entraînement structurée',
            parameters: {
              type: 'object',
              properties: {
                exercises: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      sets: { type: 'number' },
                      reps: { type: 'string' },
                      rest: { type: 'number' },
                      rpe: { type: 'string' },
                      rir: { type: 'string' },
                      tips: { type: 'array', items: { type: 'string' } },
                      commonMistakes: { type: 'array', items: { type: 'string' } },
                      alternatives: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['name', 'sets', 'reps', 'rest', 'rpe', 'rir', 'tips', 'commonMistakes', 'alternatives']
                  }
                }
              },
              required: ['exercises']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_training_session' } }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    console.log('AI response received:', JSON.stringify(aiData).substring(0, 200));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const sessionData = JSON.parse(toolCall.function.arguments);
    
    // Ajouter des IDs uniques aux exercices
    const exercises = sessionData.exercises.map((ex: any, idx: number) => ({
      ...ex,
      id: `ex${idx + 1}`
    }));

    console.log('Session generated successfully with', exercises.length, 'exercises');

    return new Response(
      JSON.stringify({ 
        exercises,
        sessionName: `Séance ${prefs.session_type}`,
        totalDuration: goals.session_duration,
        generatedAt: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    // Log full error details server-side
    console.error('Error in generate-training-session:', error);
    
    // Map error to user-friendly message (don't expose internal details)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let clientError = 'Une erreur est survenue lors de la génération';
    let statusCode = 500;

    if (errorMessage.includes('Unauthorized') || errorMessage.includes('JWT')) {
      clientError = 'Session expirée, veuillez vous reconnecter';
      statusCode = 401;
    } else if (errorMessage.includes('DATA_MISSING')) {
      clientError = 'Configuration incomplète';
      statusCode = 400;
    } else if (errorMessage.includes('Abonnement requis')) {
      clientError = errorMessage;
      statusCode = 403;
    }

    return new Response(
      JSON.stringify({ 
        error: clientError,
        retryable: statusCode === 401
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
