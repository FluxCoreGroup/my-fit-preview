

## Header Hub : ajouter profondeur et modernite

### Ameliorations visuelles proposees

#### 1. Effet de profondeur avec couches superposees

- Ajouter un **element decoratif en arriere-plan** : un cercle flou (`blur-3xl`) semi-transparent positionne en `absolute` dans le coin superieur droit du header, pour creer un effet de lumiere diffuse
- Ajouter un **second cercle** plus petit, decale en bas a gauche, avec une teinte indigo plus foncee
- Ces elements donnent une impression de profondeur 3D sans alourdir le rendu

#### 2. Glassmorphism subtil sur la barre de progression

- Entourer la section progression dans un conteneur avec `bg-white/10 backdrop-blur-sm rounded-xl p-3` pour creer un "pill" vitree qui detache visuellement la progression du fond
- Cela ajoute une couche de profondeur et un aspect premium

#### 3. Ombre interne et bordure basse

- Ajouter un `shadow-lg` sur le header pour projeter une ombre sur le contenu en dessous
- Ajouter un fin trait lumineux en bas du header via un `div` avec `h-px bg-gradient-to-r from-transparent via-white/20 to-transparent`

#### 4. Typographie plus contrastee

- Passer le nom en `text-2xl` (au lieu de `text-xl`) pour plus d'impact
- Augmenter l'opacite de la salutation : `text-white/80` au lieu de `text-white/60`

---

### Section technique

**Fichier modifie** : `src/pages/Hub.tsx` (bloc header, lignes 167-188)

Le header sera restructure avec `relative overflow-hidden` pour contenir les elements decoratifs positionnes en `absolute`. Deux cercles flous seront ajoutes :

```text
<!-- Cercle decoratif haut-droit -->
<div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

<!-- Cercle decoratif bas-gauche -->
<div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-400/15 rounded-full blur-2xl" />
```

La barre de progression sera enveloppee dans un conteneur glasse :

```text
<div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
  <!-- labels + Progress bar -->
</div>
```

Un trait lumineux sera ajoute en bas du header :

```text
<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
```

Le conteneur header passera a `relative overflow-hidden shadow-lg`.

