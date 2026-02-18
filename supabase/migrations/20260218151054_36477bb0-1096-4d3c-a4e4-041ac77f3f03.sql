
-- ================================================================
-- Fix 1: Nettoyer les doublons weekly_programs (garder le plus récent)
-- ================================================================
DELETE FROM weekly_programs
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, week_start_date) id
  FROM weekly_programs
  ORDER BY user_id, week_start_date, created_at DESC
);

-- ================================================================
-- Fix 2: Contrainte unique sur (user_id, week_start_date)
-- ================================================================
ALTER TABLE weekly_programs
ADD CONSTRAINT unique_user_week UNIQUE (user_id, week_start_date);

-- ================================================================
-- Fix 3: Recréer le trigger pour gérer completed = NULL
-- ================================================================
CREATE OR REPLACE FUNCTION public.update_weekly_program_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Déclenche quand completed passe à true depuis NULL ou false
  IF NEW.completed = true AND (OLD.completed IS DISTINCT FROM true) THEN
    UPDATE public.weekly_programs
    SET completed_sessions = (
      SELECT COUNT(*)
      FROM public.sessions
      WHERE user_id = NEW.user_id
        AND session_date >= weekly_programs.week_start_date
        AND session_date < weekly_programs.week_end_date
        AND completed = true
    )
    WHERE user_id = NEW.user_id
      AND week_start_date <= NEW.session_date
      AND week_end_date > NEW.session_date;
  END IF;
  RETURN NEW;
END;
$$;
