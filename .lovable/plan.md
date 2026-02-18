
## Audit complet : fin de semaine d'entraînement

### Flux actuel (diagramme en haut)

Le flux se déroule en 2 temps :

**Temps 1 — Pendant la séance (`/session`)**
1. L'utilisateur valide son dernier set → `sessions.completed = true`
2. Un trigger DB (`update_weekly_program_progress`) met à jour `weekly_programs.completed_sessions++`
3. `SessionFeedbackModal` s'ouvre (RPE, douleur post-séance)
4. Feedback enregistré dans la table `feedback`, puis redirect vers `/training`

**Temps 2 — Sur `/training` après la dernière séance**
5. `useWeeklyTraining` détecte `isWeekComplete = true` + `needsFeedback = true`
6. `WeeklyFeedbackModal` s'ouvre automatiquement (check-in hebdomadaire)
7. L'utilisateur remplit le formulaire (poids, RPE, énergie...)
8. Données sauvegardées dans `weekly_checkins`
9. `weekly_programs.check_in_completed = true`
10. Edge function `generate-weekly-program` invoquée pour la semaine suivante
11. Les séances de la semaine suivante sont créées en DB

---

### Bugs identifiés (3 bugs critiques + 1 mineur)

#### Bug 1 — CRITIQUE : `canGenerateWeek()` bloque Bryan indéfiniment

**Problème confirmé en base :** Bryan a un `weekly_program` pour la semaine du 8-15 fév avec `check_in_completed = false`. Son seul check-in (W08) a été créé le **17 février**, donc APRÈS la fin de la semaine. La logique `canGenerateWeek()` cherche un check-in entre le lundi et dimanche de la semaine passée via `created_at`, mais Bryan n'en a aucun dans cet intervalle → il est **bloqué** et ne peut pas générer la semaine actuelle.

**Cause code :** La requête dans `useWeeklyTraining.tsx` utilise `created_at` pour filtrer par semaine, mais le check-in du 17 fév tombe hors de la plage `lundi 9 → dimanche 15`.

**Fix :** Utiliser `week_iso` au lieu de `created_at` pour chercher le check-in de la semaine passée, ET ajouter une exception : si `weekly_programs.check_in_completed = true` pour la semaine passée, autoriser la génération sans chercher dans `weekly_checkins`.

#### Bug 2 — CRITIQUE : Programmes `weekly_programs` dupliqués

**Problème confirmé en base :** 3 utilisateurs ont plusieurs `weekly_programs` pour la même `week_start_date` (ex: 4 entrées identiques pour un utilisateur). La table n'a **pas de contrainte d'unicité** sur `(user_id, week_start_date)`.

**Impact :** `needsFeedback` peut se comporter de façon imprévisible car `currentProgram` prend le premier résultat, et le modal peut se rouvrir en boucle.

**Fix :** Ajouter une contrainte unique `UNIQUE(user_id, week_start_date)` en migration DB + ajouter `ON CONFLICT DO NOTHING` dans l'edge function.

#### Bug 3 — CRITIQUE : `WeeklyFeedbackModal` génère pour la semaine suivante avec une date incorrecte

**Problème code :** Dans `WeeklyFeedbackModal.tsx` ligne 219, `generateNextWeek()` calcule `nextWeekStart = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 })`. Si on est déjà **lundi de la semaine suivante** quand l'utilisateur fait son check-in, `addWeeks(new Date(), 1)` génère pour dans 2 semaines au lieu de la semaine courante.

**Fix :** Calculer le `nextWeekStart` en se basant sur le `week_start_date` du programme actuel + 7 jours, pas depuis `new Date()`.

#### Bug 4 — MINEUR : Trigger DB ne couvre pas tous les cas

Le trigger `update_weekly_program_progress` se déclenche uniquement si `NEW.completed = true AND OLD.completed = false`. Si une session est `completed = null` (cas de sessions anciennes en DB), le trigger ne se déclenche pas et `completed_sessions` reste à 0.

---

### Plan de correction

**Fichiers à modifier :**
1. `src/hooks/useWeeklyTraining.tsx` — Fix `canGenerateWeek()` : utiliser `week_iso` + fallback sur `check_in_completed`
2. `src/components/training/WeeklyFeedbackModal.tsx` — Fix date de génération semaine suivante
3. `supabase/migrations/` — Nouvelle migration : contrainte unique + nettoyage des doublons existants + fix trigger NULL

**Migration SQL :**
```sql
-- 1. Nettoyer les doublons (garder le plus récent par user + week)
DELETE FROM weekly_programs
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, week_start_date) id
  FROM weekly_programs
  ORDER BY user_id, week_start_date, created_at DESC
);

-- 2. Ajouter contrainte unique
ALTER TABLE weekly_programs 
ADD CONSTRAINT unique_user_week UNIQUE (user_id, week_start_date);

-- 3. Fix trigger pour gérer completed = NULL
-- (modifier la condition OLD.completed IS DISTINCT FROM true)
```

**Fix `canGenerateWeek()` :**
```typescript
// Chercher via week_iso au lieu de created_at
const lastWeekISO = format(addWeeks(new Date(), -1), "yyyy-'W'II");
const { data } = await supabase
  .from("weekly_checkins")
  .select("id")
  .eq("user_id", user.id)
  .eq("week_iso", lastWeekISO)
  .maybeSingle();

// Ou vérifier check_in_completed directement
const { data: lastProgram } = await supabase
  .from("weekly_programs")
  .select("check_in_completed")
  .eq("user_id", user.id)
  .lt("week_end_date", new Date().toISOString())
  .order("week_start_date", { ascending: false })
  .limit(1)
  .maybeSingle();

if (lastProgram && !lastProgram.check_in_completed) {
  return { allowed: false, reason: "..." };
}
return { allowed: true };
```

**Fix date génération dans `WeeklyFeedbackModal` :**
```typescript
// Avant (bugué si check-in fait le lundi suivant)
const nextWeekStart = startOfWeek(addWeeks(new Date(), 1), { weekStartsOn: 1 });

// Après (fiable, basé sur le programme actuel)
const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const nextWeekStart = addWeeks(currentWeekStart, 1);
```
