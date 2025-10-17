import { useState, useEffect } from "react";
import type { OnboardingInput } from "@/services/planner";

const STORAGE_KEY = "onboardingData";

export const useOnboarding = () => {
  const [data, setData] = useState<Partial<OnboardingInput>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const saveProgress = (newData: Partial<OnboardingInput>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearOnboarding = () => {
    setData({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasInProgressOnboarding = () => {
    return Object.keys(data).length > 0;
  };

  const getData = () => {
    return data;
  };

  return {
    data,
    saveProgress,
    clearOnboarding,
    hasInProgressOnboarding,
    getData,
  };
};
