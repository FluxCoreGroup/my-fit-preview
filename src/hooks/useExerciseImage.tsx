import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_EXERCISE_IMAGE } from "@/data/exerciseImages";

interface ExerciseImageData {
  imageUrl: string;
  gifUrl?: string;
  muscleGroup?: string;
  source?: string;
}

interface ExerciseImageResult {
  imageUrl: string;
  gifUrl?: string;
  muscleGroup?: string;
  isLoading: boolean;
  isFromCache: boolean;
  source: "local" | "api" | "fallback";
}

// Fetch from API via edge function
const fetchExerciseImageFromAPI = async (
  exerciseName: string,
  englishName?: string,
): Promise<ExerciseImageData | null> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "get-exercise-image",
      {
        body: { exerciseName, englishName },
      },
    );

    if (error) {
      console.error("Error fetching exercise image:", error);
      return null;
    }

    return data as ExerciseImageData;
  } catch (err) {
    console.error("Failed to fetch exercise image:", err);
    return null;
  }
};

export const useExerciseImage = (
  exerciseName: string,
  englishName?: string,
): ExerciseImageResult => {
  // Query ExerciseDB API via edge function
  const { data: apiData, isLoading } = useQuery({
    queryKey: ["exercise-image", exerciseName, englishName],
    queryFn: () => fetchExerciseImageFromAPI(exerciseName, englishName),
    enabled: !!exerciseName,
    staleTime: 1000 * 60 * 60, // 1 hour - cache in React Query
    gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep in memory
  });

  // Return loading state
  if (!exerciseName || isLoading) {
    return {
      imageUrl: DEFAULT_EXERCISE_IMAGE,
      isLoading: true,
      isFromCache: false,
      source: "fallback",
    };
  }

  // Return API data with GIF
  if (apiData && apiData.imageUrl) {
    return {
      imageUrl: apiData.imageUrl,
      gifUrl: apiData.gifUrl,
      muscleGroup: apiData.muscleGroup,
      isLoading: false,
      isFromCache: apiData.source === "cache",
      source: "api",
    };
  }

  // Fallback to default image
  return {
    imageUrl: DEFAULT_EXERCISE_IMAGE,
    isLoading: false,
    isFromCache: false,
    source: "fallback",
  };
};

// Simple hook to get just the image URL (for simpler use cases)
export const useExerciseImageUrl = (exerciseName: string): string => {
  const { imageUrl } = useExerciseImage(exerciseName);
  return imageUrl;
};

// Hook to get the GIF URL if available, otherwise image URL
export const useExerciseGif = (
  exerciseName: string,
): { url: string; isGif: boolean; isLoading: boolean } => {
  const { gifUrl, imageUrl, isLoading } = useExerciseImage(exerciseName);
  return {
    url: gifUrl || imageUrl,
    isGif: !!gifUrl,
    isLoading,
  };
};
