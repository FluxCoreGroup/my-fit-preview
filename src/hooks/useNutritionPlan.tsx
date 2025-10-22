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

      // Utiliser les données AI au lieu du mock
      const aiResponse = data as { days: MealPlan[] };
      const newPlans = aiResponse.days;

      setPlans(newPlans);
      localStorage.setItem(`nutrition-plan-${user.id}`, JSON.stringify(newPlans));
      
      toast({
        title: "Plan régénéré",
        description: "Ton plan nutritionnel sur 7 jours a été mis à jour avec l'IA",
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
