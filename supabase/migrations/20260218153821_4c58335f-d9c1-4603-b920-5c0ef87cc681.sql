-- =============================================
-- Priorité 1 : Auto-unlock semaines bloquées
-- =============================================

-- 1. Débloquer toutes les semaines terminées il y a > 7 jours sans check-in
UPDATE weekly_programs
SET check_in_completed = true
WHERE check_in_completed = false
  AND week_end_date < NOW() - INTERVAL '7 days';

-- =============================================
-- Priorité 2 : Colonnes pour review post-séance
-- =============================================

-- 2. Ajouter partially_completed dans sessions
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS partially_completed boolean DEFAULT false;

-- 3. Ajouter satisfaction dans feedback (1-5 étoiles)
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS satisfaction integer CHECK (satisfaction >= 1 AND satisfaction <= 5);