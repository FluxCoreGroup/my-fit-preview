-- Ajouter les colonnes de nutrition manquantes à la table goals
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS target_weight_loss integer,
ADD COLUMN IF NOT EXISTS activity_level text,
ADD COLUMN IF NOT EXISTS meals_per_day integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS has_breakfast boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS health_conditions text[];