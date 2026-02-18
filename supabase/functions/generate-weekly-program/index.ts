import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check subscription status (allow first use for free)
    const { count: feedbackCount } = await supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (feedbackCount && feedbackCount > 0) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .maybeSingle();

      if (!subscription) {
        console.warn(
          `Subscription required for user ${user.id} - generate-weekly-program`,
        );
        return new Response(
          JSON.stringify({
            error: "Abonnement requis pour générer un programme hebdomadaire",
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }
    console.log(`Subscription check passed for user ${user.id}`);

    const { week_start_date, regenerate, quick_preferences } = await req.json();

    // =============================================
    // Fetch user goals and preferences
    // =============================================
    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: preferences } = await supabase
      .from("training_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!goals) {
      return new Response(
        JSON.stringify({
          error: "User goals not found. Please complete onboarding.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // =============================================
    // Fetch historical context for intelligent generation
    // =============================================

    // 1. Last weekly check-in
    const { data: lastCheckin } = await supabase
      .from("weekly_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Recent feedback (last 3 sessions)
    const { data: recentFeedback } = await supabase
      .from("feedback")
      .select("rpe, completed, comments, had_pain, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    // 3. Last completed session date (to detect inactivity gap)
    const { data: lastCompletedSession } = await supabase
      .from("sessions")
      .select("session_date")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("session_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Calculate inactivity gap
    const now = new Date();
    const lastSessionDate = lastCompletedSession
      ? new Date(lastCompletedSession.session_date)
      : null;
    const inactivityDays = lastSessionDate
      ? Math.floor((now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Build historical context object for prompt injection
    const historicalContext = buildHistoricalContext(
      lastCheckin,
      recentFeedback || [],
      inactivityDays,
    );

    // =============================================
    // Apply quick preferences overrides if provided
    // =============================================
    const effectiveGoals = { ...goals };
    const effectivePreferences = { ...preferences };
    if (quick_preferences) {
      if (quick_preferences.frequency) effectiveGoals.frequency = quick_preferences.frequency;
      if (quick_preferences.session_duration) effectiveGoals.session_duration = quick_preferences.session_duration;
      if (quick_preferences.focus) effectivePreferences.progression_focus = quick_preferences.focus;
    }

    const frequency = effectiveGoals.frequency || 3;
    const sessionDuration = effectiveGoals.session_duration || 60;

    // Delete existing sessions if regenerating
    if (regenerate) {
      const weekStart = new Date(week_start_date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      await supabase
        .from("sessions")
        .delete()
        .eq("user_id", user.id)
        .gte("session_date", weekStart.toISOString())
        .lt("session_date", weekEnd.toISOString());
    }

    // Calculate session dates based on frequency
    const sessionDates: Date[] = [];
    const weekStart = new Date(week_start_date);

    // Distribute sessions throughout the week
    const daysBetweenSessions = Math.floor(7 / frequency);
    for (let i = 0; i < frequency; i++) {
      const sessionDate = new Date(weekStart);
      sessionDate.setDate(weekStart.getDate() + i * daysBetweenSessions + 1);
      sessionDates.push(sessionDate);
    }

    // Determine split logic
    const split = effectivePreferences?.split_preference || "full_body";
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
          effectiveGoals,
          effectivePreferences,
          historicalContext,
        );

        console.log(
          `Generating session ${i + 1}/${sessionDates.length}: ${sessionType}`,
        );

        const aiResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: sessionPrompt.systemPrompt },
                { role: "user", content: sessionPrompt.userPrompt },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "generate_training_session",
                    description:
                      "Generate a complete training session with professional formatting",
                    parameters: {
                      type: "object",
                      properties: {
                        sessionName: {
                          type: "string",
                          description:
                            "Titre court et descriptif (max 30 caractères)",
                        },
                        warmup: {
                          type: "array",
                          items: { type: "string" },
                          description:
                            '4-6 exercices d\'échauffement avec durée (ex: "Jumping Jacks - 1 min")',
                        },
                        exercises: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: {
                                type: "string",
                                description:
                                  "Nom de l'exercice en français sans numéro",
                              },
                              englishName: {
                                type: "string",
                                description:
                                  'Nom de l\'exercice en anglais pour l\'API (ex: "bench press", "squat", "pull up")',
                              },
                              sets: {
                                type: "number",
                                description: "Nombre de séries",
                              },
                              reps: {
                                type: "string",
                                description:
                                  'Répétitions ou durée (ex: "8-12" ou "30s")',
                              },
                              rest: {
                                type: "number",
                                description: "Repos en secondes",
                              },
                              rpe: {
                                type: "number",
                                description: "RPE cible 1-10",
                              },
                              rir: {
                                type: "number",
                                description: "RIR cible 0-5",
                              },
                              tips: {
                                type: "array",
                                items: { type: "string" },
                                description: "2 conseils techniques courts",
                              },
                              commonMistakes: {
                                type: "array",
                                items: { type: "string" },
                                description: "2 erreurs fréquentes",
                              },
                              alternatives: {
                                type: "array",
                                items: { type: "string" },
                                description: "2 alternatives",
                              },
                            },
                            required: [
                              "name",
                              "englishName",
                              "sets",
                              "reps",
                              "rest",
                              "rpe",
                              "rir",
                              "tips",
                              "commonMistakes",
                              "alternatives",
                            ],
                          },
                        },
                        checklist: {
                          type: "array",
                          items: { type: "string" },
                          description: "4 items de checklist pré-séance",
                        },
                        coachNotes: {
                          type: "string",
                          description:
                            "2 phrases maximum, conseils personnalisés sans émojis",
                        },
                        estimatedTime: {
                          type: "number",
                          description: "Durée estimée en minutes",
                        },
                      },
                      required: [
                        "sessionName",
                        "warmup",
                        "exercises",
                        "checklist",
                        "coachNotes",
                        "estimatedTime",
                      ],
                    },
                  },
                },
              ],
              tool_choice: {
                type: "function",
                function: { name: "generate_training_session" },
              },
            }),
          },
        );

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI API error for session ${i + 1}:`, errorText);
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices[0].message.tool_calls?.[0];

        if (!toolCall) {
          console.error(`No tool call in AI response for session ${i + 1}`);
          continue;
        }

        const sessionData = JSON.parse(toolCall.function.arguments);
        console.log(`Session ${i + 1} generated: ${sessionData.sessionName}`);

        // Insert session into database
        const { data: insertedSession, error: insertError } = await supabase
          .from("sessions")
          .insert({
            user_id: user.id,
            session_date: sessionDates[i].toISOString(),
            exercises: {
              sessionName: sessionData.sessionName,
              warmup: sessionData.warmup,
              exercises: sessionData.exercises,
              checklist: sessionData.checklist,
              coachNotes: sessionData.coachNotes,
              estimatedTime: sessionData.estimatedTime,
            },
            completed: false,
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

    if (successCount < 1) {
      return new Response(
        JSON.stringify({
          error: "Échec de la génération des séances. Veuillez réessayer.",
          partialSessions: generatedSessions,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create weekly_program record (upsert to avoid duplicates)
    if (successCount > 0) {
      const weekEnd = new Date(week_start_date);
      weekEnd.setDate(weekEnd.getDate() + 7);

      await supabase.from("weekly_programs").upsert({
        user_id: user.id,
        week_start_date: week_start_date,
        week_end_date: weekEnd.toISOString(),
        total_sessions: successCount,
        completed_sessions: 0,
        check_in_completed: false,
      }, { onConflict: "user_id,week_start_date", ignoreDuplicates: false });
    }

    console.log(
      `Weekly program generated: ${successCount}/${frequency} sessions`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        sessions: generatedSessions,
        totalGenerated: successCount,
        historicalContext: historicalContext.summary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in generate-weekly-program:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// =============================================
// Historical context builder
// =============================================
function buildHistoricalContext(
  lastCheckin: any,
  recentFeedback: any[],
  inactivityDays: number | null,
): { prompt: string; summary: string[] } {
  const parts: string[] = [];
  const summaryItems: string[] = [];

  // Inactivity gap detection
  if (inactivityDays !== null && inactivityDays > 14) {
    const weeks = Math.round(inactivityDays / 7);
    parts.push(
      `⚠️ REPRISE APRÈS PAUSE : L'utilisateur reprend après ${weeks} semaine(s) d'inactivité (${inactivityDays} jours depuis la dernière séance). Appliquer une semaine de décharge : réduire le volume de 20% (moins de séries), intensité RPE max 7, exercices basiques polyarticulaires uniquement.`
    );
    summaryItems.push(`Reprise progressive après ${weeks} semaine(s) d'inactivité`);
  }

  // Last check-in data
  if (lastCheckin) {
    const checkinParts: string[] = [];

    if (lastCheckin.rpe_avg) {
      checkinParts.push(`RPE moyen semaine passée: ${lastCheckin.rpe_avg}/10`);
      if (lastCheckin.rpe_avg >= 9) {
        parts.push(`🔴 RPE ÉLEVÉ (${lastCheckin.rpe_avg}/10) : Réduire l'intensité globale de 10-15%. Moins de séries, plus de repos, RPE cible max 7-8.`);
        summaryItems.push("Volume réduit — RPE trop élevé la semaine passée");
      } else if (lastCheckin.rpe_avg <= 6) {
        parts.push(`🟢 RPE FAIBLE (${lastCheckin.rpe_avg}/10) : Augmenter légèrement le volume (+1 série sur les exercices principaux) ou l'intensité.`);
        summaryItems.push("Volume augmenté — RPE confortable la semaine passée");
      }
    }

    if (lastCheckin.has_pain) {
      const zones = Array.isArray(lastCheckin.pain_zones) && lastCheckin.pain_zones.length > 0
        ? lastCheckin.pain_zones.join(", ")
        : "zones non spécifiées";
      parts.push(`🚨 DOULEUR SIGNALÉE (zones: ${zones}) : Éviter ABSOLUMENT les exercices sollicitant ces zones. Proposer des alternatives. Réduire d'1 série par exercice. Priorité à la récupération.`);
      summaryItems.push(`Douleur signalée — exercices adaptés pour ${zones}`);
    }

    if (lastCheckin.energy_level === "low") {
      parts.push(`⚡ ÉNERGIE FAIBLE : Raccourcir les séances, favoriser les supersets pour économiser du temps, réduire le volume total.`);
      summaryItems.push("Séances allégées — énergie faible signalée");
    } else if (lastCheckin.energy_level === "high") {
      parts.push(`⚡ ÉNERGIE ÉLEVÉE : L'utilisateur se sent bien. Tu peux augmenter légèrement le volume ou l'intensité.`);
    }

    if (lastCheckin.adherence_diet !== null && lastCheckin.adherence_diet < 50) {
      parts.push(`🍽️ ADHÉRENCE NUTRITION FAIBLE (${lastCheckin.adherence_diet}%) : Prendre en compte un potentiel déficit énergétique. Ne pas augmenter le volume.`);
    }

    if (checkinParts.length > 0) {
      parts.unshift(`## DONNÉES CHECK-IN SEMAINE PRÉCÉDENTE\n${checkinParts.join(" | ")}`);
    }
  }

  // Recent session feedback
  if (recentFeedback.length > 0) {
    const avgRpe = recentFeedback
      .filter(f => f.rpe !== null)
      .reduce((sum, f) => sum + (f.rpe || 0), 0) / Math.max(recentFeedback.filter(f => f.rpe !== null).length, 1);

    if (avgRpe > 0) {
      parts.push(`📊 RPE MOYEN DES 3 DERNIÈRES SÉANCES: ${avgRpe.toFixed(1)}/10`);
    }

    const hasPainFeedback = recentFeedback.some(f => f.had_pain);
    if (hasPainFeedback) {
      parts.push(`⚕️ DOULEUR SIGNALÉE LORS DE SÉANCES RÉCENTES : Adapter les exercices en conséquence.`);
    }
  }

  const promptSection = parts.length > 0
    ? `\n## CONTEXTE HISTORIQUE À PRENDRE EN COMPTE IMPÉRATIVEMENT\n\n${parts.join("\n\n")}\n`
    : "";

  return {
    prompt: promptSection,
    summary: summaryItems,
  };
}

