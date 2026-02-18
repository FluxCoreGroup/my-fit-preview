
# Module Admin Dashboard — Plan d'implémentation complet

## Architecture globale

```text
┌─────────────────────────────────────────────────────────┐
│                  ADMIN DASHBOARD                        │
├─────────────────────────────────────────────────────────┤
│  DB: user_roles table (uuid, user_id, role enum)        │
│  DB: admin_audit_log table (who, action, target, when)  │
├─────────────────────────────────────────────────────────┤
│  Edge Function: admin-stats (métriques globales)        │
│  Edge Function: admin-users (list/detail)               │
│  Edge Function: admin-actions (disable/delete/reset)    │
│  → Chacune vérifie has_role(uid, 'admin') côté serveur  │
├─────────────────────────────────────────────────────────┤
│  Context: useAdminRole() → hook frontend                │
│  Route: AdminRoute guard (client-side UI masquage)      │
│  Pages: /admin → /admin/users → /admin/users/:id        │
└─────────────────────────────────────────────────────────┘
```

## Étape 1 — Migration base de données

### Fichier : `supabase/migrations/[timestamp]_admin_roles.sql`

```sql
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

-- RLS : les admins peuvent voir les rôles, les users voient le leur
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

-- 5. Table audit log des actions admin
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

-- 6. Ajouter colonne is_disabled sur profiles pour soft-delete/disable
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_disabled boolean NOT NULL DEFAULT false;
```

## Étape 2 — Edge Functions (3 nouvelles, toutes protégées RBAC)

### `supabase/functions/admin-stats/index.ts`
Métriques globales admin :
- `total_users` (count profiles)
- `new_users_today/week/month` (profiles.created_at)
- `active_users_7d/30d` (sessions ou profiles.last_activity_at)
- `completed_sessions_total/week`
- `weekly_checkins_count` (pour taux de review)
- `subscriptions_active` count

Authentification : `getClaims()` → vérifie `has_role(userId, 'admin')` → 403 sinon.

### `supabase/functions/admin-users/index.ts`
Liste et détail utilisateurs :
- `GET ?page=1&limit=50&search=email&role=admin&status=active` → liste paginée
- `GET ?userId=uuid` → fiche détaillée (profil + goals + sessions count + subscription)

Joint : `profiles` + `user_roles` + `subscriptions` + sessions count + weekly_programs count.

Authentification : idem, guard admin obligatoire.

### `supabase/functions/admin-actions/index.ts`
Actions admin :
- `POST { action: "disable", targetUserId }` → `profiles.is_disabled = true`
- `POST { action: "enable", targetUserId }` → `profiles.is_disabled = false`
- `POST { action: "delete", targetUserId, confirm: "DELETE" }` → supprime données + auth user
- `POST { action: "reset_password", targetUserId }` → `auth.admin.generateLink(recovery)`
- Garde : impossible de s'auto-supprimer, impossible de supprimer le dernier admin

Chaque action écrit dans `admin_audit_log`.

## Étape 3 — Contexte frontend (hook)

### `src/hooks/useAdminRole.tsx`
```typescript
// Appel Supabase pour vérifier le rôle de l'utilisateur courant
// Retourne { isAdmin: boolean, isLoading: boolean }
// Utilise React Query avec cache de 5 min
// Requête : supabase.from("user_roles").select("role")
//            .eq("user_id", user.id).eq("role", "admin").maybeSingle()
```

Important : l'état `isLoading` doit être vérifié avant d'afficher quoi que ce soit — pas de flash de contenu non autorisé.

## Étape 4 — Guard de route frontend

### `src/components/AdminRoute.tsx`
```typescript
// Similaire à ProtectedRoute mais vérifie isAdmin
// Si isLoading → spinner
// Si !isAdmin → <Navigate to="/hub" /> + toast "Accès refusé"
// Si isAdmin → <>{children}</>
```

## Étape 5 — Pages Admin (3 pages)

### `src/pages/admin/AdminDashboard.tsx`
Vue globale avec KPIs en cards :
- Utilisateurs totaux / nouveaux (7j) / actifs (30j)
- Séances complétées / cette semaine
- Abonnements actifs
- Taux de check-in hebdo (%)
- Navigation vers la liste utilisateurs

