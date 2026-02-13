/**
 * PLANNER SERVICE - PLACEHOLDER
 * 
 * Ce fichier contient les services "branchables" pour la génération des plans.
 * Actuellement en mode DEMO avec données fictives.
 * À remplacer plus tard par le moteur d'IA réel.
 */

// AI-powered planning via Supabase Edge Functions
const MODE_DEMO = false;

// ============= Types =============

export interface OnboardingInput {
  age: number;
  birthDate?: string; // YYYY-MM-DD format
  sex: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  goal: 'weight-loss' | 'muscle-gain' | 'endurance' | 'strength' | 'wellness';
  goalHorizon: 'short' | 'medium' | 'long';
  hasCardio?: boolean;
  cardioFrequency?: number;
  targetWeightLoss?: number; // kg à perdre (optionnel)
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'high';
  frequency: number; // séances/semaine
  sessionDuration: number; // minutes
  location: 'home' | 'gym';
  equipment: string[];
  allergies?: string;
  restrictions?: string;
  mealsPerDay: number; // 2-5
  hasBreakfast: boolean;
  healthConditions?: string;
}

export interface NutritionPreview {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  calories: number;
  deficit: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  fiber: number;
  hydration: number;
  mealsPerDay: number;
  sampleDay: {
    meal: string;
    foods: string[];
    approxCalories: number;
  }[];
  explanation: string;
}

export interface Exercise {
  id: string;
  name: string;
  englishName?: string;
  imageUrl?: string;
  sets: number;
  reps: string; // "8-12" ou "30s"
  rest: number; // secondes
  rpe: string; // "7-8" ou "effort modéré"
  rir: string; // "2-3" ou "confortable"
  tips: string[];
  commonMistakes: string[];
  alternatives: string[];
}

export interface TrainingPreview {
  splitType: string;
  sessionName: string;
  exercises: Exercise[];
  totalDuration: number; // minutes
  explanation: string;
}

export interface TrainingPreferences {
  sessionType: "strength" | "cardio" | "mixed" | "mobility";
  experienceLevel: "beginner" | "intermediate" | "advanced" | "expert";
  splitPreference?: "full_body" | "upper_lower" | "ppl" | "body_part";
  cardioIntensity?: "liss" | "miss" | "hiit" | "mixed";
  priorityZones: string[];
  limitations: string[];
  favoriteExercises?: string;
  exercisesToAvoid?: string;
  progressionFocus: "strength" | "reps" | "rest" | "technique" | "auto";
  mobilityPreference: "every_session" | "dedicated" | "occasional" | "none";
}

// Fonction helper pour les recommandations
export const getRecommendedSessionType = (goal: OnboardingInput['goal']): ("strength" | "cardio" | "mixed" | "mobility")[] => {
  switch (goal) {
    case 'weight-loss':
      return ['mixed', 'cardio'];
    case 'muscle-gain':
    case 'strength':
      return ['strength'];
    case 'endurance':
      return ['cardio'];
    case 'wellness':
      return ['mixed', 'mobility'];
    default:
      return ['mixed'];
  }
};

export const getRecommendedCardioIntensity = (goal: OnboardingInput['goal'], level: TrainingPreferences['experienceLevel']): ("liss" | "miss" | "hiit" | "mixed")[] => {
  if (goal === 'weight-loss') {
    if (level === 'beginner') return ['liss', 'miss'];
    return ['hiit', 'mixed'];
  }
  if (goal === 'endurance') return ['miss', 'hiit'];
  if (goal === 'wellness') return ['liss'];
  return ['mixed'];
};

export const getRecommendedSplit = (frequency: number, level: TrainingPreferences['experienceLevel']): ("full_body" | "upper_lower" | "ppl" | "body_part")[] => {
  if (level === 'beginner') return ['full_body'];
  
  if (frequency <= 3) return ['full_body', 'upper_lower'];
  if (frequency === 4 || frequency === 5) return ['ppl', 'upper_lower'];
  return ['ppl', 'body_part'];
};

// ============= NUTRITION PLANNER (PLACEHOLDER) =============

