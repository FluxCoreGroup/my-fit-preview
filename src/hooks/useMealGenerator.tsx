import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type GeneratedMeal = {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
};

export const useMealGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generatedMeal, setGeneratedMeal] = useState<GeneratedMeal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(`generated-meal-${user?.id}`);
    if (stored) {
      setGeneratedMeal(JSON.parse(stored));
    }
  }, [user?.id]);

  const generateMeal = async (params: {
    protein: number;
    carbs: number;
    fats: number;
    type: "sweet" | "salty";
    category: "breakfast" | "lunch" | "dinner" | "snack";
  }) => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-meal", {
        body: params,
      });

      if (error) throw error;

      const meal = data as GeneratedMeal;
      setGeneratedMeal(meal);
      localStorage.setItem(`generated-meal-${user.id}`, JSON.stringify(meal));

      toast({
        title: "🍽️ Repas généré",
        description: `${meal.name} créé avec succès`,
      });
    } catch (error: any) {
      console.error("Error generating meal:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le repas",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatedMeal,
    isGenerating,
    generateMeal,
  };
};
