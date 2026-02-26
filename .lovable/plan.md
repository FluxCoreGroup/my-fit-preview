# Phases 3, 4, 5 — App bilingue complète

Ce plan couvre l'intégralité des phases restantes. Vu le volume (~30+ fichiers frontend, 9 edge functions), je recommande de procéder en sous-étapes successives.

---

## Phase 3 — Pages app bilingues

### 3A. Créer les fichiers de traduction (6 fichiers JSON × 3 langues = 18 fichiers)


| Namespace         | Contenu                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `auth.json`       | Login, reset password, signup, email confirmation                                                                           |
| `onboarding.json` | Start (5 étapes), OnboardingIntro, TrainingSetup, Preview                                                                   |
| `training.json`   | Training page, Session, Feedback, WeeklyFeedback                                                                            |
| `nutrition.json`  | Nutrition page, MealGenerator, RecipeLibrary, HydrationTracker                                                              |
| `coach.json`      | ChatInterface errors, CoachWelcome, DataConsent, shortcuts                                                                  |
| `settings.json`   | Settings menu, toutes sous-pages (Profile, PhysicalInfo, TrainingProgram, Nutrition, Subscription, Support), AppPreferences |


### 3B. Refactorer les pages frontend (~25 fichiers)

Chaque fichier : ajouter `useTranslation()`, remplacer strings hardcodées par `t("key")`.


| Groupe     | Fichiers à modifier                                                                                                                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth       | `Auth.tsx`, `Signup.tsx`, `EmailConfirmation.tsx`, `EmailVerified.tsx`                                                                                                      |
| Onboarding | `Start.tsx` (851 lignes — le plus gros), `OnboardingIntro.tsx`, `TrainingSetup.tsx`, `Preview.tsx`                                                                          |
| Hub        | `Hub.tsx` (greetings, subtitles, module titles, subscription banner)                                                                                                        |
| Training   | `Training.tsx` (554 lignes), `Session.tsx`, `Feedback.tsx`                                                                                                                  |
| Nutrition  | `Nutrition.tsx`, `MealGenerator.tsx`, `RecipeLibrary.tsx`, `HydrationTracker.tsx`, `BodyMetricsTracker.tsx`                                                                 |
| Coachs     | `CoachAlex.tsx`, `CoachJulie.tsx`, `CoachsIA.tsx`, `ChatInterface.tsx` (error messages, shortcuts)                                                                          |
| Settings   | `Settings.tsx`, `Profile.tsx`, `PhysicalInfo.tsx`, `TrainingProgram.tsx`, `settings/Nutrition.tsx`, `Subscription.tsx`, `settings/Support.tsx`, `AppPreferencesSection.tsx` |
| Autres     | `Tarif.tsx`, `Support.tsx`, `Legal.tsx`, `NotFound.tsx`, `PaymentSuccess.tsx`                                                                                               |


### 3C. Composants partagés


| Composant                                                                       | Strings à extraire     |
| ------------------------------------------------------------------------------- | ---------------------- |
| `BackButton.tsx`                                                                | "Retour au Hub" labels |
| `EmptyState.tsx`                                                                | Messages vides         |
| `WelcomeModal.tsx`, `HubTour.tsx`, `OnboardingComplete.tsx`                     | Textes d'onboarding    |
| `SessionPreviewCard.tsx`, `SessionFeedbackModal.tsx`, `WeeklyFeedbackModal.tsx` | UI training            |
| `InstallAppPrompt.tsx`                                                          | Tutoriel PWA           |


### 3D. Date locale dynamique

`Training.tsx` utilise `date-fns/locale/fr` hardcodé. Créer un helper :

```typescript
// src/lib/dateLocale.ts
import { fr } from "date-fns/locale/fr";
import { enUS } from "date-fns/locale/en-US";
import { nl } from "date-fns/locale/nl";
const locales = { fr, en: enUS, nl };
export const getDateLocale = (lang: string) => locales[lang] || fr;
```

### 3E. Mois dans Start.tsx

Les noms de mois du sélecteur de date de naissance sont hardcodés en français. Les remplacer par `t("months.january")` etc.

---

## Phase 4 — Edge functions bilingues

### Principe

Le frontend envoie `language` (depuis `i18next.language` ou `app_preferences.language`) dans le body de chaque appel. Chaque edge function adapte le prompt système.

### Map de langues (partagée)

```typescript
const languageInstructions: Record<string, string> = {
  fr: "Réponds UNIQUEMENT en français.",
  en: "Respond ONLY in English.",
  nl: "Antwoord UITSLUITEND in het Nederlands.",
};
```

### Fichiers à modifier


| Edge function                        | Modification                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `chat-alex/index.ts`                 | Extraire `language` du body, ajouter instruction langue au system prompt                                |
| `chat-julie/index.ts`                | Idem                                                                                                    |
| `generate-weekly-program/index.ts`   | Extraire `language` du body, instruire le modèle de générer noms d'exercices + consignes dans la langue |
| `generate-training-session/index.ts` | Idem                                                                                                    |
| `generate-training-plan/index.ts`    | Idem                                                                                                    |
| `generate-nutrition-plan/index.ts`   | Noms d'aliments + descriptions dans la langue                                                           |
| `generate-meal/index.ts`             | Idem                                                                                                    |
| `format-health-data/index.ts`        | Formatage dans la langue                                                                                |
| `send-weekly-digest/index.ts`        | Email digest dans la langue (requiert fetch de `app_preferences.language`)                              |


### Frontend : envoyer `language`

Modifier chaque appel `supabase.functions.invoke()` pour inclure `language: i18n.language` dans le body. Fichiers concernés :

- `src/hooks/useWeeklyTraining.tsx`
- `src/hooks/useNutritionPlan.tsx`
- `src/hooks/useMealGenerator.tsx`
- `src/services/planner.ts`
- `src/components/coach/ChatInterface.tsx`
- `src/components/training/WeeklyFeedbackModal.tsx`
- `src/pages/Preview.tsx`

### Prompts data/prompts.ts

`juliePromptWithoutAccessToData` est en français. Créer des versions EN/NL ou le rendre dynamique via un paramètre `language`.

---

## Phase 5 — Sync DB + préférence NL et EN et FR

### 5A. Ajouter NL et EN et FR dans AppPreferencesSection

Fichier `src/components/settings/AppPreferencesSection.tsx` : ajouter `<SelectItem value="nl">Nederlands</SelectItem>` dans le select langue.

### 5B. Sync i18next ↔ DB

Quand `app_preferences.language` change :

1. Appeler `i18n.changeLanguage(value)` dans `handlePreferenceChange`
2. Au chargement, dans `fetchPreferences`, appeler `i18n.changeLanguage(data.language)`

### 5C. Sync initiale au login

Dans `src/i18n/index.ts` ou un hook dédié : après login, fetcher `app_preferences.language` et appeler `i18n.changeLanguage()`. La détection actuelle `localStorage > navigator` reste le fallback pour les non-connectés.

---

## Ordre d'implémentation recommandé

Vu le volume, je recommande de découper en **4-5 messages** :

1. **Message 1** : Phase 5 (rapide, 2 fichiers) + Phase 3A (créer les 18 fichiers JSON de traduction)
2. **Message 2** : Phase 3B partie 1 — Auth, Onboarding, Hub
3. **Message 3** : Phase 3B partie 2 — Training, Nutrition, Settings
4. **Message 4** : Phase 3B partie 3 — Coachs, composants partagés, date locale
5. **Message 5** : Phase 4 — Toutes les edge functions

Par quel groupe veux-tu commencer ? TOUS