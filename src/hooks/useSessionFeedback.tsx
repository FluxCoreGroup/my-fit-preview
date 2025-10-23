import { useState } from "react";

interface ExerciseLog {
  exerciseName: string;
  setNumber: number;
  weightUsed: number;
  rpe: number;
}

export const useSessionFeedback = () => {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);

  const logSet = (
    exerciseName: string,
    setNumber: number,
    weightUsed: number,
    rpe: number
  ) => {
    setExerciseLogs(prev => [
      ...prev,
      { exerciseName, setNumber, weightUsed, rpe }
    ]);
  };

  const getLastWeight = (exerciseName: string): number | null => {
    const logs = exerciseLogs.filter(log => log.exerciseName === exerciseName);
    if (logs.length === 0) return null;
    
    const lastLog = logs[logs.length - 1];
    return lastLog.weightUsed;
  };

  const getSuggestedWeight = (exerciseName: string): number | null => {
    const lastWeight = getLastWeight(exerciseName);
    if (!lastWeight) return null;
    
    // Suggest +2.5% for next session
    return Math.round(lastWeight * 1.025 * 2) / 2; // Round to nearest 0.5
  };

  const clearLogs = () => {
    setExerciseLogs([]);
  };

  return {
    exerciseLogs,
    logSet,
    getLastWeight,
    getSuggestedWeight,
    clearLogs
  };
};