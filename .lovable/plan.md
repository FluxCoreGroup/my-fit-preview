

# Fix du bouton "Ouvrir Safari" + ameliorations UX/UI

## Probleme

Le bouton "Ouvrir Safari" utilise `window.open(APP_URL, "_blank")` qui, dans un navigateur in-app (Instagram, Facebook, Messenger...), ouvre le lien dans ce meme navigateur in-app. Il est techniquement impossible de forcer l'ouverture de Safari ou Chrome depuis un webview tiers -- c'est une restriction au niveau de l'OS.

## Solution

Supprimer les boutons "Ouvrir Safari" / "Ouvrir Chrome" et simplifier le tutoriel en 3 etapes claires.

## Nouveau tutoriel

### iOS (3 etapes)

| Etape | Icone | Texte |
|---|---|---|
| 1 | Copy | "Copie le lien de la webapp" + **bouton "Copier le lien"** |
| 2 | Compass | "Ouvre **Safari** et colle le lien dans la barre d'adresse" |
| 3 | Share + Plus | "Appuie sur **Partager** puis **Sur l'ecran d'accueil** et **Ajouter**" |

### Android sans prompt natif (3 etapes)

| Etape | Icone | Texte |
|---|---|---|
| 1 | Copy | "Copie le lien de la webapp" + **bouton "Copier le lien"** |
| 2 | Chrome | "Ouvre **Chrome** et colle le lien dans la barre d'adresse" |
| 3 | MoreVertical | "Appuie sur **⋮** puis **Ajouter a l'ecran d'accueil** et confirme" |

### Android avec prompt natif

Inchange : bouton "Installer" qui declenche `beforeinstallprompt`.

## Ameliorations UX/UI

1. **Suppression du bouton "Ouvrir Safari/Chrome"** -- source de confusion, remplace par une instruction textuelle claire.
2. **Mise en gras des mots-cles** dans les instructions (Safari, Chrome, Partager, etc.) pour faciliter le scan visuel.
3. **Reduction a 3 etapes** au lieu de 4 -- plus simple, moins intimidant.
4. **Bouton "Copier le lien" plus visible** -- style `default` (rempli) au lieu de `outline` pour qu'il soit le seul call-to-action dans le tutoriel.

## Fichier a modifier

| Fichier | Modification |
|---|---|
| `src/components/InstallAppPrompt.tsx` | Supprimer `handleOpenBrowser`, supprimer `openBrowserButton`, reorganiser les etapes iOS et Android en 3 etapes, mettre en gras les mots-cles, changer le variant du bouton copier |

## Detail technique

### Suppressions

- Supprimer la fonction `handleOpenBrowser`
- Supprimer la variable `openBrowserButton`
- Supprimer les imports `Globe` et `Chrome` (Chrome n'est plus utilise comme icone de bouton, seulement comme icone d'etape)

### Etapes iOS refactorees

```text
Step 1: icon=Copy, text="Copie le lien de la webapp", action=bouton Copier
Step 2: icon=Compass, text="Ouvre **Safari** et colle le lien dans la barre d'adresse"
Step 3: icon=Share, text="Appuie sur **Partager** → **Sur l'écran d'accueil** → **Ajouter**"
```

### Etapes Android (sans prompt) refactorees

```text
Step 1: icon=Copy, text="Copie le lien de la webapp", action=bouton Copier
Step 2: icon=Chrome, text="Ouvre **Chrome** et colle le lien dans la barre d'adresse"
Step 3: icon=MoreVertical, text="**⋮** → **Ajouter à l'écran d'accueil** → Confirmer"
```

### Texte en gras

Utiliser des balises `<strong>` ou `<b>` dans le JSX pour mettre en evidence les mots-cles d'action (Safari, Chrome, Partager, etc.). Le composant `Step` sera modifie pour accepter `text` en tant que `ReactNode` au lieu de `string`.

Aucune migration DB, aucune edge function -- 100% frontend, un seul fichier modifie.
