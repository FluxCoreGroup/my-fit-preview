
-- Convert goal_type from text to text[] and migrate existing data
ALTER TABLE public.goals 
  ALTER COLUMN goal_type DROP DEFAULT,
  ALTER COLUMN goal_type TYPE text[] USING ARRAY[goal_type],
  ALTER COLUMN goal_type SET NOT NULL,
  ALTER COLUMN goal_type SET DEFAULT ARRAY['general-fitness']::text[];
