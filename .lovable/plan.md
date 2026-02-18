
## Audit UX End-to-End — 4 moments clés + Robustesse

### Diagnostic de l'état actuel (ce qui existe vs ce qui manque)

#### Ce qui existe
- Génération du premier programme via `/training-setup` (6 étapes) + edge function `generate-weekly-program`
- Session page avec tracking RPE optionnel, timer de repos, `SessionFeedbackModal` post-séance
- `WeeklyFeedbackModal` avec formulaire check-in (poids, RPE, énergie, douleur, adhérence)
- `adjustmentRules.ts` avec logique de recommandation basée sur le check-in
- `canGenerateWeek()` avec garde sur `check_in_completed`

#### Ce qui est cassé ou manquant (données réelles en DB)

**Constat DB critique** : 20 utilisateurs ont `check_in_completed = false` sur des semaines passées et terminées, dont certains depuis décembre 2025. Cela signifie que la logique actuelle `canGenerateWeek()` bloque **tous ces utilisateurs** — ils voient une page vide sans programme et sans moyen de débloquer.

Les problèmes identifiés dans les 4 moments clés :

---

### Moment 1 — Génération du premier programme

**État actuel** : Fonctionne correctement (TrainingSetup 6 étapes → generate-weekly-program).

**Manques UX identifiés** :
- La `SessionPreviewCard` ne montre pas la date de la séance (lundi ? mercredi ?)
- Pas de "diff" visible entre les sessions générées et les préférences utilisateur
- Aucune action "modifier/reporter" sur une SessionPreviewCard
- Les `coachNotes` sont affichées dans le drawer mais pas sur la card principale

**Corrections à apporter** :
1. Afficher la date de chaque séance sur `SessionPreviewCard`
2. Afficher `coachNotes` en aperçu sur la card (1 phrase)
3. Ajouter un bouton "Reporter" sur une session non complétée (qui déplace `session_date` de +1 ou +2 jours)

---

### Moment 2 — Review post-séance (SessionFeedbackModal)

**État actuel** : Collecte RPE + difficulté + satisfaction + commentaire → sauvegarde dans `feedback`. Redirige vers `/training`.

