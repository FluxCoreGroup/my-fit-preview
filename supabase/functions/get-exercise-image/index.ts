import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Normalize exercise name for lookup
const normalizeExerciseName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Translate common French exercise names to English for ExerciseDB API
const frenchToEnglishMap: Record<string, string> = {
  "developpe couche": "bench press",
  "developpe incline": "incline bench press",
  "developpe decline": "decline bench press",
  "developpe militaire": "overhead press",
  "developpe epaules": "shoulder press",
  "developpe halteres": "dumbbell press",
  "souleve de terre": "deadlift",
  squat: "squat",
  tractions: "pull up",
  rowing: "row",
  "tirage vertical": "lat pulldown",
  "tirage horizontal": "seated row",
  curl: "curl",
  "extension triceps": "tricep extension",
  "extensions triceps": "tricep extension",
  "presse a cuisses": "leg press",
  fentes: "lunge",
  "elevations laterales": "lateral raise",
  "leg curl": "leg curl",
  "leg extension": "leg extension",
  "hip thrust": "hip thrust",
  crunch: "crunch",
  gainage: "plank",
  planche: "plank",
  pompes: "push up",
  dips: "dips",
  mollets: "calf raise",
};

// Translate French to English for better API results
const translateToEnglish = (frenchName: string): string => {
  const normalized = normalizeExerciseName(frenchName);

  // Direct match
  if (frenchToEnglishMap[normalized]) {
    return frenchToEnglishMap[normalized];
  }

  // Partial match
  for (const [french, english] of Object.entries(frenchToEnglishMap)) {
    if (normalized.includes(french)) {
      return english;
    }
  }

  // Return original (might already be in English)
  return frenchName;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exerciseName, englishName } = await req.json();

    if (!exerciseName) {
      return new Response(
        JSON.stringify({ error: "Exercise name is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `Looking up exercise image for: ${exerciseName}${englishName ? ` (${englishName})` : ""}`,
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalizedName = normalizeExerciseName(exerciseName);

    // 1. Check cache first
    // const { data: cached } = await supabase
    //   .from("exercise_image_cache")
    //   .select("*")
    //   .eq("exercise_name_normalized", normalizedName)
    //   .single();

    // if (cached) {
    //   console.log(`✅ Cache hit for: ${exerciseName}`);
    //   return new Response(
    //     JSON.stringify({
    //       imageUrl: cached.image_url,
    //       gifUrl: cached.gif_url,
    //       source: "cache",
    //     }),
    //     { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    //   );
    // }

    // 2. Search ExerciseDB API with fuzzy matching
    // Use englishName if provided, otherwise translate from French
    const searchTerm = englishName || translateToEnglish(exerciseName);
    console.log(
      `🔍 Searching ExerciseDB for: "${exerciseName}" -> "${searchTerm}"${englishName ? " (direct)" : " (translated)"}`,
    );

    try {
      const exerciseDbUrl = `https://exercisedb.dev/api/v1/exercises/search?q=${encodeURIComponent(searchTerm)}&limit=1&threshold=0.3`;
      console.log(`API URL: ${exerciseDbUrl}`);

      const response = await fetch(exerciseDbUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          `ExerciseDB API error: ${response.status} ${response.statusText}`,
        );
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      console.log(`Found ${data.data?.length || 0} exercises`);

      if (data.success && data.data && data.data.length > 0) {
        const exercise = data.data[0];
        console.log(`✅ Match found: ${exercise.name}`);
        console.log(`GIF URL: ${exercise.gifUrl}`);

        // Cache the result
        const cacheData = {
          exercise_name: exerciseName,
          exercise_name_normalized: normalizedName,
          image_url: exercise.gifUrl, // ExerciseDB provides GIF as main image
          gif_url: exercise.gifUrl,
          source: "exercisedb",
        };

        const { error: cacheError } = await supabase
          .from("exercise_image_cache")
          .insert(cacheData);

        return new Response(
          JSON.stringify({
            imageUrl: exercise.gifUrl,
            gifUrl: exercise.gifUrl,
            source: "exercisedb",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      console.log(`❌ No exercises found for: ${exerciseName}`);
    } catch (apiError) {
      console.error("ExerciseDB API error:", apiError);
    }

    // 3. Fallback - return null (frontend will use default)
    console.log(`⚠️ Returning fallback for: ${exerciseName}`);
    return new Response(
      JSON.stringify({
        imageUrl: null,
        gifUrl: null,
        source: "not_found",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in get-exercise-image:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
