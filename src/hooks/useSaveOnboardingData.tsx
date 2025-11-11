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

        // Marquer que la sauvegarde est en cours
        console.log("💾 useSaveOnboardingData : Début sauvegarde...");
        localStorage.setItem("onboarding_saving", "true");

        // Vérifier si les données ont déjà été enregistrées
        const { data: existingGoals, error: checkError } = await supabase
          .from("goals")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (checkError) {
          console.error("Erreur lors de la vérification des données existantes:", checkError);
        }

        // Utiliser upsert pour rendre l'opération idempotente
        const { error } = await supabase.from("goals").upsert({
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
          allergies: data.allergies ? data.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
          restrictions: data.restrictions ? data.restrictions.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
          health_conditions: data.healthConditions ? data.healthConditions.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
        }, {
          onConflict: 'user_id'
        });

        if (error) {
          console.error("❌ Erreur lors de l'enregistrement des données goals:", error);
          localStorage.removeItem("onboarding_saving");
          toast({
            title: "Erreur",
            description: "Impossible d'enregistrer tes préférences.",
            variant: "destructive",
          });
        } else {
          console.log("✅ Données goals enregistrées avec succès pour l'utilisateur:", user.id);
          console.log("📋 Payload upsert:", { location: data.location, equipment: data.equipment });
          // Retirer le flag de sauvegarde
          localStorage.removeItem("onboarding_saving");
          // Ne pas supprimer le localStorage ici, il sera supprimé après TrainingSetup
          // localStorage.removeItem("onboardingData");
        }
      } catch (error) {
        console.error("❌ Erreur catch:", error);
        localStorage.removeItem("onboarding_saving");
      }
    };

    saveData();
  }, [user, toast]);

  return null;
};
