

# Plan complet : App bilingue EN + NL

## Scope

L'app est 100% en français avec des strings hardcodées dans ~30 fichiers frontend + ~9 edge functions avec des prompts IA en français. Il n'y a aucun système d'internationalisation (i18n) en place.

**Langues cibles** : Anglais (en), Néerlandais (nl) — le français (fr) reste la langue par défaut.

---

## Architecture i18n

### Librairie : `react-i18next` + `i18next`

Pattern standard React, léger, bien supporté. Pas besoin de SSR (Vite SPA).

```text
src/
├── i18n/
│   ├── index.ts              ← config i18next (détection langue, fallback fr)
│   ├── locales/
│   │   ├── fr/
│   │   │   ├── common.json   ← nav, boutons, labels génériques
│   │   │   ├── landing.json  ← textes landing page
│   │   │   ├── onboarding.json
│   │   │   ├── training.json
│   │   │   ├── nutrition.json
│   │   │   ├── coach.json
│   │   │   ├── settings.json
│   │   │   └── auth.json
│   │   ├── en/
│   │   │   └── (mêmes fichiers)
│   │   └── nl/
│   │       └── (mêmes fichiers)
```

### Détection de la langue

1. Préférence utilisateur en DB (`app_preferences.language`) — priorité si connecté
2. `localStorage` — pour visiteurs non connectés
3. Navigateur (`navigator.language`) — fallback initial
4. Français — fallback final

### Sélecteur de langue

- **Landing page** : sélecteur dans le Header (globe icon + dropdown FR/EN/NL)
- **App** : déjà présent dans Settings > Préférences, ajouter "nl" comme option
- Changement de langue = `i18next.changeLanguage()` + mise à jour DB si connecté

---

## Étapes d'implémentation

### Phase 1 — Infrastructure i18n (3 fichiers créés, 2 modifiés)

| Action | Fichier |
|---|---|
| Installer `react-i18next` + `i18next` + `i18next-browser-languagedetector` | package.json |
| Créer config i18n | `src/i18n/index.ts` |
| Créer fichiers JSON fr/en/nl (common, landing) | `src/i18n/locales/*/` |
| Initialiser i18n dans main.tsx | `src/main.tsx` |
| Ajouter sélecteur langue dans Header | `src/components/Header.tsx` |

### Phase 2 — Landing page bilingue (~3 fichiers modifiés)

| Action | Fichier |
|---|---|
| Extraire toutes les strings dans `landing.json` (hero, bénéfices, FAQ, témoignages, CTA) | `src/pages/Landing.tsx` |
| Traduire `landing.json` en EN et NL | `src/i18n/locales/en/landing.json`, `nl/landing.json` |
| Traduire les composants landing annexes | `SocialProofStats.tsx`, `Header.tsx` |

### Phase 3 — Pages app bilingues (~15 fichiers modifiés)

Extraire les strings hardcodées et les remplacer par `t("key")` dans chaque page :

| Groupe | Fichiers |
|---|---|
| Auth | `Auth.tsx`, `Signup.tsx`, `EmailConfirmation.tsx`, `EmailVerified.tsx` |
| Onboarding | `Start.tsx`, `OnboardingIntro.tsx`, `TrainingSetup.tsx`, `Preview.tsx` |
| Hub / Training | `Hub.tsx`, `Training.tsx`, `Session.tsx`, `Feedback.tsx` |
| Nutrition | `Nutrition.tsx`, composants nutrition |
| Settings | `Settings.tsx`, toutes les sous-pages settings |
| Coachs | `CoachAlex.tsx`, `CoachJulie.tsx`, `CoachsIA.tsx` |
| Autres | `Tarif.tsx`, `Support.tsx`, `Legal.tsx`, `NotFound.tsx`, `PaymentSuccess.tsx` |

### Phase 4 — Prompts IA bilingues (9 edge functions modifiées)

Chaque edge function reçoit la `language` de l'utilisateur et adapte le prompt système.

| Edge function | Modification |
|---|---|
| `chat-alex/index.ts` | Prompt système en FR/EN/NL selon langue user, réponses dans la langue user |
| `chat-julie/index.ts` | Idem |
| `generate-weekly-program/index.ts` | Noms d'exercices + consignes dans la langue user |
| `generate-training-session/index.ts` | Idem |
| `generate-training-plan/index.ts` | Idem |
| `generate-nutrition-plan/index.ts` | Noms d'aliments + descriptions dans la langue user |
| `generate-meal/index.ts` | Idem |
| `format-health-data/index.ts` | Formatage dans la langue user |
| `send-weekly-digest/index.ts` | Email digest dans la langue user |

**Méthode** : Le frontend envoie `language` dans le body de chaque requête. L'edge function ajoute une instruction au prompt : `"Réponds UNIQUEMENT en ${languageMap[lang]}"` et adapte les noms de concepts (exercices, aliments).

### Phase 5 — Préférence NL dans la DB + composants

| Action | Fichier |
|---|---|
| Ajouter "nl" comme option dans le select langue | `AppPreferencesSection.tsx` |
| Sync `app_preferences.language` avec `i18next.changeLanguage()` | `AppPreferencesSection.tsx` |
| Prompts client-side (toast, confirmations) via `t()` | Tous les fichiers avec `toast()` |

---

## Détail technique — Prompts IA

Chaque edge function recevra un paramètre `language` et ajoutera au prompt :

```text
// EN
"You are Alex, an expert fitness coach. Respond ONLY in English."

// NL  
"Je bent Alex, een expert fitnesscoach. Antwoord UITSLUITEND in het Nederlands."

// FR (défaut, inchangé)
"Tu es Alex, coach sportif expert..."
```

Les noms d'exercices et d'aliments seront générés dans la langue cible par le modèle IA (pas de dictionnaire statique).

---

## Estimation

| Phase | Fichiers touchés | Complexité |
|---|---|---|
| 1. Infrastructure | ~5 | Moyenne |
| 2. Landing | ~4 | Faible (extraction strings) |
| 3. Pages app | ~20 | Élevée (volume) |
| 4. Prompts IA | ~9 | Moyenne |
| 5. Sync DB | ~2 | Faible |

**Recommandation** : Implémenter phase par phase en commençant par la phase 1 + 2 (landing bilingue fonctionnelle), puis étendre progressivement.