### `src/pages/admin/AdminUsers.tsx`
Table utilisateurs avec :
- Colonnes : Email, Nom, Rôle, Statut (actif/désactivé), Créé le, Dernière activité, Nb séances, Abonnement
- Barre de recherche (email)
- Filtres : rôle, statut, activité récente
- Pagination (50/page)
- Click sur ligne → fiche détail

### `src/pages/admin/AdminUserDetail.tsx`
Fiche utilisateur :
- Infos compte (email, rôle, statut, dates)
- Indicateurs usage (sessions count, check-ins, semaines actives)
- Programme actif si existe
- Abonnement actuel
- Actions : Désactiver / Réactiver / Supprimer (modal de confirmation avec saisie "DELETE") / Reset password
- Historique des actions admin (audit log filtré par target_user_id)

## Étape 6 — Intégration navigation

### `src/pages/Hub.tsx`
Ajouter une `ModuleCard` "Admin" conditionnelle :
```typescript
const { isAdmin } = useAdminRole();
// ...
{isAdmin && (
  <ModuleCard
    icon={ShieldCheck}
    title="Admin"
    subtitle="Dashboard"
    iconColor="0 72% 51%"
    to="/admin"
  />
)}
```

### `src/components/Header.tsx`
Dans la nav desktop et le menu mobile : ajouter lien "Admin" conditionnel à `isAdmin`.

### `src/App.tsx`
Ajouter les routes :
```typescript
<Route path="/admin" element={<AdminRoute><AppLayout><AdminDashboard /></AppLayout></AdminRoute>} />
<Route path="/admin/users" element={<AdminRoute><AppLayout><AdminUsers /></AppLayout></AdminRoute>} />
<Route path="/admin/users/:userId" element={<AdminRoute><AppLayout><AdminUserDetail /></AppLayout></AdminRoute>} />
```

### `supabase/config.toml`
Ajouter :
```toml
[functions.admin-stats]
verify_jwt = false

[functions.admin-users]
verify_jwt = false

[functions.admin-actions]
verify_jwt = false
```
(JWT vérifié manuellement dans le code avec getClaims + has_role)

## Fichiers à créer/modifier

| Fichier | Type | Description |
|---|---|---|
| `supabase/migrations/[ts]_admin_roles.sql` | CREATE | user_roles, has_role(), audit_log, is_disabled |
| `supabase/functions/admin-stats/index.ts` | CREATE | KPIs admin protégés |
| `supabase/functions/admin-users/index.ts` | CREATE | Liste + détail users admin |
| `supabase/functions/admin-actions/index.ts` | CREATE | Actions (disable/delete/reset) + audit |
| `src/hooks/useAdminRole.tsx` | CREATE | Hook rôle admin avec React Query |
| `src/components/AdminRoute.tsx` | CREATE | Guard de route admin |
| `src/pages/admin/AdminDashboard.tsx` | CREATE | Page overview KPIs |
| `src/pages/admin/AdminUsers.tsx` | CREATE | Liste utilisateurs avec filtres |
| `src/pages/admin/AdminUserDetail.tsx` | CREATE | Fiche utilisateur + actions |
| `src/App.tsx` | EDIT | Ajout routes /admin/* |
| `src/pages/Hub.tsx` | EDIT | ModuleCard "Admin" conditionnel |
| `src/components/Header.tsx` | EDIT | Lien nav "Admin" conditionnel |
| `supabase/config.toml` | EDIT | Ajouter les 3 nouvelles functions |
| `src/integrations/supabase/types.ts` | AUTO | Mis à jour automatiquement par la migration |

## Sécurités implémentées

- Rôles dans une table séparée `user_roles` (jamais sur `profiles`)
- Fonction `has_role()` en SECURITY DEFINER (pas de récursion RLS)
- Vérification backend obligatoire dans chaque edge function (pas de confiance au frontend)
- Impossible de s'auto-supprimer ou de supprimer le dernier admin
- Audit log de toutes les actions admin (qui, quoi, quand, sur qui)
- Guard frontend `AdminRoute` pour masquer l'UI (jamais seule barrière)
- Confirmation explicite pour suppression (saisie "DELETE")
