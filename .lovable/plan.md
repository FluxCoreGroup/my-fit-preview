

# Ce qui reste à faire pour FR/EN/NL

## Etat actuel

**Fait (4 fichiers)** : `Landing.tsx`, `SocialProofStats.tsx`, `Header.tsx` (sélecteur langue), `AppPreferencesSection.tsx` (sync DB).
**Fichiers JSON** : Les 18 fichiers de traduction (6 namespaces × 3 langues) existent déjà.
**Infrastructure** : `i18n/index.ts`, `dateLocale.ts` — en place.

## Ce qui reste

### Phase 3B — Pages frontend (~25 fichiers, strings hardcodées en français)

| Groupe | Fichiers | Namespace |
|---|---|---|
| Auth | `Auth.tsx`, `Signup.tsx`, `EmailConfirmation.tsx`, `EmailVerified.tsx` | `auth` |
| Onboarding | `Start.tsx`, `OnboardingIntro.tsx`, `TrainingSetup.tsx`, `Preview.tsx` | `onboarding` |
| Hub | `Hub.tsx` | `common` |
| Training | `Training.tsx`, `Session.tsx`, `Feedback.tsx` | `training` |
| Nutrition | `Nutrition.tsx`, `MealGenerator.tsx`, `RecipeLibrary.tsx`, `HydrationTracker.tsx`, `BodyMetricsTracker.tsx` | `nutrition` |
| Coachs | `CoachAlex.tsx`, `CoachJulie.tsx`, `CoachsIA.tsx`, `ChatInterface.tsx` | `coach` |
| Settings | `Settings.tsx`, `Profile.tsx`, `PhysicalInfo.tsx`, `TrainingProgram.tsx`, `settings/Nutrition.tsx`, `Subscription.tsx`, `settings/Support.tsx` | `settings` |
| Autres | `Tarif.tsx`, `Support.tsx`, `Legal.tsx`, `NotFound.tsx`, `PaymentSuccess.tsx` | `common` |

### Phase 3C — Composants partagés (~10 fichiers)

`BackButton.tsx`, `EmptyState.tsx`, `WelcomeModal.tsx`, `HubTour.tsx`, `OnboardingComplete.tsx`, `SessionPreviewCard.tsx`, `SessionFeedbackModal.tsx`, `WeeklyFeedbackModal.tsx`, `InstallAppPrompt.tsx`, `PostWorkoutShareModal.tsx`, `QuickPreferencesModal.tsx`

### Phase 3D — Date locale dynamique

`Training.tsx` et d'autres fichiers utilisent `date-fns/locale/fr` hardcodé — passer à `getDateLocale(i18n.language)`.

### Phase 3E — Mois dans Start.tsx

Remplacer les noms de mois hardcodés en français par `t("onboarding.months.january")` etc.

### Phase 4 — Edge functions bilingues (9 fonctions, 0 faites)

Aucune edge function ne reçoit encore de paramètre `language`. Il faut :

1. **Frontend** : Ajouter `language: i18n.language` dans le body de chaque `supabase.functions.invoke()` (~7 fichiers hooks/services)
2. **Edge functions** : Extraire `language` du body et ajouter l'instruction au prompt système

| Edge function | Statut |
|---|---|
| `chat-alex/index.ts` | À faire |
| `chat-julie/index.ts` | À faire |
| `generate-weekly-program/index.ts` | À faire |
| `generate-training-session/index.ts` | À faire |
| `generate-training-plan/index.ts` | À faire |
| `generate-nutrition-plan/index.ts` | À faire |
| `generate-meal/index.ts` | À faire |
| `format-health-data/index.ts` | À faire |
| `send-weekly-digest/index.ts` | À faire |

3. **`data/prompts.ts`** : Rendre `juliePromptWithoutAccessToData` multilingue

### Résumé chiffré

| Phase | Fichiers restants | Statut |
|---|---|---|
| Phase 1 — Infra i18n | 0 | ✅ Fait |
| Phase 2 — Landing | 0 | ✅ Fait |
| Phase 3B — Pages app | ~25 | ❌ À faire |
| Phase 3C — Composants | ~10 | ❌ À faire |
| Phase 3D/E — Dates + mois | ~3 | ❌ À faire |
| Phase 4 — Edge functions | ~9 + ~7 frontend | ❌ À faire |
| Phase 5 — Sync DB | 0 | ✅ Fait |

**Total restant** : ~54 fichiers à modifier. Je recommande de procéder en 3-4 messages successifs pour ne rien oublier.

