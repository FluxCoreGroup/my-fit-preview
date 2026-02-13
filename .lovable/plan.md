## Todolist : Ameliorer la gestion d'abonnement

### Bug critique : Faux message "abonnement expire" au chargement

**Cause racine** : Dans `SubscriptionContext`, quand `user` est `null` (pendant le chargement de l'auth), le `useEffect` met immediatement le status a `"inactive"`. L'auth se charge en ~200ms, mais pendant ce laps de temps, le Hub affiche deja le bandeau "Ton abonnement a expire" et le toast se declenche.

**Correction** :

1. **Ne pas setter "inactive" tant que l'auth n'a pas fini de charger**
  - Fichier : `src/contexts/SubscriptionContext.tsx`
  - Importer `loading` depuis `useAuth()` en plus de `user`
  - Dans le `useEffect` : si `loading` est `true`, ne rien faire (garder le status `"loading"`)
  - Mettre `"inactive"` uniquement quand `loading === false && !user`
2. **Ne pas afficher le bandeau tant que le status est "loading"**
  - Fichier : `src/pages/Hub.tsx`
  - Le bandeau "abonnement expire" ne s'affiche deja que pour `"inactive"`, mais la correction du contexte garantit que `"inactive"` ne sera set que quand on est sur que l'utilisateur n'a pas d'abonnement
3. **Proteger le toast dans SubscriptionRoute**
  - Fichier : `src/components/SubscriptionRoute.tsx`
  - Le toast "Ton abonnement a expire" ne doit pas se declencher si le status vient juste de passer de `"loading"` a `"inactive"` au premier rendu

---

Amélioration, faire une page si l'utilisateur est "inactive" ou qu'il n'a pas payé pour qu'il puisse directement repayer sans passer par /tarif

---

### Section technique

**Fichiers modifies** :


| Fichier                                | Changement                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/contexts/SubscriptionContext.tsx` | Importer `loading` de `useAuth()`, ne setter `"inactive"` que quand `loading === false && !user` |
| `src/components/SubscriptionRoute.tsx` | Ajouter un guard pour ne pas toast/rediriger pendant le chargement initial                       |
| &nbsp;                                 | &nbsp;                                                                                           |


**Changement principal dans SubscriptionContext** :

```text
// AVANT (bug)
useEffect(() => {
  if (!user) {
    setStatus("inactive");  // <-- se declenche avant que l'auth ait charge
    return;
  }
  checkSubscription();
  ...
}, [user, checkSubscription]);

// APRES (correction)
useEffect(() => {
  if (loading) return;  // attend que l'auth finisse
  if (!user) {
    setStatus("inactive");
    return;
  }
  checkSubscription();
  ...
}, [user, loading, checkSubscription]);
```

**Priorite** :

- Items 1-3 : correction du bug critique (faux "expire") -- a faire maintenant
- Items 4-5 : robustesse reseau -- recommande
- Items 6-7 : ameliorations UX -- nice to have