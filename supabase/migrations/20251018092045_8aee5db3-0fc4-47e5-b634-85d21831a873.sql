-- Remove trigger from profiles table
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;

-- Create new trigger on goals table to send welcome email after onboarding completion
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_goals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
  function_url text;
  user_profile RECORD;
BEGIN
  -- Get user profile information
  SELECT name, email INTO user_profile
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Only send email if profile exists
  IF user_profile IS NOT NULL THEN
    -- Construct the Edge Function URL
    function_url := 'https://nsowlnpntphxwykzbwmc.supabase.co/functions/v1/send-welcome-email';
    
    -- Make async HTTP request to Edge Function
    SELECT net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'name', user_profile.name,
        'email', user_profile.email,
        'user_id', NEW.user_id
      )
    ) INTO request_id;
    
    -- Log the request for debugging
    RAISE LOG 'Welcome email webhook triggered after goals completion for user % (id: %) with request_id %', 
              user_profile.email, NEW.user_id, request_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on goals table
CREATE TRIGGER on_goals_created_send_welcome
  AFTER INSERT ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_goals();

-- Add comment for documentation
COMMENT ON FUNCTION public.send_welcome_email_on_goals() IS 'Sends a welcome email via Edge Function after user completes onboarding (goals setup)';
