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
        const { data: existingGoals, error: checkError } = await supabase
          .from("goals")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (checkError) {
          console.error("Erreur lors de la vérification des données existantes:", checkError);
        }

        if (existingGoals) {
          // Données déjà enregistrées
          console.log("Données goals déjà enregistrées pour l'utilisateur");
          return;
        }

        // Enregistrer les données dans la table goals
        const { error } = await supabase.from("goals").insert({
          user_id: user.id,
          // Étape 1 : Profil de base
          age: data.age || null,
          sex: data.sex || null,
          height: data.height || null,
          weight: data.weight || null,
          // Étape 2 : Objectif
          goal_type: data.goal || null,
          horizon: data.goalHorizon || null,
          target_weight_loss: data.targetWeightLoss || null,
          has_cardio: data.hasCardio !== undefined ? data.hasCardio : null,
          cardio_frequency: data.cardioFrequency || null,
          // Étape 3 : Niveau d'activité
          activity_level: data.activityLevel || null,
          // Étape 4 : Entraînement
          frequency: data.frequency || null,
          session_duration: data.sessionDuration || null,
          location: data.location || null,
          equipment: data.equipment || null,
          // Étape 5 : Alimentation et santé
          meals_per_day: data.mealsPerDay || 3,
          has_breakfast: data.hasBreakfast !== undefined ? data.hasBreakfast : true,
          allergies: data.allergies || null,
          restrictions: data.restrictions || null,
          health_conditions: data.healthConditions || null,
        });

        if (error) {
          console.error("Erreur lors de l'enregistrement des données goals:", error);
          toast({
            title: "Erreur",
            description: "Impossible d'enregistrer tes préférences.",
            variant: "destructive",
          });
        } else {
          console.log("✅ Données goals enregistrées avec succès pour l'utilisateur:", user.id);
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
