

## Plan : Supprimer le temps de chargement du Social Proof

### Probleme identifie

Le composant `HeroSocialProof` affiche un skeleton pendant que la requete `get-public-stats` se charge, alors qu'en Phase 1, le contenu final est toujours statique (badge "Nouveau" + texte).

### Solution

Afficher immediatement le contenu Phase 1 sans attendre la requete API, et ne verifier les stats reelles qu'en arriere-plan pour preparer la Phase 2.

---

### Modifications

**Fichier : `src/components/landing/SocialProofStats.tsx`**

#### HeroSocialProof (ligne 91-123)

Supprimer le skeleton et afficher directement le contenu :

```tsx
export const HeroSocialProof = () => {
  const { data: stats } = usePublicStats();
  
  const showRealStats = stats && stats.total_users >= MINIMUM_USERS_FOR_STATS;

  // Phase 2+ : Stats reelles (transition fluide une fois les donnees chargees)
  if (showRealStats && stats.average_rating) {
    return (
      <div className="flex items-center justify-center gap-2 text-primary-foreground/90 py-2">
        <Star className="w-5 h-5 fill-accent text-accent" />
        <span className="text-base md:text-lg font-semibold">
          {stats.average_rating.toFixed(1)}/5 sur {stats.total_users.toLocaleString('fr-FR')} membres
        </span>
      </div>
    );
  }

  // Phase 1 : Affichage immediat sans attendre (plus de skeleton)
  return (
    <div className="flex items-center justify-center gap-3 text-primary-foreground/90 py-2 flex-wrap">
      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
        <Sparkles className="w-3 h-3 mr-1" />
        Nouveau
      </Badge>
      <span className="text-base md:text-lg font-medium">
        Resultats visibles en 4 semaines, garantis
      </span>
    </div>
  );
};
```

#### SocialProofStats (ligne 8-88)

Meme logique - afficher les badges de confiance immediatement :

```tsx
export const SocialProofStats = () => {
  const { data: stats } = usePublicStats();
  
  const showRealStats = stats && stats.total_users >= MINIMUM_USERS_FOR_STATS;

  // Phase 2+ : Stats reelles
  if (showRealStats) {
    return (/* ... stats reelles ... */);
  }

  // Phase 1 : Affichage immediat des badges de confiance
  return (/* ... badges 2min / 30j / 24-7 ... */);
};
```

---

### Comportement final

| Scenario | Avant | Apres |
|----------|-------|-------|
| Phase 1, premiere visite | Skeleton 200-500ms puis badges | Badges affiches immediatement |
| Phase 1, visite suivante | Badges (depuis cache) | Badges immediatement |
| Phase 2 (50+ users) | Skeleton puis stats | Badges puis transition vers stats |

---

### Avantage supplementaire

Quand tu atteindras 50+ utilisateurs, la transition se fera en douceur : les badges s'affichent d'abord, puis les vraies stats apparaissent une fois les donnees chargees. Pas de "flash" de contenu.

---

### Section technique

- Aucune dependance ajoutee
- Le hook `usePublicStats` continue de fonctionner en arriere-plan pour preparer la Phase 2
- Le cache client de 30 minutes reste actif

