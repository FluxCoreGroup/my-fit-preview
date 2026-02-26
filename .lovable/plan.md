

## Bug identifie

Les 3 fichiers `settings.json` (FR, EN, NL) ne contiennent que les sections `menu` et `preferences`. Il manque **8 sections completes** utilisees par les composants settings :

| Section manquante | Composant qui l'utilise |
|---|---|
| `profile` | `ProfileSection.tsx` (30+ cles) |
| `physicalInfo` | `PhysicalInfoSection.tsx` (20+ cles) |
| `trainingProgram` | `TrainingProgramSection.tsx` (25+ cles) |
| `nutritionSection` | `NutritionSection.tsx` (12+ cles) |
| `subscription` | `SubscriptionSection.tsx` (20+ cles) |
| `healthConditions` | `HealthConditionsSection.tsx` (10+ cles) |
| `cardioMobility` | `CardioMobilitySection.tsx` (15+ cles) |
| `cancellation` | `CancellationFeedbackDialog.tsx` (12+ cles) |

Tous les `t("trainingProgram.title")`, `t("profile.email")`, etc. retournent la cle brute car ces objets n'existent pas dans les JSON.

## Plan

### Tache unique : Ajouter les 8 sections manquantes aux 3 fichiers settings.json

Pour chaque langue (FR, EN, NL), ajouter toutes les cles utilisees dans les composants :

- **`profile`** : title, subtitle, email, emailReadonly, firstName, namePlaceholder, save, password, resetPassword, resetPasswordDesc, nameEmpty, nameUpdated, nameUpdateError, resetEmailSent, resetEmailError, sessionExpired, accountDeleted, deleteError, deleteAccount, confirmDeleteTitle, activeSubscription, endDate, plan, subscriptionCancelled, allDataDeleted, confirmCheckbox, irreversible, cancel, deleteForever
- **`physicalInfo`** : title, subtitle, readonlyInfo, birthDate, notProvided, years, sex, male, female, notSpecified, initialWeight, weeklyCheckins, editableInfo, height, targetWeightLoss, activityLevel, selectPlaceholder, sedentary, light, moderate, active, veryActive, saveChanges, updated, updateError
- **`trainingProgram`** : title, subtitle, goals, muscleGain, weightLoss, strength, endurance, generalFitness, frequency, sessionDuration, location, selectPlaceholder, home, gym, outdoor, experienceLevel, beginner, intermediate, advanced, sessionType, fullBody, split, pushPullLegs, favoriteExercises, favoriteExercisesPlaceholder, exercisesToAvoid, exercisesToAvoidPlaceholder, saveChanges, updated, updateError
- **`nutritionSection`** : title, subtitle, mealsPerDay, hasBreakfast, hasBreakfastDesc, restrictions, restrictionsPlaceholder, restrictionsHelper, allergies, allergiesPlaceholder, allergiesHelper, saveChanges, updated, updateError
- **`subscription`** : title, subtitle, freeTrial, duringTrial, trialEnd, afterTrial, manageSubscription, redirecting, addPayment, active, nextRenewal, managePayment, noSubscription, subscribeDesc, subscribeNow, loadingError, portalError, cannotVerify, retry
- **`healthConditions`** : title, subtitle, important, disclaimer, label, placeholder, helper, saveChanges, updated, updateError
- **`cardioMobility`** : title, subtitle, addCardio, addCardioDesc, cardioFrequency, cardioIntensity, selectPlaceholder, low, moderateCardio, high, mobilityPref, none, lightMobility, moderateMobility, extensive, mobilityDesc, saveChanges, updated, updateError
- **`cancellation`** : cancelTitle, deleteTitle, feedbackDesc, reasons (tooExpensive, notUsedEnough, notFound, technicalIssue, badUx, other), selectReason, sessionExpired, thankYou, feedbackError, additionalComments, cancel, cancelSubscription, deleteMyAccount

