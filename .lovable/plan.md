## Redesign du Hub -- Header + Grille de modules

### Constat actuel

Le Hub est visuellement fade : header degrade bleu clair tres pale, cards carrees uniformes avec bordures fines bleu clair, pas de hierarchie visuelle, pas de contenu dynamique dans le header.

---

### Ameliorations proposees

#### 1. Header repense

- **Fond gradient plus affirme** : passer de `from-blue-50 to-blue-100/50` a un vrai gradient sombre `from-blue-600 via-blue-500 to-indigo-500` avec texte blanc
- **Salutation contextuelle** selon l'heure : "Bonjour", "Bon apres-midi", "Bonsoir"
- **Barre de progression hebdomadaire** : afficher "X/Y seances cette semaine" avec une Progress bar fine integree dans le header
- **Sous-titre dynamique** : adapter le message selon l'avancement ("Plus que 2 seances !", "Semaine complete !", etc.)

#### 2. Cards modules plus visuelles

- **Fond degrade subtil par carte** : chaque carte a un leger gradient de fond base sur sa couleur d'icone (au lieu du blanc uniforme)
- **Icones plus grandes** dans un cercle colore plus marque
- **Effet hover ameliore** : translation Y + ombre portee plus prononcee
- **Distinction visuelle** entre modules principaux (Entrainements, Nutrition) et secondaires (Parametres, Aide) via une taille ou un style different

---

### Section technique

**Fichiers modifies** :


| Fichier                                   | Changement                                                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/Hub.tsx`                       | Header avec gradient sombre, texte blanc, salutation contextuelle, barre de progression, sous-titre dynamique                           |
| `src/components/dashboard/ModuleCard.tsx` | Fond degrade subtil par carte base sur `iconColor`, icone dans un cercle colore plus visible, hover avec translateY et shadow plus fort |


**Detail des changements dans Hub.tsx** :

- Ajouter une fonction `getGreeting()` qui retourne "Bonjour"/"Bon apres-midi"/"Bonsoir" selon `new Date().getHours()`
- Ajouter une fonction `getSubtitle()` qui utilise `sessionsData` pour generer un message contextuel
- Importer `Progress` depuis `@/components/ui/progress`
- Remplacer le bloc header (lignes ~119-127) par :
  - `bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500` avec `text-white`
  - Salutation en `text-sm text-white/70` + nom en `text-2xl font-bold`
  - Si `sessionsData?.total > 0` : afficher compteur + Progress bar avec `className="h-2 bg-white/20"` et indicateur en `[&>div]:bg-white`

**Detail des changements dans ModuleCard.tsx** :

- Remplacer le fond blanc uniforme `bg-white/80` par un gradient subtil : `bg-gradient-to-br from-white to-[hsl(${iconColor}/0.06)]`
- Augmenter le cercle d'icone : passer de `w-16 h-16` a `w-18 h-18` avec un fond colore plus opaque `bg-[hsl(${iconColor}/0.12)]`
- Ajouter `hover:-translate-y-1` pour un effet de levitation au hover
- Augmenter le shadow hover : `hover:shadow-xl` vers `hover:shadow-2xl`