**Manques critiques** :
- Le feedback de séance (RPE, douleur via `SessionExitModal`) n'est **pas transmis** au générateur de la semaine suivante. Les données `feedback` et `exercise_logs` ne sont pas lues par `generate-weekly-program`.
- La satisfaction (étoiles) est stockée nulle part — elle est affichée mais jamais sauvegardée dans le `feedback.insert()` (le champ n'existe pas dans la table).
- Pas de détection des "séances partielles" : une séance quittée en cours (`onEndEarly`) est marquée `completed = true` côté DB, indiscernable d'une séance complète.
- Aucun ajustement immédiat proposé suite au feedback (ex: "RPE 9 détecté → prochaine séance allégée de 10%").

**Corrections à apporter** :
1. Dans `generate-weekly-program`, lire les derniers `feedback` et `exercise_logs` pour ajuster l'intensité de la semaine générée (RPE moyen < 6 → augmenter, RPE > 8 → réduire)
2. Dans `Session.tsx`, passer le flag `partially_completed` au `feedback.insert()` quand la session se termine via `onEndEarly`
3. Retirer le champ "satisfaction étoiles" du modal ou ajouter la colonne en DB

---

### Moment 3 — Review hebdomadaire (WeeklyFeedbackModal)

**État actuel** : Formulaire complet, mais déclenché UNIQUEMENT si `isWeekComplete = true` (toutes séances complétées). Le check-in n'est jamais déclenché si des séances sont manquées.

**Problème systémique confirmé** : Sur 20 utilisateurs avec des semaines passées terminées, AUCUN n'a `check_in_completed = true`. Le check-in hebdomadaire ne se déclenche que si l'utilisateur a fait 100% de ses séances + que le programme correspond à la semaine courante. Toutes les autres situations (semaine incomplète, semaine passée) bloquent l'utilisateur définitivement.

**Corrections à apporter** :
1. Déclencher le `WeeklyFeedbackModal` aussi quand la semaine est **passée** (même si incomplète)
2. Ajouter une bannière "Faire mon check-in" permanente sur `/training` dès qu'il existe un programme passé sans check-in
3. Si l'utilisateur a fait 0 séances et ne répond pas → check-in automatique silencieux après 7 jours (données neutres : RPE=5, énergie=normal, pas de douleur) + autoriser la génération

---

### Moment 4 — Génération du nouveau programme avec historique

**État actuel** : `generate-weekly-program` ne lit pas l'historique (`feedback`, `exercise_logs`, `weekly_checkins` du check-in précédent). Il génère un programme identique chaque semaine sans adaptation.

**Manques critiques** :
- Le prompt de l'IA n'inclut pas le check-in de la semaine précédente (RPE, douleur, énergie)
- Pas de traçabilité "ce qui a changé vs la semaine précédente"
- Pas de possibilité de modifier des paramètres avant génération ("moins de jambes", "2 séances cette semaine")
- `adjustmentRules.ts` calcule des recommandations mais elles ne sont **pas injectées** dans le prompt de génération

**Corrections à apporter** :
1. Dans `generate-weekly-program`, récupérer le dernier `weekly_checkins` et l'injecter dans le prompt
2. Ajouter une section "Quick Preferences" avant la génération (modal léger : fréquence, focus du corps, intensité) — `QuickPreferencesModal.tsx` existe déjà !
3. Injecter les résultats de `calculateRecommendation()` dans le prompt IA

---

### Robustesse — Cas limites non gérés

**Utilisateur inactif > 1 semaine (confirmé en DB : 12+ utilisateurs)**
- Etat actuel : bloqué par `canGenerateWeek()` car `check_in_completed = false`
- Correction : Si la dernière semaine a plus de 14 jours sans check-in, autoriser la génération avec un flag `skip_checkin_reason = "inactivity"`

**Séances manquées / partiellement complétées**
- Etat actuel : indiscernables, toutes marquées `completed = true`
- Correction : Ajouter un champ `partially_completed boolean` et `exit_reason text` dans `sessions` (migration), les utiliser dans le prompt IA

**Changement de disponibilité**
- Etat actuel : modifier dans Settings > TrainingProgram, mais le programme actuel n'est pas régénéré
- Correction : Proposer la régénération immédiate après sauvegarde des préférences

**Douleur signalée**
- Etat actuel : `has_pain = true` dans le check-in déclenche `-1 set` via `adjustmentRules`, mais ce calcul n'est pas transmis à l'IA
- Correction : Injecter la recommandation dans le prompt

**Reprise après pause**
- Etat actuel : aucun mode "reprise", l'IA génère le même niveau qu'avant
- Correction : Si gap > 14 jours détecté, injecter dans le prompt : "L'utilisateur reprend après une pause de X semaines → déload -20% du volume"

**Aucune donnée de review (fallback stable)**
- Etat actuel : `canGenerateWeek()` bloque → dead end
- Correction : Après 7 jours sans check-in sur une semaine passée, `check_in_completed` passe automatiquement à `true` avec un check-in silencieux (via migration SQL + cron ou trigger)

---

### Plan d'implémentation (priorité décroissante)

#### Priorité 1 — Débloquer les utilisateurs bloqués (données + code)

**Migration SQL** :
```sql
-- Auto-compléter les check-ins manquants sur les semaines terminées il y a > 7 jours
UPDATE weekly_programs
SET check_in_completed = true
WHERE check_in_completed = false
  AND week_end_date < NOW() - INTERVAL '7 days';
```

**`useWeeklyTraining.tsx`** — Modifier `canGenerateWeek()` :
- Si la dernière semaine terminée a > 14 jours sans check-in → allowed = true (inactivité)
- Sinon la logique actuelle reste

**`Training.tsx`** — Déclencher `WeeklyFeedbackModal` aussi quand `!isWeekComplete && week_end_date < now()` (semaine passée incomplète)

#### Priorité 2 — Review post-séance enrichie

**`Session.tsx`** : Passer `partially_completed: boolean` à `feedback.insert()` (si sortie via `onEndEarly`)

**`SessionFeedbackModal.tsx`** : Retirer les étoiles ou ajouter la colonne en DB (`satisfaction integer`)

**Migration** : Ajouter `partially_completed boolean default false` dans `sessions` et `satisfaction integer` dans `feedback`

#### Priorité 3 — Génération contextualisée

**`generate-weekly-program/index.ts`** :
1. Lire le dernier `weekly_checkins` et l'injecter dans le prompt
2. Appeler `calculateRecommendation()` côté edge function et inclure la recommandation dans le prompt IA
3. Si gap depuis dernière séance > 14 jours → injecter "mode reprise" dans le prompt

**`Training.tsx`** : Afficher un `QuickPreferencesModal` avant la génération (`QuickPreferencesModal.tsx` existe déjà)

#### Priorité 4 — UX des cards séances

**`SessionPreviewCard.tsx`** :
- Afficher la date de la séance (`format(session.session_date, "EEEE dd MMM", { locale: fr })`)
- Afficher les `coachNotes` en 1 ligne tronquée
- Ajouter un bouton "Reporter de 1 jour" (update `session_date`)

#### Priorité 5 — Traçabilité du programme

**`WeeklyFeedbackModal.tsx`** — Étape "success" : afficher un résumé des ajustements appliqués ("Volume réduit car RPE élevé", "Reprise progressive car inactivité de 2 semaines")

---

### Fichiers modifiés (résumé technique)

| Fichier | Changement |
|---|---|
| Migration SQL | Auto-unlock semaines bloquées, colonnes `partially_completed` + `satisfaction` |
| `useWeeklyTraining.tsx` | `canGenerateWeek()` + déclencheur hebdo sur semaines passées |
| `Training.tsx` | Bannière check-in permanente, déclenchement WeeklyFeedbackModal étendu |
| `WeeklyFeedbackModal.tsx` | Résumé des ajustements en step "success", gestion check-in existant |
| `Session.tsx` | Flag `partially_completed` sur sortie anticipée |
| `SessionFeedbackModal.tsx` | Retrait étoiles ou ajout colonne satisfaction |
| `generate-weekly-program/index.ts` | Injection historique (check-in, gap, recommandation) dans le prompt |
| `SessionPreviewCard.tsx` | Affichage date, coachNotes, bouton reporter |
