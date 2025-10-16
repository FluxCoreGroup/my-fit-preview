# Pulse.ai MVP - README

## 📋 Vue d'ensemble

Pulse.ai est une webapp B2C française qui génère des plans sport + nutrition personnalisés via IA. 
Architecture "branchable" avec placeholders pour faciliter l'intégration future du moteur IA réel.

## 🎯 Pages créées

- `/` - Landing (hero, bénéfices, FAQ, CTA)
- `/start` - Onboarding express (5 étapes, <5 min)
- `/preview` - Aperçu gratuit du plan (nutrition + séance)
- `/auth` - Connexion/Inscription (placeholder Clerk)
- `/session` - Séance interactive (timer, RPE, alternatives)
- `/feedback` - Post-séance (30s, RPE, douleurs)
- `/weekly` - Check-in hebdomadaire
- `/paywall` - Abonnement Stripe
- `/dashboard` - Tableau de bord utilisateur
- `/legal` - CGU, Confidentialité, Disclaimers
- `/support` - FAQ + formulaire contact

## 🔧 Variables d'environnement à configurer

```env
# Clerk (Auth) - À configurer via "Add API Key"
VITE_CLERK_PUBLISHABLE_KEY=pk_...

# Stripe (Paiements) - À configurer via "Add API Key"  
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_ID=price_...

# Resend (Emails) - À configurer via "Add API Key"
RESEND_API_KEY=re_...
```

## 🏗️ Architecture "branchable"

### Services Planner (src/services/planner.ts)

**MODE_DEMO = true** : Utilise des données fictives
**MODE_DEMO = false** : Brancher le moteur IA réel

```typescript
// Pour brancher l'IA plus tard :
export const nutritionPlanner = {
  getPreview: (input) => {
    // Remplacer par appel IA
  }
};
```

## ✅ Fonctionnalités implémentées

- ✅ Design system complet (gradients, variants, tokens HSL)
- ✅ Toutes les pages avec navigation
- ✅ Services planner en mode démo
- ✅ Flux utilisateur complet
- ✅ Responsive mobile-first
- ✅ Accessibilité (44px boutons, contrastes)
- ✅ États de chargement

## 🚀 Prochaines étapes

1. **Intégrations** :
   - Activer Clerk pour l'auth
   - Connecter Stripe pour paiements
   - Configurer Resend pour emails
   - Créer tables Supabase

2. **Moteur IA** :
   - Remplacer placeholders dans planner.ts
   - Brancher Lovable AI ou autre LLM

3. **Légal** :
   - Compléter CGU/RGPD avec juriste
   - Obtenir RC Pro

## 📝 Notes importantes

- Pas de règles métier figées - tout est dans planner.ts
- Preview accessible SANS compte (important!)
- 1 séance gratuite avant paywall
- Tous les disclaimers médicaux sont présents
