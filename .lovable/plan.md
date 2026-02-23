

# Ameliorer la saisie de date de naissance sur mobile

## Probleme actuel

Le champ utilise `<Input type="date" />` qui affiche un selecteur de date natif du navigateur. Sur mobile, ce selecteur oblige souvent a scroller mois par mois pour remonter 20-30 ans en arriere -- tres penible pour une date de naissance.

## Solution

Remplacer le `<Input type="date" />` par **3 selects separes** : Jour, Mois, Annee. C'est le pattern le plus ergonomique sur mobile pour les dates de naissance lointaines car :
- L'annee se choisit directement sans scroller mois par mois
- Les mois sont affiches en texte (Janvier, Fevrier...) pour plus de clarte
- Les jours s'adaptent dynamiquement au mois et a l'annee choisis

## Apercu du resultat

```text
Date de naissance *
[  Jour  ▼]  [  Mois  ▼]  [  Annee  ▼]
                                    25 ans
```

## Fichier a modifier

| Fichier | Modification |
|---|---|
| `src/pages/Start.tsx` | Remplacer le `<Input type="date">` par 3 composants `<Select>` (jour, mois, annee) |

## Detail technique

### Composants Select pour Jour / Mois / Annee

**Annee** : de l'annee actuelle moins 100 jusqu'a l'annee actuelle moins 15 (intervalle 15-100 ans), affichee en ordre decroissant (2011, 2010, 2009...).

**Mois** : liste fixe de 12 mois en francais (Janvier a Decembre), valeurs 01 a 12.

**Jours** : de 1 a 28/29/30/31 selon le mois et l'annee selectionnes. Se recalcule dynamiquement quand le mois ou l'annee change.

### Logique de construction de la date

Quand les 3 champs sont remplis, on reconstruit la date au format `YYYY-MM-DD` et on appelle `updateField("birthDate", ...)` comme avant. L'age est recalcule automatiquement via `calculateAgeFromBirthDate`.

### Gestion du formData existant

Si `formData.birthDate` est deja renseigne (ex: retour sur l'etape 1), on parse la date pour pre-remplir les 3 selects avec les bonnes valeurs (jour, mois, annee).

### Layout

Les 3 selects seront affiches en `grid grid-cols-3 gap-2` pour tenir sur une ligne, meme sur mobile. Chaque select utilise le composant Shadcn `<Select>` deja present dans le projet.

Aucune migration DB, aucune edge function -- un seul fichier modifie.

