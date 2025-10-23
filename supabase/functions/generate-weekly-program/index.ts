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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { week_start_date, regenerate } = await req.json();

    // Fetch user goals and preferences
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
      return new Response(
        JSON.stringify({ error: 'User goals not found. Please complete onboarding.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const frequency = goals.frequency || 3;
    const sessionDuration = goals.session_duration || 60;

    // Delete existing sessions if regenerating
    if (regenerate) {
      const weekStart = new Date(week_start_date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      await supabase
        .from('sessions')
        .delete()
        .eq('user_id', user.id)
        .gte('session_date', weekStart.toISOString())
        .lt('session_date', weekEnd.toISOString());
    }

    // Calculate session dates based on frequency
    const sessionDates: Date[] = [];
    const weekStart = new Date(week_start_date);
    
    // Distribute sessions throughout the week
    const daysBetweenSessions = Math.floor(7 / frequency);
    for (let i = 0; i < frequency; i++) {
      const sessionDate = new Date(weekStart);
      sessionDate.setDate(weekStart.getDate() + (i * daysBetweenSessions) + 1); // Start from Monday
      sessionDates.push(sessionDate);
    }

    // Determine split logic
    const split = preferences?.split_preference || 'full_body';
    const sessionTypes = getSplitTypes(split, frequency);

    const generatedSessions = [];
    let successCount = 0;

    // Generate each session
    for (let i = 0; i < sessionDates.length; i++) {
      try {
        const sessionType = sessionTypes[i % sessionTypes.length];
        const sessionPrompt = buildSessionPrompt(
          i + 1,
          sessionType,
          sessionDuration,
          goals,
          preferences
        );

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: sessionPrompt.systemPrompt },
              { role: 'user', content: sessionPrompt.userPrompt }
            ],
            tools: [{
              type: 'function',
              function: {
                name: 'generate_training_session',
                description: 'Generate a complete training session',
                parameters: {
                  type: 'object',
                  properties: {
                    sessionName: { type: 'string' },
                    warmup: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'List of 3-5 warmup exercises with duration'
                    },
                    exercises: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          sets: { type: 'number' },
                          reps: { type: 'string' },
                          rest: { type: 'number' },
                          rpe: { type: 'number' },
                          rir: { type: 'number' },
                          tips: { type: 'array', items: { type: 'string' } },
                          commonMistakes: { type: 'array', items: { type: 'string' } },
                          alternatives: { type: 'array', items: { type: 'string' } }
                        },
                        required: ['name', 'sets', 'reps', 'rest', 'rpe', 'rir', 'tips', 'commonMistakes', 'alternatives']
                      }
                    },
                    checklist: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Pre-session checklist with 3-5 items'
                    },
                    coachNotes: { type: 'string', description: '2-3 sentences of personalized coach advice' },
                    estimatedTime: { type: 'number', description: 'Estimated session duration in minutes' }
                  },
                  required: ['sessionName', 'warmup', 'exercises', 'checklist', 'coachNotes', 'estimatedTime']
                }
              }
            }],
            tool_choice: { type: 'function', function: { name: 'generate_training_session' } }
          })
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for session ${i + 1}:`, await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices[0].message.tool_calls?.[0];
        
        if (!toolCall) {
          console.error(`No tool call in AI response for session ${i + 1}`);
          continue;
        }

        const sessionData = JSON.parse(toolCall.function.arguments);

        // Insert session into database
        const { data: insertedSession, error: insertError } = await supabase
          .from('sessions')
          .insert({
            user_id: user.id,
            session_date: sessionDates[i].toISOString(),
            exercises: {
              sessionName: sessionData.sessionName,
              warmup: sessionData.warmup,
              exercises: sessionData.exercises,
              checklist: sessionData.checklist,
              coachNotes: sessionData.coachNotes,
              estimatedTime: sessionData.estimatedTime
            },
            completed: false
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error inserting session ${i + 1}:`, insertError);
          continue;
        }

        generatedSessions.push(insertedSession);
        successCount++;

      } catch (error) {
        console.error(`Error generating session ${i + 1}:`, error);
      }
    }

    if (successCount < 3) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate enough sessions. Please try again.',
          partialSessions: generatedSessions 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        sessions: generatedSessions,
        totalGenerated: successCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-weekly-program:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getSplitTypes(split: string, frequency: number): string[] {
  switch (split) {
    case 'upper_lower':
      return ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body', 'Full Body', 'Upper Body'];
    case 'ppl':
      return ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'];
    case 'body_part':
      return ['Chest & Triceps', 'Back & Biceps', 'Legs', 'Shoulders', 'Full Body', 'Arms'];
    default:
      return Array(frequency).fill('Full Body');
  }
}

function buildSessionPrompt(
  sessionNumber: number,
  sessionType: string,
  duration: number,
  goals: any,
  preferences: any
) {
  const systemPrompt = `Tu es un coach sportif expert qui crée des programmes d'entraînement personnalisés. 
Tu dois générer une séance complète et détaillée en français.

IMPORTANT: Tous les textes doivent être en français.

La séance doit inclure:
- Un nom descriptif de la séance
- Un échauffement spécifique (3-5 exercices avec durée)
- Une liste d'exercices principaux adaptés au niveau et à l'équipement disponible
- Une checklist pré-séance (3-5 items)
- Des notes personnalisées du coach (2-3 phrases encourageantes et techniques)
- Un temps estimé total

Chaque exercice doit inclure:
- Nombre de séries et répétitions adapté au niveau
- Temps de repos optimal
- RPE (Rate of Perceived Exertion) et RIR (Reps In Reserve) cibles
- 2-3 consignes techniques clés
- 2-3 erreurs fréquentes à éviter
- 2-3 exercices alternatifs

Adapte la difficulté selon le niveau: ${preferences?.experience_level || 'intermediate'}`;

  const userPrompt = `Génère la séance ${sessionNumber} de type "${sessionType}" pour une semaine d'entraînement.

Profil utilisateur:
- Objectif: ${goals.goal_type}
- Niveau: ${preferences?.experience_level || 'intermediate'}
- Lieu: ${goals.location}
- Équipement: ${goals.equipment?.join(', ') || 'Équipement de base'}
- Durée cible: ${duration} minutes
- Type de session préférée: ${preferences?.session_type || 'strength'}
- Zones prioritaires: ${preferences?.priority_zones?.join(', ') || 'Aucune'}
- Limitations: ${preferences?.limitations?.join(', ') || 'Aucune'}
- Exercices à éviter: ${preferences?.exercises_to_avoid || 'Aucun'}
- Exercices favoris: ${preferences?.favorite_exercises || 'Aucun'}

Génère une séance complète et motivante !`;

  return { systemPrompt, userPrompt };
}