-- Create weekly_programs table to track generated programs
CREATE TABLE public.weekly_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  week_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_sessions INTEGER NOT NULL,
  completed_sessions INTEGER NOT NULL DEFAULT 0,
  check_in_completed BOOLEAN NOT NULL DEFAULT false,
  check_in_id UUID REFERENCES public.weekly_checkins(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_weekly_programs_user_week ON public.weekly_programs(user_id, week_start_date);

-- Enable RLS
ALTER TABLE public.weekly_programs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own programs"
ON public.weekly_programs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own programs"
ON public.weekly_programs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs"
ON public.weekly_programs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own programs"
ON public.weekly_programs
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger function to auto-update completed_sessions count
CREATE OR REPLACE FUNCTION public.update_weekly_program_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on sessions table
CREATE TRIGGER session_completed_trigger
AFTER UPDATE OF completed ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_weekly_program_progress();