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
      console.log("🔍 [useNutrition] Goals loaded:", data);
      return data;
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: true,
  });

  console.log("🔍 [useNutrition] Current state:", { user: user?.id, goals, isLoading });

  const bmi = useMemo(() => {
    if (!goals?.weight || !goals?.height) {
      console.log("⚠️ [BMI] Missing data:", { weight: goals?.weight, height: goals?.height });
      return null;
    }
    const heightInM = goals.height / 100;
    const result = Math.round((goals.weight / (heightInM * heightInM)) * 10) / 10;
    console.log("✅ [BMI] Calculated:", result);
    return result;
  }, [goals?.weight, goals?.height]);

  const bmr = useMemo(() => {
    if (!goals?.weight || !goals?.height || !goals?.age || !goals?.sex) {
      console.log("⚠️ [BMR] Missing data:", { 
        weight: goals?.weight, 
        height: goals?.height, 
        age: goals?.age, 
        sex: goals?.sex 
      });
      return null;
    }
    
    // Mifflin-St Jeor Formula
    let bmr = 10 * goals.weight + 6.25 * goals.height - 5 * goals.age;
    bmr += goals.sex === "male" ? 5 : -161;
    const result = Math.round(bmr);
    console.log("✅ [BMR] Calculated:", result, "kcal/day");
    
    return result;
  }, [goals?.weight, goals?.height, goals?.age, goals?.sex]);

  const tdee = useMemo(() => {
    if (!bmr || !goals?.activity_level) {
      console.log("⚠️ [TDEE] Missing data:", { bmr, activity_level: goals?.activity_level });
      return null;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const multiplier = activityMultipliers[goals.activity_level] || 1.55;
    const result = Math.round(bmr * multiplier);
    console.log("✅ [TDEE] Calculated:", result, "kcal/day", `(BMR ${bmr} × ${multiplier})`);
    return result;
  }, [bmr, goals?.activity_level]);

  const targetCalories = useMemo(() => {
    if (!tdee || !goals?.goal_type) {
      console.log("⚠️ [Target Calories] Missing data:", { tdee, goal_type: goals?.goal_type });
      return null;
    }

    let result: number;
    let adjustmentType: string;

    if (goals.goal_type === "weight-loss") {
      result = Math.round(tdee - 500); // Deficit of 500kcal
      adjustmentType = "Deficit -500kcal";
    } else if (goals.goal_type === "muscle-gain") {
      result = Math.round(tdee + 300); // Surplus of 300kcal
      adjustmentType = "Surplus +300kcal";
    } else {
      result = tdee; // Maintenance (endurance, strength, general-fitness)
      adjustmentType = "Maintenance";
    }
    
    console.log(`✅ [Target Calories] Calculated:`, result, "kcal/day", `(${adjustmentType} for ${goals.goal_type})`);
    return result;
  }, [tdee, goals?.goal_type]);

  const macros = useMemo(() => {
    if (!targetCalories || !goals?.weight) {
      console.log("⚠️ [Macros] Missing data:", { targetCalories, weight: goals?.weight });
      return null;
    }

    // Protein: 2g per kg body weight
    const protein = Math.round(goals.weight * 2);
    
    // Fat: 1g per kg body weight
    const fat = Math.round(goals.weight * 1);
    
    // Carbs: remaining calories
    const proteinCals = protein * 4;
    const fatCals = fat * 9;
    const carbCals = targetCalories - proteinCals - fatCals;
    const carbs = Math.round(carbCals / 4);

    const result = { protein, fat, carbs };
    console.log("✅ [Macros] Calculated:", result, `(P:${protein}g F:${fat}g C:${carbs}g)`);
    return result;
  }, [targetCalories, goals?.weight]);

  // Advanced metrics
  const fiber = useMemo(() => {
    if (!targetCalories) return null;
    return Math.round((targetCalories / 1000) * 14); // 14g per 1000 kcal
  }, [targetCalories]);

  const mealDistribution = useMemo(() => {
    if (!goals?.meals_per_day) return null;
    
    const mealsCount = goals.meals_per_day;
    if (mealsCount === 3) {
      return { breakfast: 30, lunch: 40, dinner: 30 };
    } else if (mealsCount === 4) {
      return { breakfast: 25, lunch: 35, dinner: 30, snack: 10 };
    } else if (mealsCount === 5) {
      return { breakfast: 20, snack1: 10, lunch: 30, snack2: 10, dinner: 30 };
    }
    return null;
  }, [goals?.meals_per_day]);

  const hydrationGoal = useMemo(() => {
    if (!goals?.weight) return 2500; // default 2.5L
    const baseWater = goals.weight * 33; // 33ml per kg
    const activityBonus = goals?.frequency ? goals.frequency * 250 : 0; // +250ml per training day
    return Math.round(baseWater + activityBonus);
  }, [goals?.weight, goals?.frequency]);

  const macroTiming = useMemo(() => {
    if (!macros) return null;
    return {
      preWorkout: { carbs: Math.round(macros.carbs * 0.3), protein: Math.round(macros.protein * 0.2) },
      postWorkout: { carbs: Math.round(macros.carbs * 0.3), protein: Math.round(macros.protein * 0.3) },
    };
  }, [macros]);

  const bodyFat = useMemo(() => {
    if (!bmi || !goals?.age || !goals?.sex) return null;
    // Deurenberg formula
    const sexFactor = goals.sex === "male" ? 1 : 0;
    return Math.round((1.2 * bmi + 0.23 * goals.age - 10.8 * sexFactor - 5.4) * 10) / 10;
  }, [bmi, goals?.age, goals?.sex]);

  const micronutrients = useMemo(() => {
    if (!goals?.sex) return null;
    const isMale = goals.sex === "male";
    return {
      iron: isMale ? "8mg" : "18mg",
      calcium: "1000mg",
      vitaminD: "15µg",
      omega3: "1.6g (H) / 1.1g (F)",
      sodium: "2300mg max",
      potassium: "3400mg (H) / 2600mg (F)",
    };
  }, [goals?.sex]);

  return {
    bmi,
    bmr,
    tdee,
    targetCalories,
    macros,
    fiber,
    mealDistribution,
    hydrationGoal,
    macroTiming,
    bodyFat,
    micronutrients,
    goals,
    isLoading,
  };
};
