import { useState } from "react";

const STORAGE_KEY = "trainingSetupData";

export interface TrainingSetupData {
  sessionType?: "strength" | "cardio" | "mixed" | "mobility";
  experienceLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  splitPreference?: "full_body" | "upper_lower" | "ppl" | "body_part";
  cardioIntensity?: "liss" | "miss" | "hiit" | "mixed";
  priorityZones?: string[];
  limitations?: string[];
  limitationsOther?: string;
  favoriteExercises?: string;
  exercisesToAvoid?: string;
  progressionFocus?: "strength" | "reps" | "rest" | "technique" | "auto";
  mobilityPreference?: "every_session" | "dedicated" | "occasional" | "none";
}

export const useTrainingSetup = () => {
  const [data, setData] = useState<TrainingSetupData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const saveProgress = (newData: Partial<TrainingSetupData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearTrainingSetup = () => {
    setData({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const getData = () => {
    return data;
  };

  return {
    data,
    saveProgress,
    clearTrainingSetup,
    getData,
  };
};
