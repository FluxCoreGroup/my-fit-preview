-- Table de cache pour les statistiques publiques (landing page)
-- Accessible publiquement en lecture, mise à jour par Edge Function

CREATE TABLE public.public_stats_cache (
  id TEXT PRIMARY KEY DEFAULT 'main',
  total_users INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1),
  avg_weight_loss DECIMAL(3,1),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer une ligne par défaut
INSERT INTO public.public_stats_cache (id, total_users, completed_sessions, average_rating, avg_weight_loss, updated_at)
VALUES ('main', 0, 0, NULL, NULL, NOW());

-- RLS : Lecture publique (pas d'auth requise pour la landing page)
ALTER TABLE public.public_stats_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public stats"
ON public.public_stats_cache
FOR SELECT
USING (true);

CREATE POLICY "Service role can update stats"
ON public.public_stats_cache
FOR ALL
USING (true)
WITH CHECK (true);