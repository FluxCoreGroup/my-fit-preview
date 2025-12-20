-- Revoke all default privileges from anon role on profiles table
REVOKE ALL ON public.profiles FROM anon;

-- Revoke all default privileges from anon role on subscriptions table  
REVOKE ALL ON public.subscriptions FROM anon;

-- Grant only to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;

-- Verify RLS is forced on both tables
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;