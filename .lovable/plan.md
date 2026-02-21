

# Tutoriel PWA enrichi — Copier le lien + Ouvrir le navigateur

## Probleme actuel

Le tutoriel suppose que l'utilisateur est deja dans Safari (iOS) ou Chrome (Android). En realite, beaucoup d'utilisateurs ouvrent la webapp depuis un navigateur in-app (Instagram, Facebook, Messenger, etc.) qui ne supporte pas l'installation PWA.

Le tutoriel doit donc guider l'utilisateur a :
1. Copier le lien de la webapp
2. Ouvrir le bon navigateur (Safari sur iOS, Chrome sur Android)
3. Coller le lien
4. Suivre les etapes d'installation

## Nouveau flux du tutoriel

### iOS (4 etapes)

| Etape | Icone | Texte | Action/Bouton |
|---|---|---|---|
| 1 | Copy | Copie le lien de la webapp | Bouton "Copier le lien" qui copie `https://www.pulse-ai.app` dans le clipboard + toast |
| 2 | Compass (Safari) | Ouvre Safari | Bouton "Ouvrir Safari" — ouvre `https://www.pulse-ai.app` via `window.open()` |
| 3 | Share | Colle le lien dans la barre d'adresse, puis appuie sur Partager | Texte simple |
| 4 | Plus | "Sur l'ecran d'accueil" → "Ajouter" | Texte simple |

### Android (4 etapes)

| Etape | Icone | Texte | Action/Bouton |
|---|---|---|---|
| 1 | Copy | Copie le lien de la webapp | Bouton "Copier le lien" qui copie `https://www.pulse-ai.app` |
| 2 | Chrome | Ouvre Google Chrome | Bouton "Ouvrir Chrome" — ouvre `https://www.pulse-ai.app` via `window.open()` |
| 3 | Globe | Colle le lien dans la barre d'adresse et valide | Texte simple |
| 4 | MoreVertical | ⋮ → "Ajouter a l'ecran d'accueil" → Confirmer | Texte simple |

## Detection navigateur in-app

Ajouter dans `useInstallPrompt.tsx` :

```typescript
const isInAppBrowser = /FBAN|FBAV|Instagram|Messenger|Line|Twitter|Snapchat/i.test(ua);
```

Quand `isInAppBrowser === true`, les etapes 1 et 2 (copier + ouvrir navigateur) sont essentielles. Quand l'utilisateur est deja dans Safari/Chrome, les etapes sont quand meme affichees (pas de mal a copier le lien), mais le bouton d'etape 2 pourrait dire "Deja dans Safari ? Passe a l'etape 3".

## Fichiers a modifier

| Fichier | Modification |
|---|---|
| `src/hooks/useInstallPrompt.tsx` | Ajouter `isInAppBrowser` dans le retour |
| `src/components/InstallAppPrompt.tsx` | Refonte du tutoriel : 4 etapes avec boutons d'action (copier lien, ouvrir navigateur), detection in-app, URL configurable |

## Detail technique

### `useInstallPrompt.tsx`

Ajouter :
```typescript
const isInAppBrowser = /FBAN|FBAV|Instagram|Messenger|Line|Twitter|Snapchat/i.test(ua);
```
Et l'inclure dans le `return`.

### `InstallAppPrompt.tsx`

**URL de la webapp :**
```typescript
const APP_URL = "https://www.pulse-ai.app";
```

**Fonction copier le lien :**
```typescript
const handleCopyLink = async () => {
  await navigator.clipboard.writeText(APP_URL);
  toast.success("Lien copié !");
};
```

**Fonction ouvrir navigateur :**
```typescript
const handleOpenBrowser = () => {
  window.open(APP_URL, "_blank");
};
```

**Composant Step ameliore :**
Le composant `Step` accepte un `action` optionnel (un bouton) en plus du texte :

```typescript
function Step({ number, icon, text, action }) {
  return (
    <div className="...">
      <span>{number}</span>
      {icon}
      <div className="flex-1">
        <span>{text}</span>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
```

**iOS steps :**
```
Etape 1 : "Copie le lien de la webapp" + [Bouton: Copier le lien]
Etape 2 : "Ouvre Safari" + [Bouton: Ouvrir Safari]
Etape 3 : "Colle le lien, puis appuie sur Partager"
Etape 4 : "Sur l'ecran d'accueil → Ajouter"
```

**Android steps (si pas de beforeinstallprompt) :**
```
Etape 1 : "Copie le lien de la webapp" + [Bouton: Copier le lien]
Etape 2 : "Ouvre Google Chrome" + [Bouton: Ouvrir Chrome]
Etape 3 : "Colle le lien dans la barre d'adresse"
Etape 4 : "⋮ → Ajouter a l'ecran d'accueil → Confirmer"
```

**Android avec `beforeinstallprompt` :** Le bouton "Installer" natif reste inchange (pas besoin du tutoriel copier/coller).

**Boutons en bas du drawer :**
- "J'ai compris" (ferme le drawer) — pour iOS et Android sans prompt natif
- "Installer" — uniquement Android avec prompt natif
- "Plus tard" (ghost, 7j cooldown) — toujours present

Aucune migration DB, aucune edge function — 100% frontend.
