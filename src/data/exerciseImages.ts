// Dictionnaire local des exercices courants avec GIFs
// Source principale: Musclewiki GIFs + images libres de droits

export interface ExerciseImageData {
  imageUrl: string;
  gifUrl?: string;
  muscleGroup: string;
  equipment: string;
}

// Normalize exercise name for lookup (lowercase, trim, remove accents)
export const normalizeExerciseName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Local dictionary of ~50 common exercises
export const exerciseImages: Record<string, ExerciseImageData> = {
  // === PECTORAUX ===
  "developpe couche": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-bench-press-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-bench-press-front-0.png",
    muscleGroup: "pectoraux",
    equipment: "barre"
  },
  "developpe couche halteres": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-bench-press-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-bench-press-front-0.png",
    muscleGroup: "pectoraux",
    equipment: "haltères"
  },
  "developpe incline": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-incline-bench-press-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-incline-bench-press-front-0.png",
    muscleGroup: "pectoraux",
    equipment: "barre"
  },
  "developpe incline halteres": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-incline-bench-press-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-incline-bench-press-front-0.png",
    muscleGroup: "pectoraux",
    equipment: "haltères"
  },
  "ecarte couche": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-fly-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-fly-front-0.png",
    muscleGroup: "pectoraux",
    equipment: "haltères"
  },
  "pompes": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-push-up-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-push-up-front-0.png",
    muscleGroup: "pectoraux",
    equipment: "poids du corps"
  },
  "dips": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-dips-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-dips-front-0.png",
    muscleGroup: "pectoraux",
    equipment: "poids du corps"
  },
  "pec deck": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-machine-fly-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-machine-fly-front-0.png",
    muscleGroup: "pectoraux",
    equipment: "machine"
  },

  // === DOS ===
  "tractions": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-pull-up-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-pull-up-front-0.png",
    muscleGroup: "dos",
    equipment: "poids du corps"
  },
  "tractions supination": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-chinup-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-chinup-front-0.png",
    muscleGroup: "dos",
    equipment: "poids du corps"
  },
  "rowing barre": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-bent-over-row-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-bent-over-row-front-0.png",
    muscleGroup: "dos",
    equipment: "barre"
  },
  "rowing haltere": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-row-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-row-front-0.png",
    muscleGroup: "dos",
    equipment: "haltères"
  },
  "tirage vertical": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-cables-lat-pulldown-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-cables-lat-pulldown-front-0.png",
    muscleGroup: "dos",
    equipment: "machine"
  },
  "tirage horizontal": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-cables-seated-row-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-cables-seated-row-front-0.png",
    muscleGroup: "dos",
    equipment: "machine"
  },
  "soulevé de terre": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-deadlift-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-deadlift-front-0.png",
    muscleGroup: "dos",
    equipment: "barre"
  },
  "soulevé de terre roumain": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-romanian-deadlift-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-romanian-deadlift-front-0.png",
    muscleGroup: "ischio-jambiers",
    equipment: "barre"
  },

  // === ÉPAULES ===
  "developpe militaire": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-overhead-press-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-overhead-press-front-0.png",
    muscleGroup: "épaules",
    equipment: "barre"
  },
  "developpe epaules halteres": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-shoulder-press-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-shoulder-press-front-0.png",
    muscleGroup: "épaules",
    equipment: "haltères"
  },
  "elevations laterales": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-lateral-raise-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-lateral-raise-front-0.png",
    muscleGroup: "épaules",
    equipment: "haltères"
  },
  "elevations frontales": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-front-raise-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-front-raise-front-0.png",
    muscleGroup: "épaules",
    equipment: "haltères"
  },
  "oiseau": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-rear-delt-fly-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-rear-delt-fly-front-0.png",
    muscleGroup: "épaules",
    equipment: "haltères"
  },
  "face pull": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-cables-face-pull-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-cables-face-pull-front-0.png",
    muscleGroup: "épaules",
    equipment: "poulie"
  },
  "shrugs": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-shrug-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-shrug-front-0.png",
    muscleGroup: "trapèzes",
    equipment: "haltères"
  },

  // === BRAS - BICEPS ===
  "curl barre": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-curl-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-curl-front-0.png",
    muscleGroup: "biceps",
    equipment: "barre"
  },
  "curl halteres": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-curl-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-curl-front-0.png",
    muscleGroup: "biceps",
    equipment: "haltères"
  },
  "curl marteau": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-hammer-curl-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-hammer-curl-front-0.png",
    muscleGroup: "biceps",
    equipment: "haltères"
  },
  "curl incline": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-incline-curl-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-incline-curl-front-0.png",
    muscleGroup: "biceps",
    equipment: "haltères"
  },
  "curl pupitre": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-preacher-curl-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-preacher-curl-front-0.png",
    muscleGroup: "biceps",
    equipment: "haltères"
  },

  // === BRAS - TRICEPS ===
  "extensions triceps poulie": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-cables-pushdown-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-cables-pushdown-front-0.png",
    muscleGroup: "triceps",
    equipment: "poulie"
  },
  "dips triceps": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-tricep-dips-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-tricep-dips-front-0.png",
    muscleGroup: "triceps",
    equipment: "poids du corps"
  },
  "barre au front": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-skull-crusher-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-skull-crusher-front-0.png",
    muscleGroup: "triceps",
    equipment: "barre"
  },
  "extension triceps haltere": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-tricep-extension-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-tricep-extension-front-0.png",
    muscleGroup: "triceps",
    equipment: "haltères"
  },
  "kickback": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-kickback-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-kickback-front-0.png",
    muscleGroup: "triceps",
    equipment: "haltères"
  },

  // === JAMBES - QUADRICEPS ===
  "squat": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-squat-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-squat-front-0.png",
    muscleGroup: "quadriceps",
    equipment: "barre"
  },
  "squat goblet": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-goblet-squat-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-goblet-squat-front-0.png",
    muscleGroup: "quadriceps",
    equipment: "haltères"
  },
  "presse a cuisses": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-machine-leg-press-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-machine-leg-press-front-0.png",
    muscleGroup: "quadriceps",
    equipment: "machine"
  },
  "leg extension": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-machine-leg-extension-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-machine-leg-extension-front-0.png",
    muscleGroup: "quadriceps",
    equipment: "machine"
  },
  "fentes": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-lunge-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-lunge-front-0.png",
    muscleGroup: "quadriceps",
    equipment: "haltères"
  },
  "fentes marchees": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-walking-lunge-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-walking-lunge-front-0.png",
    muscleGroup: "quadriceps",
    equipment: "haltères"
  },
  "squat bulgare": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-bulgarian-split-squat-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-dumbbell-bulgarian-split-squat-front-0.png",
    muscleGroup: "quadriceps",
    equipment: "haltères"
  },
  "hack squat": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-machine-hack-squat-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-machine-hack-squat-front-0.png",
    muscleGroup: "quadriceps",
    equipment: "machine"
  },

  // === JAMBES - ISCHIO-JAMBIERS ===
  "leg curl": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-machine-leg-curl-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-machine-leg-curl-front-0.png",
    muscleGroup: "ischio-jambiers",
    equipment: "machine"
  },
  "good morning": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-good-morning-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-good-morning-front-0.png",
    muscleGroup: "ischio-jambiers",
    equipment: "barre"
  },
  "hip thrust": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-barbell-hip-thrust-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-barbell-hip-thrust-front-0.png",
    muscleGroup: "fessiers",
    equipment: "barre"
  },
  "glute bridge": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-glute-bridge-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-glute-bridge-front-0.png",
    muscleGroup: "fessiers",
    equipment: "poids du corps"
  },

  // === MOLLETS ===
  "mollets debout": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-machine-calf-raise-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-machine-calf-raise-front-0.png",
    muscleGroup: "mollets",
    equipment: "machine"
  },
  "mollets assis": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-machine-seated-calf-raise-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-machine-seated-calf-raise-front-0.png",
    muscleGroup: "mollets",
    equipment: "machine"
  },

  // === ABDOMINAUX ===
  "crunch": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-crunch-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-crunch-front-0.png",
    muscleGroup: "abdominaux",
    equipment: "poids du corps"
  },
  "crunch poulie": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-cables-crunch-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-cables-crunch-front-0.png",
    muscleGroup: "abdominaux",
    equipment: "poulie"
  },
  "releve de jambes": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-hanging-leg-raise-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-hanging-leg-raise-front-0.png",
    muscleGroup: "abdominaux",
    equipment: "poids du corps"
  },
  "gainage": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-plank-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-plank-front-0.png",
    muscleGroup: "abdominaux",
    equipment: "poids du corps"
  },
  "planche": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-plank-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-plank-front-0.png",
    muscleGroup: "abdominaux",
    equipment: "poids du corps"
  },
  "russian twist": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-russian-twist-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-russian-twist-front-0.png",
    muscleGroup: "abdominaux",
    equipment: "poids du corps"
  },
  "mountain climbers": {
    gifUrl: "https://musclewiki.com/media/uploads/videos/branded/male-bodyweight-mountain-climber-front.mp4#t=0.1",
    imageUrl: "https://musclewiki.com/media/uploads/male-bodyweight-mountain-climber-front-0.png",
    muscleGroup: "abdominaux",
    equipment: "poids du corps"
  }
};

// Get image data from local dictionary
export const getLocalExerciseImage = (exerciseName: string): ExerciseImageData | null => {
  const normalized = normalizeExerciseName(exerciseName);
  
  // Direct match
  if (exerciseImages[normalized]) {
    return exerciseImages[normalized];
  }
  
  // Partial match - find best match
  const keys = Object.keys(exerciseImages);
  for (const key of keys) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return exerciseImages[key];
    }
  }
  
  // Word match - at least 2 words in common
  const normalizedWords = normalized.split(/\s+/);
  for (const key of keys) {
    const keyWords = key.split(/\s+/);
    const commonWords = normalizedWords.filter(word => 
      keyWords.some(kw => kw.includes(word) || word.includes(kw))
    );
    if (commonWords.length >= 2) {
      return exerciseImages[key];
    }
  }
  
  return null;
};

// Default placeholder image when no match found
export const DEFAULT_EXERCISE_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80";
