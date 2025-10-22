import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Scale } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const DailyTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [mealType, setMealType] = useState("breakfast");
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [weight, setWeight] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const logMeal = async () => {
    if (!user || !food || !calories) {
      toast({ title: "Erreur", description: "Remplis tous les champs", variant: "destructive" });
      return;
    }

    setIsLogging(true);
    try {
      const { error } = await supabase.from("nutrition_logs").insert({
        user_id: user.id,
        meal_type: mealType,
        food_description: food,
        calories: parseInt(calories),
      });

      if (error) throw error;

      toast({ title: "✅ Repas ajouté", description: `${calories} kcal tracké` });
      setFood("");
      setCalories("");
      queryClient.invalidateQueries({ queryKey: ["nutrition-weekly-stats"] });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsLogging(false);
    }
  };

  const logWeight = async () => {
    if (!user || !weight) {
      toast({ title: "Erreur", description: "Entre ton poids", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight: parseFloat(weight),
      });

      if (error) throw error;

      toast({ title: "✅ Poids enregistré", description: `${weight} kg` });
      setWeight("");
      queryClient.invalidateQueries({ queryKey: ["weight-logs"] });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
      <h3 className="text-sm font-bold mb-3">Tracking quotidien</h3>

      <div className="space-y-3">
        {/* Log Meal */}
        <div className="p-3 rounded-lg bg-background/50 space-y-2">
          <p className="text-xs font-semibold">Ajouter un repas</p>
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Petit-déjeuner</SelectItem>
              <SelectItem value="lunch">Déjeuner</SelectItem>
              <SelectItem value="dinner">Dîner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            placeholder="Ex: Poulet + riz + légumes" 
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className="h-9 text-xs"
          />
          <Input 
            type="number" 
            placeholder="Calories" 
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="h-9 text-xs"
          />
          <Button onClick={logMeal} disabled={isLogging} size="sm" className="w-full">
            <Plus className="w-3 h-3 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Log Weight */}
        <div className="p-3 rounded-lg bg-background/50 space-y-2">
          <p className="text-xs font-semibold">Enregistrer mon poids</p>
          <div className="flex gap-2">
            <Input 
              type="number" 
              step="0.1"
              placeholder="Ex: 75.5" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="h-9 text-xs flex-1"
            />
            <Button onClick={logWeight} size="sm" variant="outline">
              <Scale className="w-3 h-3 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
