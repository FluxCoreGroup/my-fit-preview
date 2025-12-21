-- Table pour gérer la queue d'emails d'onboarding et autres
CREATE TABLE public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Policy for service role only (emails are managed by system)
CREATE POLICY "Service role can manage email queue" 
ON public.email_queue 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add last_activity_at to profiles for tracking engagement
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- Function to schedule onboarding emails when user completes onboarding
CREATE OR REPLACE FUNCTION public.schedule_onboarding_emails()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger when onboarding_completed changes from false to true
  IF NEW.onboarding_completed = true AND (OLD.onboarding_completed IS NULL OR OLD.onboarding_completed = false) THEN
    -- Schedule J+1 email (Coach Alex)
    INSERT INTO email_queue (user_id, email_type, scheduled_at, metadata)
    VALUES (
      NEW.id,
      'onboarding_day1',
      NOW() + INTERVAL '1 day',
      jsonb_build_object('name', NEW.name, 'email', NEW.email)
    );
    
    -- Schedule J+3 email (Coach Julie)
    INSERT INTO email_queue (user_id, email_type, scheduled_at, metadata)
    VALUES (
      NEW.id,
      'onboarding_day3',
      NOW() + INTERVAL '3 days',
      jsonb_build_object('name', NEW.name, 'email', NEW.email)
    );
    
    -- Schedule J+7 email (Week 1 Review)
    INSERT INTO email_queue (user_id, email_type, scheduled_at, metadata)
    VALUES (
      NEW.id,
      'onboarding_day7',
      NOW() + INTERVAL '7 days',
      jsonb_build_object('name', NEW.name, 'email', NEW.email)
    );
    
    RAISE LOG 'Onboarding emails scheduled for user %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for scheduling onboarding emails
DROP TRIGGER IF EXISTS on_onboarding_completed ON public.profiles;
CREATE TRIGGER on_onboarding_completed
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.schedule_onboarding_emails();

-- Function to update last_activity_at when session is completed
CREATE OR REPLACE FUNCTION public.update_last_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.completed = true THEN
    UPDATE public.profiles
    SET last_activity_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to update last_activity_at
DROP TRIGGER IF EXISTS on_session_completed ON public.sessions;
CREATE TRIGGER on_session_completed
  AFTER UPDATE ON public.sessions
  FOR EACH ROW
  WHEN (OLD.completed IS DISTINCT FROM NEW.completed AND NEW.completed = true)
  EXECUTE FUNCTION public.update_last_activity();