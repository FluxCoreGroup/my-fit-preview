# Feature Enhancement: Share Functionality — Plan d'implémentation

## Contexte & état actuel

### Post-session (training)

- `SessionFeedbackModal.tsx` : après `handleSubmit()`, le modal se ferme et navigue vers `/training` immédiatement. Aucune étape de partage.
- Il n'existe aucun composant "share post-workout" dans la codebase.

### Nutrition

- `ShareNutritionButton.tsx` : composant existant mais minimaliste — pas d'URL dans le texte partagé, pas de libellé d'objectif (perte de poids / prise de masse), pas de visuels.
- Le bouton est déjà intégré dans `Nutrition.tsx` (ligne 296).

---

## Ce qui va être créé / modifié


| Fichier                                             | Type   | Description                                                                             |
| --------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| `src/components/training/PostWorkoutShareModal.tsx` | CREATE | Modal de partage post-séance, déclenché après le feedback                               |
| `src/components/nutrition/ShareNutritionButton.tsx` | EDIT   | Amélioration du contenu partagé (URL + objectif + macros enrichis)                      |
| `src/components/training/SessionFeedbackModal.tsx`  | EDIT   | Après submit réussi : afficher le PostWorkoutShareModal au lieu de naviguer directement |


---

## Étape 1 — `PostWorkoutShareModal.tsx` (nouveau composant)

Ce composant s'ouvre **après** que le feedback est enregistré avec succès, dans `SessionFeedbackModal`.

**Fonctionnement en 2 étapes dans `SessionFeedbackModal.tsx` :**

```
1. User remplit RPE + difficulté → clique "Enregistrer"
2. handleSubmit() sauvegarde en DB → succès → setShowShareModal(true)
3. PostWorkoutShareModal s'ouvre (SessionFeedbackModal reste ouvert mais en arrière-plan, ou se ferme)
4. User choisit : Partager / Passer → navigation vers /training
```

**Contenu du texte partagé (construction dynamique) :**

```
🏋️ Séance validée.

{seriesCompleted} séries réalisées.

Une de plus vers l’objectif.
Qui s’entraîne aujourd’hui ?

👉 https://www.pulse-ai.app
```

**Props reçues du parent :**

```typescript
interface PostWorkoutShareModalProps {
  open: boolean;
  onClose: () => void;             // navigate("/training")
  rpe: number;
  difficultyLabel: string;         // "Facile" | "Modéré" | "Dur" | "Très dur"
  setsCompleted: number;
  sessionName?: string;
}
```

**UI du modal :**

- Header avec fond dégradé et confettis (Sparkles icon)
- Preview du texte à partager dans un encadré stylé (readonly)
- 2 boutons :
  - **"Partager ma séance"** (bouton principal) : appelle `navigator.share()` si disponible (mobile), sinon copie dans le clipboard + toast "Copié !"
  - **"Continuer sans partager"** (ghost) : `onClose()` directement
- Le lien `https://www.pulse-ai.app` est inclus dans le texte partagé (champ `url` de `navigator.share()`)

---

## Étape 2 — Modifier `SessionFeedbackModal.tsx`

**Ajout d'un état local :**

```typescript
const [showShareModal, setShowShareModal] = useState(false);
const [savedDifficulty, setSavedDifficulty] = useState<string>("");
```

**Modification de `handleSubmit()` :**
Après le `toast` succès, au lieu de `navigate("/training")` :

```typescript
// Au lieu de : onClose(); navigate("/training");
// Faire :
setSavedDifficulty(difficultyOptions.find(d => d.value === difficulty)?.label || "");
setShowShareModal(true);
// SessionFeedbackModal reste visible mais en fond (le share modal se superpose)
```

**Ajout dans le JSX :**

```typescript
<PostWorkoutShareModal
  open={showShareModal}
  onClose={() => { setShowShareModal(false); onClose(); navigate("/training"); }}
  rpe={rpe[0]}
  difficultyLabel={savedDifficulty}
  setsCompleted={exerciseLogs.length}
/>
```

**Flux complet :**

```
Session.tsx → setShowFeedbackModal(true)
  └─ SessionFeedbackModal : RPE + difficulté + commentaires → submit
       └─ Sauvegarde DB (feedback + exercise_logs)
            └─ Succès → PostWorkoutShareModal s'ouvre
                 ├─ "Partager" → navigator.share() ou clipboard → navigate("/training")
                 └─ "Passer" → navigate("/training")
```

---

## Étape 3 — Améliorer `ShareNutritionButton.tsx`

**Contenu partagé enrichi :**

```
🥗 Mon plan nutritionnel sur Pulse.ai

🎯 Objectif : {goalTypeLabel}   ← nouveau (ex: "Prise de masse", "Perte de poids")
📊 Calories : {targetCalories} kcal/jour
💪 Protéines : {protein}g | 🍚 Glucides : {carbs}g | 🥑 Lipides : {fats}g

🤖 Plan généré par mon coach IA Pulse.ai
👉 https://www.pulse-ai.app
```

**Nouvelles props :**

```typescript
type ShareNutritionButtonProps = {
  targetCalories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  goalType?: string | string[];   // ← NOUVEAU
};
```

**Mapping `goalType` → libellé lisible :**

```typescript
const goalLabel = Array.isArray(goalType) && goalType.includes("weight-loss")
  ? "Perte de poids 🔥"
  : goalType?.includes?.("muscle-gain") ? "Prise de masse 💪"
  : "Maintien & santé ⚖️";
```

**Dans `Nutrition.tsx` :** passer `goalType={goals?.goal_type}` au `ShareNutritionButton`.

**URL** : `navigator.share({ title, text, url: "https://www.pulse-ai.app" })` — l'URL est séparée du texte pour que certaines apps (Twitter, WhatsApp) la traitent correctement.

**Amélioration UX du bouton :** ajouter un effet de clic (variant `hero` ou classe animée) et un feedback visuel de "Copié !" si clipboard.

---

## Résumé des fichiers


| Fichier                                             | Changement                                         |
| --------------------------------------------------- | -------------------------------------------------- |
| `src/components/training/PostWorkoutShareModal.tsx` | Création complète                                  |
| `src/components/training/SessionFeedbackModal.tsx`  | Ajout `showShareModal` state + rendu conditionnel  |
| `src/components/nutrition/ShareNutritionButton.tsx` | Enrichissement contenu + URL + goalType            |
| `src/pages/Nutrition.tsx`                           | Passer `goalType` en prop à `ShareNutritionButton` |


Aucune migration de base de données, aucune edge function nécessaire — tout est 100% frontend.