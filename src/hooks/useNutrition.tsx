import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNutrition = () => {
  const { user } = useAuth();

  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const bmi = useMemo(() => {
    if (!goals?.weight || !goals?.height) return null;
    const heightInM = goals.height / 100;
    return Math.round((goals.weight / (heightInM * heightInM)) * 10) / 10;
  }, [goals?.weight, goals?.height]);

  const bmr = useMemo(() => {
    if (!goals?.weight || !goals?.height || !goals?.age || !goals?.sex) return null;
    
    // Mifflin-St Jeor Formula
    let bmr = 10 * goals.weight + 6.25 * goals.height - 5 * goals.age;
    bmr += goals.sex === "male" ? 5 : -161;
    
    return Math.round(bmr);
  }, [goals?.weight, goals?.height, goals?.age, goals?.sex]);

  const tdee = useMemo(() => {
    if (!bmr || !goals?.activity_level) return null;

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const multiplier = activityMultipliers[goals.activity_level] || 1.55;
    return Math.round(bmr * multiplier);
  }, [bmr, goals?.activity_level]);

  const targetCalories = useMemo(() => {
    if (!tdee || !goals?.goal_type) return null;

    if (goals.goal_type === "weight_loss") {
      return Math.round(tdee - 500); // Deficit of 500kcal
    } else if (goals.goal_type === "muscle_gain") {
      return Math.round(tdee + 300); // Surplus of 300kcal
    }
    return tdee; // Maintenance
  }, [tdee, goals?.goal_type]);

  const macros = useMemo(() => {
    if (!targetCalories || !goals?.weight) return null;

    // Protein: 2g per kg body weight
    const protein = Math.round(goals.weight * 2);
    
    // Fat: 1g per kg body weight
    const fat = Math.round(goals.weight * 1);
    
    // Carbs: remaining calories
    const proteinCals = protein * 4;
    const fatCals = fat * 9;
    const carbCals = targetCalories - proteinCals - fatCals;
    const carbs = Math.round(carbCals / 4);

    return { protein, fat, carbs };
  }, [targetCalories, goals?.weight]);

  return {
    bmi,
    bmr,
    tdee,
    targetCalories,
    macros,
    goals,
    isLoading,
  };
};
