

## Plan : Paywall frontend + Refresh periodique du statut d'abonnement

### Probleme actuel

1. **Pas de paywall frontend** : Un utilisateur dont l'abonnement a expire peut acceder a `/hub`, `/training`, `/nutrition`, `/coach/alex`, `/coach/julie` sans restriction. Seules les Edge Functions `chat-alex` et `chat-julie` retournent un 403, ce qui genere un toast d'erreur peu explicite.

2. **Pas de refresh periodique** : Le statut d'abonnement n'est verifie que quand le composant `SubscriptionSection` est monte (page parametres). Le `useSubscription` n'est utilise nulle part ailleurs. Aucun polling, aucun listener realtime.

---

### Architecture cible

```text
main.tsx
  └─ AuthProvider
       └─ SubscriptionProvider  (NOUVEAU)
            └─ App
                 └─ Routes
                      ├─ ProtectedRoute (auth only)
                      │    └─ /settings, /hub, /feedback, /onboarding-intro
                      └─ SubscriptionRoute (NOUVEAU : auth + abo)
                           └─ /training, /nutrition, /coach/alex, /coach/julie, /session
```

---

### Etape 1 : Creer un `SubscriptionContext`

**Nouveau fichier** : `src/contexts/SubscriptionContext.tsx`

- Deplacer la logique de `useSubscription` dans un Context global
- Le Provider appelle `check-subscription` une fois au montage quand `user` est present
- Met en place un **polling toutes les 60 secondes** via `setInterval` (uniquement si l'utilisateur est connecte)
- Expose : `status`, `planInterval`, `subscriptionEnd`, `trialEnd`, `isRefreshing`, `isPortalLoading`, `refreshSubscription`, `openCustomerPortal`
- Re-verifie automatiquement quand `user` change (login/logout)

```text
Signature du context :
{
  status: "loading" | "active" | "trialing" | "inactive" | "error"
  planInterval: "week" | "month" | "year" | null
  subscriptionEnd: string | null
  trialEnd: string | null
  isRefreshing: boolean
  isPortalLoading: boolean
  refreshSubscription: () => Promise<void>
  openCustomerPortal: () => Promise<void>
}
```

### Etape 2 : Integrer le Provider dans `main.tsx`

- Wrapper `App` avec `<SubscriptionProvider>` juste apres `<AuthProvider>`
- Le context est donc accessible partout dans l'app

### Etape 3 : Creer un composant `SubscriptionRoute`

**Nouveau fichier** : `src/components/SubscriptionRoute.tsx`

- Combine `ProtectedRoute` (verifie auth) + verification de l'abonnement
- Si `status === "loading"` : affiche le meme loader que `ProtectedRoute`
- Si `status === "active"` ou `status === "trialing"` : affiche les `children`
- Si `status === "inactive"` ou `status === "error"` : redirige vers `/tarif` avec un toast explicatif ("Ton abonnement a expire, reabonne-toi pour continuer")

### Etape 4 : Mettre a jour les routes dans `App.tsx`

Remplacer `<ProtectedRoute>` par `<SubscriptionRoute>` sur les routes premium :

| Route | Avant | Apres |
|-------|-------|-------|
| `/training` | ProtectedRoute | **SubscriptionRoute** |
| `/nutrition` | ProtectedRoute | **SubscriptionRoute** |
| `/coach/alex` | ProtectedRoute | **SubscriptionRoute** |
| `/coach/julie` | ProtectedRoute | **SubscriptionRoute** |
| `/session` | ProtectedRoute | **SubscriptionRoute** |

Les routes suivantes restent avec `ProtectedRoute` (accessibles sans abo) :
- `/hub`, `/settings/*`, `/feedback`, `/onboarding-intro`

### Etape 5 : Adapter `SubscriptionSection.tsx`

- Remplacer `useSubscription()` par `useSubscriptionContext()` (le nouveau hook du context)
- Supprimer l'import de `useSubscription`
- Le comportement reste identique, seule la source de donnees change

### Etape 6 : Adapter `useSubscription.tsx`

- Garder le fichier comme un re-export du context pour la retrocompatibilite, ou le supprimer et migrer les imports
- Option recommandee : supprimer et migrer vers `useSubscriptionContext` pour eviter la confusion

### Etape 7 : Bandeau sur le Hub pour abonnement expire

Dans `Hub.tsx`, ajouter un bandeau conditionnel quand `status === "inactive"` :

```text
┌─────────────────────────────────────────┐
│  ⚠️  Ton abonnement a expire           │
│  Reabonne-toi pour acceder a tes       │
│  entrainements et coachs IA            │
│  [ Se reabonner → ]                    │
└─────────────────────────────────────────┘
```

Ce bandeau utilise `useSubscriptionContext()` et redirige vers `/tarif`.

---

### Section technique - Details d'implementation

**Polling dans SubscriptionContext :**
```text
useEffect(() => {
  if (!user) return;
  checkSubscription();  // appel initial
  const interval = setInterval(checkSubscription, 60_000);  // toutes les 60s
  return () => clearInterval(interval);
}, [user]);
```

**SubscriptionRoute - logique :**
```text
- Verifie d'abord l'auth (comme ProtectedRoute)
- Puis verifie le status d'abonnement via le context
- status "loading" → spinner
- status "active" | "trialing" → children
- status "inactive" | "error" → Navigate to /tarif + toast
```

**Fichiers crees :**
1. `src/contexts/SubscriptionContext.tsx`
2. `src/components/SubscriptionRoute.tsx`

**Fichiers modifies :**
1. `src/main.tsx` - ajout du SubscriptionProvider
2. `src/App.tsx` - remplacement ProtectedRoute par SubscriptionRoute sur les routes premium
3. `src/components/settings/SubscriptionSection.tsx` - migration vers le context
4. `src/pages/Hub.tsx` - ajout du bandeau d'expiration
5. `src/hooks/useSubscription.tsx` - suppression ou transformation en re-export

