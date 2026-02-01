# Plan : Authentifier les statistiques social proof

## ✅ COMPLÉTÉ

### Ce qui a été implémenté

1. **Table `public_stats_cache`** - Cache des statistiques publiques
   - `total_users`, `completed_sessions`, `average_rating`, `avg_weight_loss`
   - RLS : lecture publique, écriture service role uniquement

2. **Edge Function `get-public-stats`**
   - Calcule les vraies stats depuis `profiles`, `sessions`, `feedback`, `weekly_checkins`
   - Cache de 1h côté serveur
   - Endpoint public (pas de JWT requis)

3. **Hook `usePublicStats`**
   - Cache client de 30 min via TanStack Query
   - Fetch automatique des stats

4. **Composants adaptatifs**
   - `SocialProofStats` : Affiche badges de confiance (Phase 1) ou vraies stats (Phase 2+)
   - `HeroSocialProof` : Badge "Nouveau" ou vraies stats dans le hero
   - Seuil automatique : 50 utilisateurs pour passer en Phase 2

5. **Landing.tsx mis à jour**
   - Import des composants dynamiques
   - Remplacement des stats hardcodées
   - Ajout du disclaimer sous les témoignages

---

## Comportement actuel

### Phase 1 (< 50 utilisateurs) - ACTIF
- Hero : Badge "Nouveau" + "Résultats visibles en 4 semaines, garantis"
- Stats : "2 min pour ton plan" / "30 jours satisfait ou remboursé" / "24/7 Coach IA disponible"

### Phase 2 (50-500 utilisateurs) - AUTOMATIQUE
Dès que `total_users >= 50` dans la base :
- Hero : "X/5 sur Y membres"
- Stats : Compteurs réels animés

### Phase 3 (500+ utilisateurs) - À IMPLÉMENTER
- Compteurs animés temps réel
- "X personnes ont généré leur plan cette semaine"

---

## Prochaines étapes optionnelles

1. [ ] Système de collecte d'avis après 5 séances
2. [ ] Animation des compteurs (framer-motion)
3. [ ] Métriques "cette semaine" temps réel
