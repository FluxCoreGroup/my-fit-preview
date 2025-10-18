-- Ajouter les colonnes manquantes à la table goals pour stocker les données personnelles
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS sex text,
ADD COLUMN IF NOT EXISTS height integer,
ADD COLUMN IF NOT EXISTS weight numeric;