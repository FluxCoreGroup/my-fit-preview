-- 1. Supprimer les duplicatas dans training_preferences (garder le plus récent)
DELETE FROM training_preferences a
USING training_preferences b
WHERE a.user_id = b.user_id
  AND a.created_at < b.created_at;

-- 2. Ajouter contrainte UNIQUE sur training_preferences.user_id
ALTER TABLE training_preferences 
ADD CONSTRAINT training_preferences_user_id_key UNIQUE (user_id);