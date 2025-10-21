import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Apple, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
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
  const targetCalories = goals?.goal_type === "weight_loss" 
    ? Math.round(tdee - 500)
    : goals?.goal_type === "muscle_gain"
    ? Math.round(tdee + 300)
    : tdee;

  const protein = Math.round((goals?.weight || 70) * 2);
  const fat = Math.round((goals?.weight || 70) * 1);
  const carbs = Math.round((targetCalories - (protein * 4 + fat * 9)) / 4);

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-xl border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <Apple className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-lg font-bold">Nutrition du jour</h3>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Calories</span>
              <span className="font-semibold">{targetCalories} kcal</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Protéines</span>
              </div>
              <Progress value={0} className="h-1.5" />
              <p className="text-xs font-semibold text-center">{protein}g</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Lipides</span>
              </div>
              <Progress value={0} className="h-1.5" />
              <p className="text-xs font-semibold text-center">{fat}g</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Glucides</span>
              </div>
              <Progress value={0} className="h-1.5" />
              <p className="text-xs font-semibold text-center">{carbs}g</p>
            </div>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full" size="sm">
          <Link to="/settings/nutrition">
            Voir mes repas
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};
