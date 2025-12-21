import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Helper pour convertir string ou array en array
const toArray = (value: unknown): string[] | null => {
  if (!value) return null;
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  return null;
};

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

        // Calculer l'âge depuis la date de naissance si disponible
        let calculatedAge = data.age || null;
        if (data.birthDate) {
          const birthDate = new Date(data.birthDate);
          const today = new Date();
          calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
        }

        // Utiliser upsert pour rendre l'opération idempotente
        const { error } = await supabase.from("goals").upsert({
          user_id: user.id,
          // Étape 1 : Profil de base
          birth_date: data.birthDate || null,
          age: calculatedAge,
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
          allergies: toArray(data.allergies),
          restrictions: toArray(data.restrictions),
          health_conditions: toArray(data.healthConditions),
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
          // Invalider le cache React Query pour forcer le rechargement des données nutrition
          queryClient.invalidateQueries({ queryKey: ["goals"] });
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
