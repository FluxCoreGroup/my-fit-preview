-- Ajouter les colonnes manquantes pour stocker toutes les données du questionnaire
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS has_cardio boolean,
ADD COLUMN IF NOT EXISTS cardio_frequency integer,
ADD COLUMN IF NOT EXISTS allergies text[],
ADD COLUMN IF NOT EXISTS restrictions text[];