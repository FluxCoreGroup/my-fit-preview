import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNutrition = () => {
  const { user } = useAuth();

  const { data: goals } = useQuery({
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

  const calculateBMI = () => {
    if (!goals?.weight || !goals?.height) return null;
    const heightInM = goals.height / 100;
    return Math.round((goals.weight / (heightInM * heightInM)) * 10) / 10;
  };

  const calculateBMR = () => {
    if (!goals?.weight || !goals?.height || !goals?.age || !goals?.sex) return null;
    
    // Mifflin-St Jeor Formula
    let bmr = 10 * goals.weight + 6.25 * goals.height - 5 * goals.age;
    bmr += goals.sex === "male" ? 5 : -161;
    
    return Math.round(bmr);
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
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
  };

  const getTargetCalories = () => {
    const tdee = calculateTDEE();
    if (!tdee || !goals?.goal_type) return null;

    if (goals.goal_type === "weight_loss") {
      return Math.round(tdee - 500); // Deficit of 500kcal
    } else if (goals.goal_type === "muscle_gain") {
      return Math.round(tdee + 300); // Surplus of 300kcal
    }
    return tdee; // Maintenance
  };

  const getMacros = () => {
    const targetCalories = getTargetCalories();
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
  };

  return {
    bmi: calculateBMI(),
    bmr: calculateBMR(),
    tdee: calculateTDEE(),
    targetCalories: getTargetCalories(),
    macros: getMacros(),
    goals,
  };
};