export const nutritionPlanner = {
  getPreview: async (input: OnboardingInput): Promise<NutritionPreview> => {
    // Vérifier si l'utilisateur est connecté
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      // Si connecté, utiliser l'Edge Function
      if (session?.user && !MODE_DEMO) {
        const { data, error } = await supabase.functions.invoke('generate-nutrition-plan', {
          body: { input }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }
        return data as NutritionPreview;
      }
    } catch (error) {
      console.error('Failed to call Edge Function, falling back to demo mode:', error);
    }

    // Sinon, utiliser le mode DEMO (calculs locaux)

    // 1. BMI = poids(kg) / (taille(m))²
    const heightInMeters = input.height / 100;
    const bmi = parseFloat((input.weight / (heightInMeters * heightInMeters)).toFixed(1));
    
    let bmiCategory = "Normal";
    if (bmi < 18.5) bmiCategory = "Sous-poids";
    else if (bmi >= 25 && bmi < 30) bmiCategory = "Surpoids";
    else if (bmi >= 30) bmiCategory = "Obésité";

    // 2. BMR (Mifflin-St Jeor)
    const bmr = input.sex === 'male'
      ? 10 * input.weight + 6.25 * input.height - 5 * input.age + 5
      : 10 * input.weight + 6.25 * input.height - 5 * input.age - 161;
    
    // 3. TDEE = BMR × facteur activité
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      high: 1.725,
    };
    const activityFactor = activityFactors[input.activityLevel];
    const tdee = Math.round(bmr * activityFactor);
    
    // 4. Déficit calorique selon objectif et IMC
    let deficitPercent = 0.15; // -15% par défaut
    
    if (input.goal === 'weight-loss') {
      if (bmi >= 30 || bmi < 20) {
        deficitPercent = 0.10; // -10% si IMC élevé ou faible (adhérence > vitesse)
      }
    } else if (input.goal === 'muscle-gain') {
      deficitPercent = -0.10; // +10% surplus
    } else {
      deficitPercent = 0; // maintenance
    }
    
    const targetCalories = Math.round(tdee * (1 - deficitPercent));
    const deficit = tdee - targetCalories;

    // 5. Macros
    const protein = Math.round(input.weight * 1.8); // 1.8 g/kg
    const fat = Math.round(input.weight * 0.8); // 0.8 g/kg
    const remainingCalories = targetCalories - (protein * 4) - (fat * 9);
    const carbs = Math.round(remainingCalories / 4);

    // 6. Fibres : 14g / 1000 kcal
    const fiber = Math.round((targetCalories / 1000) * 14);

    // 7. Hydratation : 30-35 ml/kg/j + 300-500ml par 30min d'effort
    const baseHydration = Math.round(input.weight * 32.5); // 32.5 ml/kg (moyenne)
    const trainingHydration = Math.round((input.sessionDuration / 30) * 400); // 400ml par 30min
    const dailyTrainingHydration = Math.round((trainingHydration * input.frequency) / 7);
    const hydration = baseHydration + dailyTrainingHydration;

    // Génération exemple de journée
    const mealsPerDay = input.mealsPerDay;
    const sampleDay = generateSampleDay(targetCalories, mealsPerDay, input.hasBreakfast, input.restrictions, input.allergies);

    return {
      bmi,
      bmiCategory,
      bmr: Math.round(bmr),
      tdee,
      calories: targetCalories,
      deficit,
      macros: { protein, carbs, fat },
      fiber,
      hydration,
      mealsPerDay,
      sampleDay,
      explanation: `Ton IMC est de ${bmi} (${bmiCategory}). Ton métabolisme de base (BMR) est d'environ ${Math.round(bmr)} kcal/jour. Avec ton niveau d'activité (${input.activityLevel}), ton besoin total (TDEE) est d'environ ${tdee} kcal/jour. Pour ${input.goal === 'weight-loss' ? 'perdre du poids de manière saine' : input.goal === 'muscle-gain' ? 'prendre du muscle' : 'maintenir ton poids'}, on vise ${targetCalories} kcal${deficit !== 0 ? ` (${deficit > 0 ? 'déficit' : 'surplus'} de ${Math.abs(deficit)} kcal)` : ''} avec ${protein}g de protéines, ${carbs}g de glucides, ${fat}g de lipides et ${fiber}g de fibres par jour. Hydratation recommandée : ${(hydration / 1000).toFixed(1)}L/jour.`,
    };
  },
};

// Fonction helper pour générer un exemple de journée
function generateSampleDay(
  targetCalories: number,
  mealsPerDay: number,
  hasBreakfast: boolean,
  restrictions?: string,
  allergies?: string
): NutritionPreview['sampleDay'] {
  const meals = [];
  const caloriesPerMeal = Math.round(targetCalories / mealsPerDay);
  
  const mealNames = hasBreakfast 
    ? ["Petit-déjeuner", "Déjeuner", "Collation", "Dîner", "Collation du soir"]
    : ["Déjeuner", "Collation", "Dîner", "Collation du soir"];

  // Aliments de base (à filtrer selon restrictions/allergies)
  const breakfastFoods = ["Flocons d'avoine (60g)", "Banane", "Beurre de cacahuète (20g)", "Lait (200ml)"];
  const lunchFoods = ["Poulet grillé (150g)", "Riz basmati (80g sec)", "Brocolis vapeur", "Huile d'olive (1 c.à.s)"];
  const snackFoods = ["Yaourt grec (150g)", "Fruits rouges", "Amandes (20g)"];
  const dinnerFoods = ["Saumon (120g)", "Patate douce (150g)", "Haricots verts", "Avocat (1/2)"];

  for (let i = 0; i < mealsPerDay; i++) {
    let foods: string[] = [];
    
    if (i === 0 && hasBreakfast) {
      foods = breakfastFoods;
    } else if ((i === 0 && !hasBreakfast) || (i === 1 && hasBreakfast)) {
      foods = lunchFoods;
    } else if (i === mealsPerDay - 1 || (i === mealsPerDay - 2 && mealsPerDay >= 4)) {
      foods = dinnerFoods;
    } else {
      foods = snackFoods;
    }

    meals.push({
      meal: mealNames[i] || `Repas ${i + 1}`,
      foods,
      approxCalories: caloriesPerMeal,
    });
  }

  return meals.slice(0, mealsPerDay);
}