const getSplitTypes = (split: string, frequency: number): string[] => {
  switch (split) {
    case "upper_lower":
      return [
        "Upper Body",
        "Lower Body",
        "Upper Body",
        "Lower Body",
        "Full Body",
        "Upper Body",
      ].slice(0, frequency);
    case "ppl":
      return ["Push", "Pull", "Legs", "Push", "Pull", "Legs"].slice(
        0,
        frequency,
      );
    case "body_part":
      return [
        "Pectoraux & Triceps",
        "Dos & Biceps",
        "Jambes",
        "Épaules",
        "Full Body",
        "Bras",
      ].slice(0, frequency);
    default:
      return Array(frequency).fill("Full Body");
  }
};

const buildSessionPrompt = (
  sessionNumber: number,
  sessionType: string,
  duration: number,
  goals: Record<string, any>,
  preferences: Record<string, any> | null,
  historicalContext: { prompt: string; summary: string[] },
) => {
  // Build user profile details
  const age = goals.age ? `${goals.age} ans` : "Non renseigné";
  const sex =
    goals.sex === "male"
      ? "Homme"
      : goals.sex === "female"
        ? "Femme"
        : "Non renseigné";
  const weight = goals.weight ? `${goals.weight} kg` : "Non renseigné";
  const height = goals.height ? `${goals.height} cm` : "Non renseigné";

  const healthConditions =
    Array.isArray(goals.health_conditions) && goals.health_conditions.length > 0
      ? goals.health_conditions.join(", ")
      : "Aucune";

  const equipment =
    Array.isArray(goals.equipment) && goals.equipment.length > 0
      ? goals.equipment.join(", ")
      : "Équipement standard de salle";

  const priorityZones =
    Array.isArray(preferences?.priority_zones) &&
    preferences.priority_zones.length > 0
      ? preferences.priority_zones.join(", ")
      : "Aucune priorité spécifique";

  const limitations =
    Array.isArray(preferences?.limitations) &&
    preferences.limitations.length > 0
      ? preferences.limitations.join(", ")
      : "Aucune limitation";

  const experienceLevel = preferences?.experience_level || "intermediate";
  const sessionTypePreference = preferences?.session_type || "strength";
  const cardioIntensity = preferences?.cardio_intensity || "moderate";
  const progressionFocus = preferences?.progression_focus || "balanced";
  const mobilityPreference = preferences?.mobility_preference || "standard";
  const favoriteExercises = preferences?.favorite_exercises || "Aucun spécifié";
  const exercisesToAvoid = preferences?.exercises_to_avoid || "Aucun";

  const goalTypeLabels: Record<string, string> = {
    lose_weight: "Perte de poids",
    gain_muscle: "Prise de masse",
    maintain: "Maintien",
    improve_strength: "Gain de force",
    improve_endurance: "Amélioration endurance",
    general_fitness: "Forme générale",
  };
  const goalLabel = Array.isArray(goals.goal_type) ? goals.goal_type.map((g: string) => goalTypeLabels[g] || g).join(' + ') : (goalTypeLabels[goals.goal_type] || goals.goal_type);

  const levelConfig = {
    beginner: {
      sets: "2-3",
      rpe: "5-7",
      rir: "3-4",
      exercises: 4,
      rest: "90-120s",
    },
    intermediate: {
      sets: "3-4",
      rpe: "7-8",
      rir: "2-3",
      exercises: 5,
      rest: "60-90s",
    },
    advanced: {
      sets: "4-5",
      rpe: "8-9",
      rir: "1-2",
      exercises: 6,
      rest: "45-75s",
    },
  };
  const config =
    levelConfig[experienceLevel as keyof typeof levelConfig] ||
    levelConfig.intermediate;

  const systemPrompt = `Tu es un préparateur physique professionnel certifié avec 15 ans d'expérience. Tu crées des programmes d'entraînement personnalisés, précis et efficaces.

## RÈGLES STRICTES DE FORMATAGE

1. **TITRES**: Courts, descriptifs, sans numérotation (ex: "Push - Force", "Lower Body - Hypertrophie")
2. **EXERCICES**: Nom technique correct en français (ex: "Développé couché", pas "Bench press")
3. **AUCUN BLABLA**: Phrases courtes, directes, sans émojis, sans formules de politesse
4. **CONSEILS**: Techniques et actionnables, pas de généralités
${historicalContext.prompt}
## PARAMÈTRES SELON LE NIVEAU ${experienceLevel.toUpperCase()}

- Séries par exercice: ${config.sets}
- RPE cible: ${config.rpe}
- RIR cible: ${config.rir}
- Nombre d'exercices: ${config.exercises}-${config.exercises + 2}
- Repos entre séries: ${config.rest}

## EXEMPLES DE BONNE GÉNÉRATION

### Exemple échauffement:
- "Vélo ou rameur - 5 min, intensité légère"
- "Rotations d'épaules - 30s chaque sens"
- "Activation des fessiers au sol - 10 reps/côté"
- "Mobilité thoracique - 8 rotations/côté"

### Exemple exercice bien formaté:
{
  "name": "Squat arrière",
  "sets": 4,
  "reps": "6-8",
  "rest": 120,
  "rpe": 8,
  "rir": 2,
  "tips": ["Poitrine haute, regard devant", "Descendre jusqu'à la parallèle minimum"],
  "commonMistakes": ["Genoux qui rentrent", "Dos qui s'arrondit en bas"],
  "alternatives": ["Squat goblet", "Presse à cuisses"]
}

### Exemple checklist:
- "Bouteille d'eau remplie"
- "Échauffement articulaire fait"
- "Matériel vérifié et disponible"
- "Zone d'entraînement dégagée"

### Exemple coachNotes:
"Concentre-toi sur la qualité d'exécution plutôt que la charge. Augmente le poids uniquement si tu respectes les RIR cibles."

## ADAPTATIONS SPÉCIFIQUES

### Selon l'objectif "${goalLabel}":
${(Array.isArray(goals.goal_type) ? goals.goal_type : [goals.goal_type]).some((g: string) => g === "lose_weight" || g === "weight-loss") ? "- Tempo élevé, repos courts, circuits possibles\n- Privilégier exercices polyarticulaires" : ""}
${(Array.isArray(goals.goal_type) ? goals.goal_type : [goals.goal_type]).some((g: string) => g === "gain_muscle" || g === "muscle-gain") ? "- Volume élevé, tempo contrôlé (3-1-2)\n- Isolation en fin de séance" : ""}
${(Array.isArray(goals.goal_type) ? goals.goal_type : [goals.goal_type]).some((g: string) => g === "improve_strength" || g === "strength") ? "- Charges lourdes, repos longs\n- Focus sur les 3 mouvements principaux" : ""}
${(Array.isArray(goals.goal_type) ? goals.goal_type : [goals.goal_type]).some((g: string) => g === "improve_endurance" || g === "endurance") ? "- Séries longues, peu de repos\n- Supersets et circuits" : ""}

### Selon la progression "${progressionFocus}":
${progressionFocus === "strength" ? "- Privilégier les charges lourdes et le travail en force (1-6 reps)" : ""}
${progressionFocus === "hypertrophy" ? "- Privilégier le volume (8-15 reps) et le temps sous tension" : ""}
${progressionFocus === "endurance" ? "- Privilégier les séries longues (15-25 reps) et les circuits" : ""}
${progressionFocus === "balanced" ? "- Alterner force (6-8 reps), hypertrophie (10-12 reps) et endurance (15+ reps)" : ""}

### Selon la mobilité "${mobilityPreference}":
${mobilityPreference === "minimal" ? "- Échauffement court et ciblé (5 min max)" : ""}
${mobilityPreference === "standard" ? "- Échauffement standard avec mobilité articulaire (8-10 min)" : ""}
${mobilityPreference === "extensive" ? "- Échauffement complet avec mobilité dynamique et activation (12-15 min)" : ""}

### Selon le cardio "${cardioIntensity}":
${cardioIntensity === "liss" ? "- Finir par 10-15 min de cardio basse intensité" : ""}
${cardioIntensity === "hiit" ? "- Intégrer des finishers HIIT (Tabata, EMOM)" : ""}
${cardioIntensity === "miss" ? "- Cardio modéré en échauffement ou finisher" : ""}

## CONDITIONS DE SANTÉ À RESPECTER

${
  healthConditions !== "Aucune"
    ? `ATTENTION - Adapter pour: ${healthConditions}
- Éviter les mouvements contre-indiqués
- Proposer des alternatives sécuritaires
- Réduire l'intensité si nécessaire`
    : "Aucune condition particulière."
}

