-- Configurer la suppression en cascade pour toutes les tables liées aux utilisateurs

-- Table feedback
ALTER TABLE public.feedback
DROP CONSTRAINT IF EXISTS feedback_user_id_fkey,
ADD CONSTRAINT feedback_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Table goals
ALTER TABLE public.goals
DROP CONSTRAINT IF EXISTS goals_user_id_fkey,
ADD CONSTRAINT goals_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Table profiles (déjà en place normalement, mais on s'assure)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Table sessions
ALTER TABLE public.sessions
DROP CONSTRAINT IF EXISTS sessions_user_id_fkey,
ADD CONSTRAINT sessions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Table subscriptions
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey,
ADD CONSTRAINT subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Table training_preferences
ALTER TABLE public.training_preferences
DROP CONSTRAINT IF EXISTS training_preferences_user_id_fkey,
ADD CONSTRAINT training_preferences_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Table weekly_checkins
ALTER TABLE public.weekly_checkins
DROP CONSTRAINT IF EXISTS weekly_checkins_user_id_fkey,
ADD CONSTRAINT weekly_checkins_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;