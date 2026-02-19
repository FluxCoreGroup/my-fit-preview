
# Fix : "0 séries" + Ajout de la durée d'entraînement dans le partage

## Diagnostic des bugs

### Bug 1 — "0 séries réalisées"

`PostWorkoutShareModal` reçoit `setsCompleted={exerciseLogs.length}` depuis `SessionFeedbackModal`, qui reçoit lui-même `exerciseLogs` depuis `Session.tsx`.

`exerciseLogs` est rempli uniquement dans `handleSetComplete()` **si** `advancedTracking === true` ET `parseFloat(currentWeight) > 0`. La majorité des utilisateurs n'activent pas le tracking avancé → `exerciseLogs.length = 0` systématiquement.

**Solution** : calculer le nombre total de séries complétées indépendamment du tracking avancé. Dans `Session.tsx`, un compteur `completedSetsCount` incrémenté à chaque appel de `handleSetComplete()` suffit. Ce compteur est passé au `SessionFeedbackModal` (nouvelle prop), puis relayé au `PostWorkoutShareModal`.

### Bug 2 — Durée absente

Aucun chrono global n'existe dans `Session.tsx`. Il faut :
- Enregistrer `sessionStartTime` au montage (ou au premier exercice chargé)
- Calculer la durée au moment de l'ouverture du `SessionFeedbackModal`
- Passer cette durée au modal de partage

---

## Fichiers à modifier

| Fichier | Modification |
|---|---|
| `src/pages/Session.tsx` | Ajouter `sessionStartTime` (ref ou state) + `completedSetsCount` state, les passer à `SessionFeedbackModal` |
| `src/components/training/SessionFeedbackModal.tsx` | Accepter `totalSets` et `durationSeconds` en props, les relayer à `PostWorkoutShareModal` |
| `src/components/training/PostWorkoutShareModal.tsx` | Accepter `durationSeconds`, formater la durée, mettre à jour `shareText` |

---

## Détail des changements

### `Session.tsx`

**Ajouter un ref de démarrage de séance :**
```typescript
const sessionStartRef = useRef<Date | null>(null);
```

Au moment où les exercices sont chargés (dans `loadSession`, après `setExercises(...)`), initialiser :
```typescript
sessionStartRef.current = new Date();
```

**Ajouter un compteur de séries réelles :**
```typescript
const [completedSetsCount, setCompletedSetsCount] = useState(0);
```

Dans `handleSetComplete()`, incrémenter **inconditionnellement** (pas seulement si tracking activé) :
```typescript
setCompletedSetsCount(prev => prev + 1);
```

**Calculer la durée lors du déclenchement du feedback modal :**
```typescript
const durationSeconds = sessionStartRef.current
  ? Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000)
  : 0;
```

**Passer au modal :**
```typescript
<SessionFeedbackModal
  ...
  totalSets={completedSetsCount}
  durationSeconds={durationSeconds}
/>
```

Aussi réinitialiser `completedSetsCount` dans `handleRestartSession()`.

---

### `SessionFeedbackModal.tsx`

Nouvelles props :
```typescript
interface SessionFeedbackModalProps {
  ...
  totalSets?: number;        // ← nouveau
  durationSeconds?: number;  // ← nouveau
}
```

Relayer au `PostWorkoutShareModal` :
```typescript
<PostWorkoutShareModal
  ...
  setsCompleted={totalSets ?? exerciseLogs.length}
  durationSeconds={durationSeconds ?? 0}
/>
```

---

### `PostWorkoutShareModal.tsx`

Nouvelle prop `durationSeconds` :
```typescript
interface PostWorkoutShareModalProps {
  ...
  durationSeconds?: number;  // ← nouveau
}
```

Fonction de formatage :
```typescript
const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
};
```

**Texte de partage mis à jour :**
```
🏋️ Séance validée.

{setsCompleted} séries réalisées en {formatDuration(durationSeconds)}.

Une de plus vers l'objectif.
Qui s'entraîne aujourd'hui ?

👉 https://www.pulse-ai.app
```

Si `durationSeconds === 0` (cas de secours), la ligne durée est omise :
```
🏋️ Séance validée.

{setsCompleted} séries réalisées.

Une de plus vers l'objectif.
Qui s'entraîne aujourd'hui ?

👉 https://www.pulse-ai.app
```

---

## Résultat attendu

Après un vrai workout de 45 min avec 18 séries (tracking avancé OFF) :
```
🏋️ Séance validée.

18 séries réalisées en 45 min.

Une de plus vers l'objectif.
Qui s'entraîne aujourd'hui ?

👉 https://www.pulse-ai.app
```

Aucune migration base de données, aucune edge function — 100% frontend.
