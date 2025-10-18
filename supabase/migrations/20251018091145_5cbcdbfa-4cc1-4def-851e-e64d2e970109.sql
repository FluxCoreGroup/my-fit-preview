-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to send welcome email via Edge Function
CREATE OR REPLACE FUNCTION public.send_welcome_email_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_id bigint;
  function_url text;
BEGIN
  -- Construct the Edge Function URL
  function_url := 'https://nsowlnpntphxwykzbwmc.supabase.co/functions/v1/send-welcome-email';
  
  -- Make async HTTP request to Edge Function
  SELECT net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'name', NEW.name,
      'email', NEW.email
    )
  ) INTO request_id;
  
  -- Log the request for debugging
  RAISE LOG 'Welcome email webhook triggered for user % with request_id %', NEW.email, request_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to send welcome email when new profile is created
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;

CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_webhook();

-- Add comment for documentation
COMMENT ON FUNCTION public.send_welcome_email_webhook() IS 'Sends a welcome email via Edge Function when a new user profile is created';