// ============= TRAINING PLANNER (PLACEHOLDER) =============

export const trainingPlanner = {
  getPreview: async (input: OnboardingInput): Promise<TrainingPreview> => {
    if (!MODE_DEMO) {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('generate-training-plan', {
        body: { input }
      });

      if (error) throw error;
      return data as TrainingPreview;
    }

    const isHome = input.location === 'home';
    const hasEquipment = input.equipment.length > 0;

    // Exercices de démo adaptés au contexte
    const exercises: Exercise[] = [
      {
        id: "ex1",
        name: isHome ? "Pompes" : "Développé couché",
        sets: 3,
        reps: "8-12",
        rest: 90,
        rpe: "7-8",
        rir: "2-3",
        tips: [
          "Garde le dos droit et les abdos gainés",
          "Descends lentement (2-3 secondes)",
          "Remonte de manière explosive"
        ],
        commonMistakes: [
          "Cambrer le dos",
          "Ne pas descendre assez bas",
          "Verrouiller les coudes en haut"
        ],
        alternatives: ["Pompes inclinées", "Pompes sur les genoux"]
      },
      {
        id: "ex2",
        name: isHome ? "Squats au poids du corps" : "Squat barre",
        sets: 3,
        reps: "10-15",
        rest: 120,
        rpe: "7-8",
        rir: "2-3",
        tips: [
          "Pieds largeur d'épaules",
          "Descends comme si tu t'asseyais",
          "Genoux alignés avec les pieds"
        ],
        commonMistakes: [
          "Genoux qui rentrent vers l'intérieur",
          "Talons qui décollent",
          "Dos qui s'arrondit"
        ],
        alternatives: ["Squats gobelet", "Fentes alternées"]
      },
      {
        id: "ex3",
        name: isHome ? "Rowing inversé (table)" : "Rowing haltères",
        sets: 3,
        reps: "10-12",
        rest: 90,
        rpe: "7-8",
        rir: "2-3",
        tips: [
          "Tire avec tes coudes, pas tes mains",
          "Serre les omoplates en haut",
          "Contrôle la descente"
        ],
        commonMistakes: [
          "Utiliser l'élan",
          "Arrondir le dos",
          "Ne pas amener les coudes assez loin"
        ],
        alternatives: ["Rowing TRX", "Superman holds"]
      },
      {
        id: "ex4",
        name: "Planche",
        sets: 3,
        reps: "30-45s",
        rest: 60,
        rpe: "7",
        rir: "confortable",
        tips: [
          "Corps aligné de la tête aux pieds",
          "Abdos et fessiers contractés",
          "Respire normalement"
        ],
        commonMistakes: [
          "Fesses trop hautes",
          "Bassin qui tombe",
          "Retenir sa respiration"
        ],
        alternatives: ["Planche sur genoux", "Dead bug"]
      },
      {
        id: "ex5",
        name: isHome ? "Fentes" : "Leg press",
        sets: 3,
        reps: "10-12 par jambe",
        rest: 90,
        rpe: "7-8",
        rir: "2-3",
        tips: [
          "Garde le buste droit",
          "Genou arrière proche du sol",
          "Pousse sur le talon avant"
        ],
        commonMistakes: [
          "Genou avant qui dépasse trop",
          "Se pencher en avant",
          "Pas assez d'amplitude"
        ],
        alternatives: ["Fentes bulgares", "Step-ups"]
      }
    ];

    const totalDuration = exercises.reduce((acc, ex) => {
      const setTime = typeof ex.reps === 'string' && ex.reps.includes('s') 
        ? parseInt(ex.reps) 
        : 40; // estimation 40s par série
      return acc + (ex.sets * (setTime + ex.rest));
    }, 0);

    return {
      splitType: input.frequency >= 4 ? "Split Push/Pull/Legs" : "Full Body",
      sessionName: "Séance Full Body #1",
      exercises,
      totalDuration: Math.round(totalDuration / 60),
      explanation: `Cette séance est adaptée à ton niveau ${input.goal === 'weight-loss' ? 'avec focus perte de poids' : input.goal === 'muscle-gain' ? 'avec focus prise de muscle' : ''}, ${input.frequency} séances/semaine. Elle dure environ ${Math.round(totalDuration / 60)} minutes ${isHome ? 'à la maison' : 'en salle'}.`,
    };
  },
};
