-- Create app_preferences table for storing user application preferences
CREATE TABLE IF NOT EXISTS public.app_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  language text NOT NULL DEFAULT 'fr',
  units text NOT NULL DEFAULT 'metric',
  notifications boolean NOT NULL DEFAULT true,
  sounds boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.app_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own preferences"
ON public.app_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.app_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.app_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
ON public.app_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_preferences_updated_at
BEFORE UPDATE ON public.app_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();