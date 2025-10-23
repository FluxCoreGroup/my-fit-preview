-- Optimisation table weekly_checkins pour système de check-in hebdomadaire

-- Ajouter nouvelles colonnes
ALTER TABLE public.weekly_checkins
ADD COLUMN IF NOT EXISTS week_iso text,
ADD COLUMN IF NOT EXISTS weight_measure_1 numeric,
ADD COLUMN IF NOT EXISTS weight_measure_2 numeric,
ADD COLUMN IF NOT EXISTS weight_measure_3 numeric,
ADD COLUMN IF NOT EXISTS has_pain boolean DEFAULT false;

-- Modifier energy_level pour simplifier
ALTER TABLE public.weekly_checkins
ALTER COLUMN energy DROP DEFAULT,
ALTER COLUMN energy TYPE text;

-- Renommer energy en energy_level pour clarté
ALTER TABLE public.weekly_checkins
RENAME COLUMN energy TO energy_level;

-- Supprimer colonnes non essentielles
ALTER TABLE public.weekly_checkins
DROP COLUMN IF EXISTS waist_circumference,
DROP COLUMN IF EXISTS sessions_planned,
DROP COLUMN IF EXISTS sessions_done,
DROP COLUMN IF EXISTS hunger,
DROP COLUMN IF EXISTS sleep,
DROP COLUMN IF EXISTS pain_intensity;

-- Créer fonction de calcul automatique du poids moyen
CREATE OR REPLACE FUNCTION public.calculate_average_weight()
RETURNS TRIGGER AS $$
BEGIN
  NEW.average_weight := (
    COALESCE(NEW.weight_measure_1, 0) + 
    COALESCE(NEW.weight_measure_2, 0) + 
    COALESCE(NEW.weight_measure_3, 0)
  ) / NULLIF(
    (CASE WHEN NEW.weight_measure_1 IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN NEW.weight_measure_2 IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN NEW.weight_measure_3 IS NOT NULL THEN 1 ELSE 0 END), 
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer trigger pour calcul automatique
DROP TRIGGER IF EXISTS calculate_weight_average ON public.weekly_checkins;
CREATE TRIGGER calculate_weight_average
  BEFORE INSERT OR UPDATE ON public.weekly_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_average_weight();

-- Créer fonction pour générer week_iso automatiquement
CREATE OR REPLACE FUNCTION public.set_week_iso()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.week_iso IS NULL THEN
    NEW.week_iso := TO_CHAR(NEW.created_at, 'IYYY-"W"IW');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer trigger pour week_iso automatique
DROP TRIGGER IF EXISTS set_checkin_week_iso ON public.weekly_checkins;
CREATE TRIGGER set_checkin_week_iso
  BEFORE INSERT ON public.weekly_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.set_week_iso();

-- Contrainte unique : 1 check-in par semaine par utilisateur
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_checkins_user_week 
ON public.weekly_checkins(user_id, week_iso);

-- Mettre à jour RLS policy pour insertion (simplifiée)
DROP POLICY IF EXISTS "Users can insert own checkins" ON public.weekly_checkins;
CREATE POLICY "Users can insert own checkins" ON public.weekly_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy pour update (seulement dans les 24h)
DROP POLICY IF EXISTS "Users can update recent checkins" ON public.weekly_checkins;
CREATE POLICY "Users can update recent checkins" ON public.weekly_checkins
  FOR UPDATE USING (
    auth.uid() = user_id AND
    created_at > NOW() - INTERVAL '24 hours'
  );