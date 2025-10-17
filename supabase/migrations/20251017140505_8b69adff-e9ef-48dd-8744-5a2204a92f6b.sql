-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create training_preferences table
CREATE TABLE public.training_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  split_preference TEXT,
  cardio_intensity TEXT,
  priority_zones TEXT[],
  limitations TEXT[],
  favorite_exercises TEXT,
  exercises_to_avoid TEXT,
  progression_focus TEXT NOT NULL,
  mobility_preference TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own training preferences"
  ON public.training_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training preferences"
  ON public.training_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training preferences"
  ON public.training_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own training preferences"
  ON public.training_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_training_preferences_updated_at
  BEFORE UPDATE ON public.training_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();