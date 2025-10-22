import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Apple } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const NutritionDayCard = () => {
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

  // Calculate TDEE and target calories (simplified)
  const calculateTDEE = () => {
    if (!goals) return 2000;
    const { weight, height, age, sex, activity_level } = goals;
    if (!weight || !height || !age) return 2000;

    // Mifflin-St Jeor
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += sex === "male" ? 5 : -161;

    // Activity multiplier
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const multiplier = activityMultipliers[activity_level || "moderate"] || 1.55;
    
    return Math.round(bmr * multiplier);
  };

  const tdee = calculateTDEE();
  const targetCalories = goals?.goal_type === "weight-loss" 
    ? Math.round(tdee - 500)
    : goals?.goal_type === "muscle-gain"
    ? Math.round(tdee + 300)
    : tdee;

  const protein = Math.round((goals?.weight || 70) * 2);
  const fat = Math.round((goals?.weight || 70) * 1);
  const carbs = Math.round((targetCalories - (protein * 4 + fat * 9)) / 4);

  if (!goals) {
    return (
      <Card className="p-4 bg-card border-border/50">
        <div className="text-center space-y-2 py-2">
          <Apple className="w-10 h-10 mx-auto text-muted-foreground" />
          <h3 className="text-sm font-semibold">Configure tes objectifs</h3>
          <p className="text-xs text-muted-foreground">
            Va dans Hub → Nutrition
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card border-border/50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/5 rounded-lg shrink-0">
          <Apple className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Nutrition du jour
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold">{targetCalories}</span>
                <span className="text-xs text-muted-foreground">kcal</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Calories cible</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold">{protein}g</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Protéines</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Glucides</span>
                <span className="font-medium">{carbs}g</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary/30 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Lipides</span>
                <span className="font-medium">{fat}g</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary/30 rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground">
            📊 Tracking disponible dans Nutrition
          </p>
        </div>
      </div>
    </Card>
  );
};
