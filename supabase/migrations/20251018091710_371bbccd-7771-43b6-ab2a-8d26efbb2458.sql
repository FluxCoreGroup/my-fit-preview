-- Update the welcome email webhook function to include user_id
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
  
  -- Make async HTTP request to Edge Function with user_id
  SELECT net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'user_id', NEW.id
    )
  ) INTO request_id;
  
  -- Log the request for debugging
  RAISE LOG 'Welcome email webhook triggered for user % (id: %) with request_id %', NEW.email, NEW.id, request_id;
  
  RETURN NEW;
END;
$$;