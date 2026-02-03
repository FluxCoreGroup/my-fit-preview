-- Fix email_queue security: Remove public access, restrict to service role only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage email queue" ON public.email_queue;

-- Create a policy that denies all access (only service_role can bypass RLS)
-- This ensures no regular users can read/write the email queue
CREATE POLICY "No public access to email queue" 
ON public.email_queue 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);