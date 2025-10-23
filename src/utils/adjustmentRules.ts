export interface RecommendationParams {
  currentWeight: number;
  previousWeight?: number;
  adherence: number;
  rpe: number;
  hasPain: boolean;
  energy: string;
  sessionsCompleted: number;
}

export interface Recommendation {
  type: "nutrition" | "training" | "none";
  action: string;
  message: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export const calculateRecommendation = (params: RecommendationParams): Recommendation => {
  const {
    currentWeight,
    previousWeight,
    adherence,
    rpe,
    hasPain,
    energy,
    sessionsCompleted,
  } = params;

  const weightLossPercent = previousWeight
    ? ((previousWeight - currentWeight) / previousWeight) * 100
    : 0;

  // RÈGLE 1.1 : Perte trop lente + bonne adhérence → Réduire calories
  if (weightLossPercent < 0.25 && adherence >= 80) {
    return {
      type: "nutrition",
      action: "-150kcal",
      message: "Réduis de 150 kcal/jour pour relancer la perte de poids",
      reason: `Perte hebdo ${weightLossPercent.toFixed(2)}% (objectif ≥0.25%) malgré ${adherence}% d'adhérence`,
      priority: "high",
    };
  }

  // RÈGLE 1.2 : Perte trop rapide OU RPE trop élevé OU énergie basse → Augmenter calories
  if (weightLossPercent > 1 || rpe >= 9 || energy === "low") {
    return {
      type: "nutrition",
      action: "+100kcal",
      message: "Augmente de 100 kcal/jour pour mieux récupérer",
      reason: weightLossPercent > 1
        ? `Perte hebdo trop rapide : ${weightLossPercent.toFixed(2)}% (max 1%)`
        : rpe >= 9
        ? `RPE élevé (${rpe}/10) = récupération insuffisante`
        : "Niveau d'énergie faible signalé",
      priority: "high",
    };
  }

  // RÈGLE 2.1 : Douleur OU RPE trop élevé → Réduire volume
  if (hasPain || rpe >= 9) {
    return {
      type: "training",
      action: "-1 set",
      message: "Réduis d'1 série par exercice + privilégie les mouvements doux",
      reason: hasPain
        ? "Douleur signalée : priorité à la récupération"
        : `RPE trop élevé (${rpe}/10) : risque de surentraînement`,
      priority: "high",
    };
  }

  // RÈGLE 2.2 : RPE faible + bon volume → Augmenter volume
  if (rpe <= 7 && sessionsCompleted >= 2) {
    return {
      type: "training",
      action: "+1 set",
      message: "Ajoute 1 série sur tes exercices principaux pour progresser",
      reason: `RPE confortable (${rpe}/10) + ${sessionsCompleted} séances faites : tu peux monter en volume`,
      priority: "medium",
    };
  }

  // RÈGLE 3 : Pas d'ajustement nécessaire
  return {
    type: "none",
    action: "no_change",
    message: "Continue comme ça, tu progresses bien ! 🎯",
    reason: "Tous les indicateurs sont dans la zone optimale",
    priority: "low",
  };
};
