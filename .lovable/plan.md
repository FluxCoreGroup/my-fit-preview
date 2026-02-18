
# Backlog Admin Dashboard — Améliorations priorisées

## Audit de l'existant

**Ce qui fonctionne bien :**
- RBAC serveur solide (3 edge functions avec vérification `has_role()` indépendante)
- Audit log opérationnel (disable, enable, reset\_password tous loggués)
- Liste utilisateurs avec filtres rôle/statut, recherche email, pagination
- Fiche détail complète (compte, usage, abonnement, historique actions)
- Guard frontend `AdminRoute` + masquage UI conditionnel

**Problèmes identifiés lors de l'audit :**

1. **Bug pagination avec filtre rôle** : le filtre rôle est appliqué côté JS après récupération d'une page de 50 résultats — si les admins sont en page 2, ils n'apparaissent jamais. Le fix récent (`users.length` pour le total) corrige l'affichage du compteur mais pas le fond du problème.
2. **Audit log illisible** : les actions sont affichées en snake\_case brut (`disable_account`, `reset_password`) et les `details` en JSON brut — pas d'interface humaine.
3. **Pas de tri** sur la liste utilisateurs (seulement l'ordre `created_at DESC` figé).
4. **Subscription trialing** : 8 utilisateurs ont le statut `trialing` — ils n'apparaissent pas dans le compteur "abonnements actifs" du dashboard (qui filtre `status = 'active'`).
5. **Pas de graphique** : le dashboard est purement textuel, impossible de voir les tendances sur 8 semaines (les données existent en DB).
6. **Pas d'export CSV** des utilisateurs.
7. **Pas de filtre "inactif"** (utilisateurs sans activité depuis X jours).
8. **Action "changer le rôle" absente** de l'UI — actuellement DB-only.
9. **Reset password** génère un lien affiché en clair dans l'UI, sans expiration visible ni option "envoyer par email directement".
10. **Aucune confirmation** avant disable/enable (seul delete a une confirmation).

---

## Backlog priorisé (Impact / Effort)

### Priorité 1 — Bugs et fiabilité (Impact Haut / Effort Faible)

**1.1 — Corriger le filtre rôle côté backend (bug pagination)**

Problème réel : le filtre rôle se fait en JS après récupération d'une page paginée. Si tous les admins sont après les 50 premiers membres (triés par `created_at DESC`), ils n'apparaissent jamais.

Correction dans `admin-users/index.ts` : joindre `user_roles` côté Supabase avec un filtre SQL au lieu du filtre JS post-fetch. Utiliser une requête avec `.in()` sur les `user_id` filtrés par rôle d'abord.

Fichiers : `supabase/functions/admin-users/index.ts`

**1.2 — Corriger le compteur "abonnements actifs"**

Le dashboard affiche `1` abonné actif mais 8 utilisateurs sont en `trialing`. La métrique doit refléter tous les abonnements payants non expirés (`status IN ('active', 'trialing')`).

Fichiers : `supabase/functions/admin-stats/index.ts`

**1.3 — Ajouter une confirmation avant disable/enable**

Actuellement un clic sur "Désactiver le compte" agit immédiatement, sans dialog de confirmation. Risque d'action accidentelle.

Fichiers : `src/pages/admin/AdminUserDetail.tsx`

---

### Priorité 2 — Ergonomie et lisibilité (Impact Haut / Effort Moyen)

**2.1 — Humaniser l'audit log**

Actions affichées en snake\_case brut (`disable_account`) et `details` en JSON brut. Créer un mapping lisible :

| Clé technique | Libellé affiché | Icône |
|---|---|---|
| `disable_account` | Compte désactivé | 🔒 |
| `enable_account` | Compte réactivé | ✅ |
| `reset_password` | Reset mot de passe envoyé | 🔑 |
| `delete_account` | Compte supprimé | 🗑️ |

Les `details` JSON (ex: `{"email":"..."}`) doivent être traduits en phrases lisibles.

Fichiers : `src/pages/admin/AdminUserDetail.tsx`

**2.2 — Ajouter des graphiques au dashboard**

Les données historiques existent en DB (sessions par semaine, nouveaux utilisateurs). Ajouter 2 mini-graphiques avec Recharts (déjà installé) :
- Évolution des séances complétées par semaine (8 semaines)
- Nouveaux inscrits par semaine (8 semaines)

Nécessite d'enrichir `admin-stats` avec des données temporelles (`sessions_by_week`, `signups_by_week`).

Fichiers : `supabase/functions/admin-stats/index.ts`, `src/pages/admin/AdminDashboard.tsx`

**2.3 — Tri de la liste utilisateurs**

Ajouter des options de tri : date d'inscription, dernière activité, nombre de séances. Un clic sur l'en-tête de colonne change le tri.

Fichiers : `supabase/functions/admin-users/index.ts`, `src/pages/admin/AdminUsers.tsx`

---

### Priorité 3 — Nouvelles fonctionnalités (Impact Moyen / Effort Moyen)

**3.1 — Filtre "Utilisateurs inactifs"**

Ajouter un filtre rapide "Inactifs 14j", "Inactifs 30j" sur la liste utilisateurs. S'appuie sur `last_activity_at` déjà disponible côté backend.

Fichiers : `supabase/functions/admin-users/index.ts`, `src/pages/admin/AdminUsers.tsx`

**3.2 — Export CSV**

Bouton "Exporter CSV" sur la page liste utilisateurs. Génère un fichier `users_YYYY-MM-DD.csv` avec : email, nom, rôle, statut, inscrit le, dernière activité, séances complétées, abonnement.

Peut être 100% côté frontend (prend tous les résultats sans pagination) ou via une edge function dédiée pour les gros volumes.

Fichiers : `src/pages/admin/AdminUsers.tsx` (+ optionnellement une edge function)

**3.3 — Action "Changer le rôle" depuis l'UI**

Ajouter un bouton "Promouvoir admin" / "Rétrograder membre" sur la fiche utilisateur avec confirmation. Écrit dans `user_roles` et logge dans `admin_audit_log`.

Nécessite une nouvelle action dans `admin-actions` : `case "set_role"`.

Garde de sécurité : impossible de se rétrograder soi-même, impossible de rétrograder le dernier admin.

Fichiers : `supabase/functions/admin-actions/index.ts`, `src/pages/admin/AdminUserDetail.tsx`

**3.4 — Filtre "Premium / Trialing / Sans abonnement"**

Ajouter un filtre abonnement sur la liste utilisateurs. Actuellement le badge "Premium" est visible sur les cards mais non filtrable.

Fichiers : `supabase/functions/admin-users/index.ts`, `src/pages/admin/AdminUsers.tsx`

---

### Priorité 4 — Amélioration UX avancée (Impact Moyen / Effort Plus élevé)

**4.1 — Envoyer le reset password par email directement**

Actuellement le lien reset s'affiche en clair dans l'UI (risque de copie accidentelle dans un mauvais canal). Ajouter une option "Envoyer par email" qui appelle `resend` pour envoyer directement le lien à l'adresse de l'utilisateur, sans l'afficher à l'admin.

Fichiers : `supabase/functions/admin-actions/index.ts` (nouvel action `send_reset_email`), `src/pages/admin/AdminUserDetail.tsx`

**4.2 — Indicateur taux de complétion des onboardings**

Métrique utile manquante : % d'utilisateurs ayant complété l'onboarding. En DB : `profiles.onboarding_completed`. Actuellement : 8/8 ont complété (100% selon les données actuelles).

Ajouter cette métrique au dashboard et à la liste utilisateurs (colonne ou badge).

Fichiers : `supabase/functions/admin-stats/index.ts`, `src/pages/admin/AdminDashboard.tsx`

**4.3 — Recherche par nom en plus de l'email**

La recherche actuelle est limitée à l'email (`ilike email`). Ajouter la recherche sur `name` avec un OR.

Fichiers : `supabase/functions/admin-users/index.ts`

---

## Récapitulatif (matrice Impact / Effort)

| # | Amélioration | Impact | Effort | Priorité |
|---|---|---|---|---|
| 1.1 | Fix filtre rôle (bug pagination) | Haut | Faible | P1 — Critique |
| 1.2 | Fix compteur abonnements trialing | Moyen | Faible | P1 — Critique |
| 1.3 | Confirmation avant disable/enable | Haut | Faible | P1 — Sécurité |
| 2.1 | Humaniser l'audit log | Haut | Faible | P2 — Quick win |
| 2.2 | Graphiques dashboard (Recharts) | Haut | Moyen | P2 — Valeur |
| 2.3 | Tri de la liste utilisateurs | Moyen | Faible | P2 — UX |
| 3.1 | Filtre utilisateurs inactifs | Moyen | Faible | P3 |
| 3.2 | Export CSV | Moyen | Moyen | P3 |
| 3.3 | Changer le rôle depuis l'UI | Moyen | Moyen | P3 |
| 3.4 | Filtre abonnement | Faible | Faible | P3 |
| 4.1 | Reset password par email direct | Moyen | Moyen | P4 |
| 4.2 | Taux d'onboarding + métrique | Faible | Faible | P4 |
| 4.3 | Recherche par nom | Faible | Faible | P4 |

---

## Recommandation de lotissement

**Sprint 1 (1-2 jours)** : 1.1 + 1.2 + 1.3 + 2.1 + 2.3 + 4.3 — Tout en faible effort, impact direct sur la fiabilité et l'ergonomie quotidienne.

**Sprint 2 (2-3 jours)** : 2.2 + 3.1 + 3.2 — Valeur perçue forte, données déjà disponibles.

**Sprint 3 (3-5 jours)** : 3.3 + 4.1 — Actions admin enrichies, demandent plus de backend.
