-- Ajouter les contraintes UNIQUE manquantes pour éviter les duplicatas

DO $$ 
BEGIN
  -- Ajouter contrainte UNIQUE sur goals.user_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'goals_user_id_key'
  ) THEN
    ALTER TABLE goals ADD CONSTRAINT goals_user_id_key UNIQUE (user_id);
  END IF;

  -- Ajouter contrainte UNIQUE sur app_preferences.user_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'app_preferences_user_id_key'
  ) THEN
    ALTER TABLE app_preferences ADD CONSTRAINT app_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;