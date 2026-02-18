
-- 1. Créer le type enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- 2. Créer la table user_roles (séparée des profiles, sécurité oblige)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS : les users voient leur propre rôle
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Fonction security definer pour vérifier le rôle (évite récursion RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Trigger : créer un rôle 'member' à chaque inscription
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- 5. Rétroactivement créer les rôles 'member' pour les utilisateurs existants
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'member'::public.app_role
FROM auth.users
ON CONFLICT DO NOTHING;

-- 6. Table audit log des actions admin
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  target_user_id uuid,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.admin_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit log" ON public.admin_audit_log
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Ajouter colonne is_disabled sur profiles pour soft-disable
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_disabled boolean NOT NULL DEFAULT false;
