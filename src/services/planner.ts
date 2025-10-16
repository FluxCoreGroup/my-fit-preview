/**
 * PLANNER SERVICE - PLACEHOLDER
 * 
 * Ce fichier contient les services "branchables" pour la génération des plans.
 * Actuellement en mode DEMO avec données fictives.
 * À remplacer plus tard par le moteur d'IA réel.
 */

// Mode demo : activer pour utiliser des données de démonstration
export const MODE_DEMO = true;

// ============= Types =============

export interface OnboardingInput {
  age: number;
  sex: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  goal: 'weight-loss' | 'muscle-gain' | 'maintenance';
  goalHorizon: string; // ex: "3 mois"
  frequency: number; // séances/semaine
  sessionDuration: number; // minutes
  location: 'home' | 'gym';
  equipment: string[];
  allergies: string[];
  restrictions: string[];
}

export interface NutritionPreview {
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
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

// ============= NUTRITION PLANNER (PLACEHOLDER) =============

export const nutritionPlanner = {
  getPreview: (input: OnboardingInput): NutritionPreview => {
    if (!MODE_DEMO) {
      throw new Error("Le moteur de nutrition n'est pas encore branché. Activer MODE_DEMO.");
    }

    // Calculs simplifiés pour la démo
    const bmr = input.sex === 'male'
      ? 10 * input.weight + 6.25 * input.height - 5 * input.age + 5
      : 10 * input.weight + 6.25 * input.height - 5 * input.age - 161;
    
    const activityFactor = 1.4 + (input.frequency * 0.1);
    const tdee = Math.round(bmr * activityFactor);
    
    let targetCalories = tdee;
    if (input.goal === 'weight-loss') targetCalories = Math.round(tdee * 0.8);
    if (input.goal === 'muscle-gain') targetCalories = Math.round(tdee * 1.1);

    const protein = Math.round(input.weight * 2); // 2g/kg
    const fat = Math.round(targetCalories * 0.25 / 9); // 25% des calories
    const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);

    return {
      calories: targetCalories,
      macros: { protein, carbs, fat },
      mealsPerDay: 3,
      sampleDay: [
        {
          meal: "Petit-déjeuner",
          foods: ["Flocons d'avoine (60g)", "Banane", "Beurre de cacahuète (20g)", "Lait (200ml)"],
          approxCalories: Math.round(targetCalories * 0.3),
        },
        {
          meal: "Déjeuner",
          foods: ["Poulet grillé (150g)", "Riz basmati (80g sec)", "Brocolis vapeur", "Huile d'olive (1 c.à.s)"],
          approxCalories: Math.round(targetCalories * 0.4),
        },
        {
          meal: "Dîner",
          foods: ["Saumon (120g)", "Patate douce (150g)", "Haricots verts", "Amandes (20g)"],
          approxCalories: Math.round(targetCalories * 0.3),
        },
      ],
      explanation: `D'après tes infos, ton besoin estimé est d'environ ${tdee} kcal/jour. Pour ${input.goal === 'weight-loss' ? 'perdre du poids' : input.goal === 'muscle-gain' ? 'prendre du muscle' : 'maintenir ton poids'}, on vise ${targetCalories} kcal avec ${protein}g de protéines, ${carbs}g de glucides et ${fat}g de lipides.`,
    };
  },
};

// ============= TRAINING PLANNER (PLACEHOLDER) =============

export const trainingPlanner = {
  getPreview: (input: OnboardingInput): TrainingPreview => {
    if (!MODE_DEMO) {
      throw new Error("Le moteur d'entraînement n'est pas encore branché. Activer MODE_DEMO.");
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
