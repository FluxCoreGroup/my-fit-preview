-- Add unique constraint on goals.user_id to prevent duplicate entries
ALTER TABLE public.goals ADD CONSTRAINT goals_user_id_unique UNIQUE (user_id);