## LIMITATIONS PHYSIQUES

${
  limitations !== "Aucune limitation"
    ? `OBLIGATOIRE - Contourner: ${limitations}
- Ne pas prescrire d'exercices aggravant ces zones
- Proposer des alternatives systématiquement`
    : "Aucune limitation signalée."
}`;

  const userPrompt = `## SÉANCE À GÉNÉRER

**Numéro**: Séance ${sessionNumber}
**Type**: ${sessionType}
**Durée cible**: ${duration} minutes

## PROFIL COMPLET DE L'ATHLÈTE

| Donnée | Valeur |
|--------|--------|
| Âge | ${age} |
| Sexe | ${sex} |
| Poids | ${weight} |
| Taille | ${height} |
| Objectif | ${goalLabel} |
| Niveau | ${experienceLevel} |
| Lieu | ${goals.location === "home" ? "À domicile" : goals.location === "gym" ? "Salle de sport" : "Extérieur"} |
| Équipement | ${equipment} |

## PRÉFÉRENCES D'ENTRAÎNEMENT

| Préférence | Valeur |
|------------|--------|
| Type de séance | ${sessionTypePreference} |
| Intensité cardio | ${cardioIntensity} |
| Focus progression | ${progressionFocus} |
| Mobilité | ${mobilityPreference} |
| Zones prioritaires | ${priorityZones} |
| Exercices favoris | ${favoriteExercises} |

## CONTRAINTES OBLIGATOIRES

- **Conditions de santé**: ${healthConditions}
- **Limitations physiques**: ${limitations}
- **Exercices à éviter**: ${exercisesToAvoid}

## OUTPUT ATTENDU

Génère une séance "${sessionType}" professionnelle de ${duration} minutes avec:
- ${config.exercises}-${config.exercises + 2} exercices principaux
- RPE moyen: ${config.rpe}
- Temps de repos: ${config.rest}

PRIORITÉ: ${priorityZones !== "Aucune priorité spécifique" ? `Cibler particulièrement ${priorityZones}` : "Équilibre global"}`;

  return { systemPrompt, userPrompt };
};
