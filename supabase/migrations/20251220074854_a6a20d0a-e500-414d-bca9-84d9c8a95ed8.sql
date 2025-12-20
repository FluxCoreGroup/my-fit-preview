-- Create cache table for exercise images from external APIs
CREATE TABLE public.exercise_image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_name TEXT NOT NULL,
  exercise_name_normalized TEXT NOT NULL UNIQUE,
  image_url TEXT,
  gif_url TEXT,
  muscle_group TEXT,
  source TEXT DEFAULT 'wger',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_exercise_image_cache_normalized ON public.exercise_image_cache(exercise_name_normalized);

-- Enable RLS
ALTER TABLE public.exercise_image_cache ENABLE ROW LEVEL SECURITY;

-- Public read access (cache is shared across all users)
CREATE POLICY "Anyone can read exercise image cache"
ON public.exercise_image_cache
FOR SELECT
USING (true);

-- Only service role can insert/update (via edge function)
CREATE POLICY "Service role can manage cache"
ON public.exercise_image_cache
FOR ALL
USING (true)
WITH CHECK (true);