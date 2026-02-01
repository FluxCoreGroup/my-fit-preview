
## Plan : Authentifier les statistiques social proof

### Analyse du probleme actuel

**Statistiques actuellement hardcodees :**
- "4,8/5 sur +1 200 utilisateurs actifs" (hero)
- "1,247+ Membres actifs" (section stats)
- "4.8/5 Note moyenne"
- "-8kg Perte moyenne en 2 mois"

**Donnees reelles en base :**
- 3 utilisateurs inscrits
- 0 abonnement actif
- 20 sessions generees
- 5 feedbacks avec RPE

**Probleme** : Afficher "1,247 utilisateurs" quand tu en as 3 est risque legal (publicite mensongere) et detecte par les utilisateurs avertis.

---

### Strategie recommandee : Progressive Authenticity

L'idee est de passer par 3 phases selon ta croissance, en restant toujours credible.

---

### Phase 1 : Pre-launch (maintenant, moins de 100 utilisateurs)

**Supprimer les chiffres specifiques** et les remplacer par :

| Avant | Apres |
|-------|-------|
| "1,247+ membres actifs" | "Rejoins les premiers membres" |
| "4.8/5 note moyenne" | Badge "Nouveau" ou "Beta" |
| "-8kg perte moyenne" | "Resultats visibles des 4 semaines" |

**Alternative credible** : Utiliser des metriques d'engagement reelles
```
"Plan genere en moins de 2 minutes"
"Programme adapte a 50+ types de materiels"
"Seances de 30 a 60 min selon ton emploi du temps"
```

**Ajouter des badges de confiance** :
- "Satisfait ou rembourse 30 jours"
- "Donnees hebergees en France"
- "Sans engagement"

---

### Phase 2 : Early traction (50-500 utilisateurs)

**Activer les statistiques dynamiques depuis Supabase** :

1. Creer une Edge Function `get-public-stats` qui retourne :
```typescript
{
  totalUsers: 127,           // COUNT(*) FROM profiles
  completedSessions: 843,    // COUNT(*) FROM sessions
  averageSatisfaction: 4.6,  // AVG calculee depuis feedback
  totalWeightLost: 234       // SUM depuis weekly_checkins (optionnel)
}
```

2. Afficher avec un facteur de confiance :
```
"127 membres actifs" (reel)
"843 seances completees" (reel)
"4.6/5 de satisfaction" (calcule depuis feedbacks)
```

3. Mettre en cache (1h) pour eviter les requetes a chaque visite

---

### Phase 3 : Scale (500+ utilisateurs)

Statistiques en temps reel avec :
- Compteur anime qui s'incremente
- "X personnes ont genere leur plan cette semaine"
- Moyenne glissante sur 30 jours

---

### Implementation technique recommandee

#### Etape 1 : Creer la table `public_stats_cache`

```sql
CREATE TABLE public_stats_cache (
  id TEXT PRIMARY KEY DEFAULT 'main',
  total_users INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1),
  avg_weight_loss DECIMAL(3,1),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Etape 2 : Edge Function `get-public-stats`

```typescript
// Retourne les stats publiques avec cache de 1h
const { data } = await supabase
  .from('public_stats_cache')
  .select('*')
  .single();

// Si cache expire (> 1h), recalculer
if (isExpired(data.updated_at)) {
  const stats = await calculateRealStats();
  await supabase.from('public_stats_cache').upsert(stats);
  return stats;
}
return data;
```

#### Etape 3 : Hook `usePublicStats`

```typescript
export const usePublicStats = () => {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('get-public-stats');
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 min cache client
  });
};
```

#### Etape 4 : Composant adaptatif

```tsx
const SocialProofStats = () => {
  const { data: stats } = usePublicStats();
  
  // Phase 1 : Pas assez de donnees
  if (!stats || stats.totalUsers < 50) {
    return (
      <div className="flex gap-4">
        <Badge>Nouveau</Badge>
        <span>Satisfait ou rembourse 30j</span>
        <span>Donnees hebergees en France</span>
      </div>
    );
  }
  
  // Phase 2+ : Statistiques reelles
  return (
    <div className="grid grid-cols-3 gap-8">
      <Stat value={stats.totalUsers} label="Membres actifs" />
      <Stat value={stats.averageRating} suffix="/5" label="Satisfaction" />
      <Stat value={stats.completedSessions} label="Seances completees" />
    </div>
  );
};
```

---

### Changements immediats recommandes (Phase 1)

**Fichier : `src/pages/Landing.tsx`**

1. **Hero** : Remplacer
```tsx
// Avant
<span>4,8/5 sur +1 200 utilisateurs actifs</span>

// Apres
<div className="flex items-center gap-3">
  <Badge variant="secondary">Nouveau</Badge>
  <span>Resultats visibles en 4 semaines, garantis</span>
</div>
```

2. **Section Stats** : Remplacer les faux chiffres par des metriques produit
```tsx
// Avant
<div>1,247+ Membres actifs</div>
<div>4.8/5 Note moyenne</div>
<div>-8kg Perte moyenne</div>

// Apres - Metriques produit reelles
<div>2 min pour ton plan</div>
<div>30j satisfait ou rembourse</div>
<div>24/7 Coach IA disponible</div>
```

3. **Temoignages** : Les garder mais ajouter un disclaimer discret
```tsx
<p className="text-xs text-muted-foreground mt-4">
  *Resultats individuels, peuvent varier selon les profils
</p>
```

---

### Bonnes pratiques UX/Marketing

| A eviter | A privilegier |
|----------|--------------|
| Chiffres ronds suspects (1000, 5000) | Chiffres precis (1,247) |
| "Meilleure app fitness" | "Satisfait ou rembourse" |
| Fausses notes 5/5 partout | Mix de 4 et 5 etoiles |
| Temoignages generiques | Resultats specifiques dates |
| Promesses impossibles | Garantie concrete |

---

### Resume des actions

1. **Immediat** : Retirer les faux chiffres, les remplacer par des badges de confiance et metriques produit
2. **Court terme** : Implementer le systeme de stats dynamiques (Edge Function + cache)
3. **Moyen terme** : Activer l'affichage automatique une fois 50+ utilisateurs atteints
4. **Collecter les vrais temoignages** : Ajouter un systeme de demande d'avis apres X seances completees

Cette approche te permet de rester professionnel et credible a chaque etape de ta croissance.
