-- Ajouter la colonne birth_date dans la table goals
ALTER TABLE public.goals
ADD COLUMN IF NOT EXISTS birth_date date;