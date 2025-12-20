import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  getLocalExerciseImage, 
  DEFAULT_EXERCISE_IMAGE,
  type ExerciseImageData 
} from "@/data/exerciseImages";

interface ExerciseImageResult {
  imageUrl: string;
  gifUrl?: string;
  muscleGroup?: string;
  isLoading: boolean;
  isFromCache: boolean;
  source: "local" | "api" | "fallback";
}

// Fetch from API via edge function
const fetchExerciseImageFromAPI = async (exerciseName: string): Promise<ExerciseImageData | null> => {
  try {
    const { data, error } = await supabase.functions.invoke("get-exercise-image", {
      body: { exerciseName }
    });
    
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

export const useExerciseImage = (exerciseName: string): ExerciseImageResult => {
  const [result, setResult] = useState<ExerciseImageResult>({
    imageUrl: DEFAULT_EXERCISE_IMAGE,
    isLoading: true,
    isFromCache: false,
    source: "fallback"
  });

  // First, try local dictionary (synchronous)
  useEffect(() => {
    if (!exerciseName) {
      setResult({
        imageUrl: DEFAULT_EXERCISE_IMAGE,
        isLoading: false,
        isFromCache: false,
        source: "fallback"
      });
      return;
    }

    const localImage = getLocalExerciseImage(exerciseName);
    if (localImage) {
      setResult({
        imageUrl: localImage.imageUrl,
        gifUrl: localImage.gifUrl,
        muscleGroup: localImage.muscleGroup,
        isLoading: false,
        isFromCache: true,
        source: "local"
      });
    }
  }, [exerciseName]);

  // If not found locally, query the API
  const { data: apiData, isLoading: apiLoading } = useQuery({
    queryKey: ["exercise-image", exerciseName],
    queryFn: () => fetchExerciseImageFromAPI(exerciseName),
    enabled: !!exerciseName && !getLocalExerciseImage(exerciseName),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // Update result when API data arrives
  useEffect(() => {
    const localImage = getLocalExerciseImage(exerciseName);
    
    if (localImage) {
      // Already handled in the first useEffect
      return;
    }

    if (apiLoading) {
      setResult(prev => ({ ...prev, isLoading: true }));
      return;
    }

    if (apiData) {
      setResult({
        imageUrl: apiData.imageUrl,
        gifUrl: apiData.gifUrl,
        muscleGroup: apiData.muscleGroup,
        isLoading: false,
        isFromCache: false,
        source: "api"
      });
    } else {
      // Fallback to default
      setResult({
        imageUrl: DEFAULT_EXERCISE_IMAGE,
        isLoading: false,
        isFromCache: false,
        source: "fallback"
      });
    }
  }, [exerciseName, apiData, apiLoading]);

  return result;
};

// Simple hook to get just the image URL (for simpler use cases)
export const useExerciseImageUrl = (exerciseName: string): string => {
  const { imageUrl } = useExerciseImage(exerciseName);
  return imageUrl;
};

// Hook to get the GIF URL if available, otherwise image URL
export const useExerciseGif = (exerciseName: string): { url: string; isGif: boolean; isLoading: boolean } => {
  const { gifUrl, imageUrl, isLoading } = useExerciseImage(exerciseName);
  return {
    url: gifUrl || imageUrl,
    isGif: !!gifUrl,
    isLoading
  };
};
