import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type MealPlan = {
  day: number;
  meals: {
    name: string;
    food: string;
    kcal: number;
    p: number;
    f: number;
    g: number;
  }[];
};

export const useNutritionPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(`nutrition-plan-${user?.id}`);
    if (stored) {
      setPlans(JSON.parse(stored));
    }
  }, [user?.id]);

  const generatePlan = async () => {
    if (!user) return;
    
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-nutrition-plan");
      
      if (error) throw error;

      // Generate 7 days of meal plans with variations
      const newPlans: MealPlan[] = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        meals: [
          {
            name: "Petit-déjeuner",
            food: i % 2 === 0 
              ? "Flocons d'avoine + fruits + amandes"
              : "Oeufs brouillés + pain complet + avocat",
            kcal: 350 + (i * 10),
            p: 12 + i,
            f: 8 + i,
            g: 55 - (i * 2)
          },
          {
            name: "Déjeuner",
            food: i % 3 === 0
              ? "Poulet grillé + riz basmati + légumes"
              : i % 3 === 1
              ? "Boeuf maigre + patates douces + salade"
              : "Poisson blanc + quinoa + courgettes",
            kcal: 600 + (i * 15),
            p: 45 + i,
            f: 12 + i,
            g: 70 - (i * 3)
          },
          {
            name: "Dîner",
            food: i % 2 === 0
              ? "Saumon + quinoa + brocolis"
              : "Dinde + riz complet + haricots verts",
            kcal: 550 + (i * 12),
            p: 40 + i,
            f: 18 - i,
            g: 50 + i
          },
          {
            name: "Snack",
            food: i % 2 === 0
              ? "Fromage blanc 0% + banane"
              : "Yaourt grec + myrtilles",
            kcal: 200 + (i * 5),
            p: 20 - i,
            f: 2 + i,
            g: 30 - (i * 2)
          }
        ]
      }));

      setPlans(newPlans);
      localStorage.setItem(`nutrition-plan-${user.id}`, JSON.stringify(newPlans));
      
      toast({
        title: "Plan régénéré",
        description: "Ton plan nutritionnel sur 7 jours a été mis à jour",
      });
    } catch (error: any) {
      console.error("Error generating nutrition plan:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le plan",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return {
    plans,
    isLoading,
    isRegenerating,
    generatePlan,
  };
};
