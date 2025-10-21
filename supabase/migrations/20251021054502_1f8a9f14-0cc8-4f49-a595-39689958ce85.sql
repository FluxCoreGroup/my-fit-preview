-- Ajouter colonnes manquantes à weekly_checkins
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS rpe_avg INTEGER;
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS waist_circumference NUMERIC;
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS pain_zones TEXT[];
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS pain_intensity INTEGER;

-- Créer table pour sauvegarder données des séries (optionnel)
CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES sessions(id),
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weight_used NUMERIC,
  rpe_felt INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS pour exercise_logs
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercise logs"
  ON exercise_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise logs"
  ON exercise_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Créer table pour journal des ajustements
CREATE TABLE IF NOT EXISTS adjustments_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS pour adjustments_log
ALTER TABLE adjustments_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own adjustments"
  ON adjustments_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own adjustments"
  ON adjustments_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);