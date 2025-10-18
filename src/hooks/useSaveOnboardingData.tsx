import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSaveOnboardingData = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const saveData = async () => {
      if (!user) return;

      // Vérifier si les données du questionnaire existent
      const onboardingDataStr = localStorage.getItem("onboardingData");
      if (!onboardingDataStr) return;

      try {
        const data = JSON.parse(onboardingDataStr);

        // Vérifier si les données ont déjà été enregistrées
        const { data: existingGoals } = await supabase
          .from("goals")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (existingGoals) {
          // Données déjà enregistrées
          return;
        }

        // Enregistrer les données dans la table goals
        const { error } = await supabase.from("goals").insert({
          user_id: user.id,
          age: data.age || null,
          sex: data.sex || null,
          height: data.height || null,
          weight: data.weight || null,
          goal_type: data.goal || null,
          target_weight_loss: data.targetWeightLoss || null,
          horizon: data.horizon || null,
          activity_level: data.activityLevel || null,
          frequency: data.frequency || null,
          session_duration: data.sessionDuration || null,
          location: data.location || null,
          equipment: data.equipment || null,
          health_conditions: data.healthConditions || null,
          has_breakfast: data.hasBreakfast !== undefined ? data.hasBreakfast : true,
          meals_per_day: data.mealsPerDay || 3,
        });

        if (error) {
          console.error("Erreur lors de l'enregistrement des données:", error);
          toast({
            title: "Erreur",
            description: "Impossible d'enregistrer tes préférences.",
            variant: "destructive",
          });
        } else {
          // Supprimer les données du localStorage après enregistrement
          localStorage.removeItem("onboardingData");
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    saveData();
  }, [user, toast]);

  return null;
};
