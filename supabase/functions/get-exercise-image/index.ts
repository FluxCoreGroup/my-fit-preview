import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Normalize exercise name for lookup
const normalizeExerciseName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Translate common French exercise names to English for API lookup
const frenchToEnglishMap: Record<string, string> = {
  "developpe couche": "bench press",
  "developpe incline": "incline bench press",
  "squat": "squat",
  "soulevé de terre": "deadlift",
  "tractions": "pull up",
  "rowing": "row",
  "curl": "bicep curl",
  "extension triceps": "tricep extension",
  "presse a cuisses": "leg press",
  "fentes": "lunge",
  "elevations laterales": "lateral raise",
  "developpe militaire": "overhead press",
  "tirage vertical": "lat pulldown",
  "tirage horizontal": "seated row",
  "hip thrust": "hip thrust",
  "leg curl": "leg curl",
  "leg extension": "leg extension",
  "crunch": "crunch",
  "gainage": "plank",
  "pompes": "push up",
  "dips": "dips"
};

// Get English term for API search
const getEnglishTerm = (frenchName: string): string => {
  const normalized = normalizeExerciseName(frenchName);
  
  // Direct match
  if (frenchToEnglishMap[normalized]) {
    return frenchToEnglishMap[normalized];
  }
  
  // Partial match
  for (const [french, english] of Object.entries(frenchToEnglishMap)) {
    if (normalized.includes(french) || french.includes(normalized)) {
      return english;
    }
  }
  
  // Return original if no translation found (might work for English names)
  return frenchName;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exerciseName } = await req.json();
    
    if (!exerciseName) {
      return new Response(
        JSON.stringify({ error: "Exercise name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Looking up exercise image for: ${exerciseName}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalizedName = normalizeExerciseName(exerciseName);

    // 1. Check cache first
    const { data: cached } = await supabase
      .from("exercise_image_cache")
      .select("*")
      .eq("exercise_name_normalized", normalizedName)
      .single();

    if (cached) {
      console.log(`Cache hit for: ${exerciseName}`);
      return new Response(
        JSON.stringify({
          imageUrl: cached.image_url,
          gifUrl: cached.gif_url,
          muscleGroup: cached.muscle_group,
          source: "cache"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Try Wger API (free, no API key needed)
    const englishTerm = getEnglishTerm(exerciseName);
    console.log(`Searching Wger API for: ${englishTerm}`);

    try {
      const wgerResponse = await fetch(
        `https://wger.de/api/v2/exercise/?language=2&limit=5&name=${encodeURIComponent(englishTerm)}`,
        { headers: { "Accept": "application/json" } }
      );

      if (wgerResponse.ok) {
        const wgerData = await wgerResponse.json();
        
        if (wgerData.results && wgerData.results.length > 0) {
          const exercise = wgerData.results[0];
          
          // Get images for this exercise
          const imagesResponse = await fetch(
            `https://wger.de/api/v2/exerciseimage/?exercise_base=${exercise.exercise_base}&limit=1`,
            { headers: { "Accept": "application/json" } }
          );

          let imageUrl = null;
          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();
            if (imagesData.results && imagesData.results.length > 0) {
              imageUrl = imagesData.results[0].image;
            }
          }

          if (imageUrl) {
            // Cache the result
            await supabase.from("exercise_image_cache").insert({
              exercise_name: exerciseName,
              exercise_name_normalized: normalizedName,
              image_url: imageUrl,
              muscle_group: exercise.category?.name || null,
              source: "wger"
            });

            console.log(`Found and cached image from Wger for: ${exerciseName}`);

            return new Response(
              JSON.stringify({
                imageUrl,
                muscleGroup: exercise.category?.name,
                source: "wger"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      }
    } catch (wgerError) {
      console.error("Wger API error:", wgerError);
    }

    // 3. Fallback - return null (frontend will use default)
    console.log(`No image found for: ${exerciseName}`);
    return new Response(
      JSON.stringify({ 
        imageUrl: null,
        source: "not_found"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in get-exercise-image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
