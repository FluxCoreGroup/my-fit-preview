

# Popup d'installation PWA — Plan d'implementation

## Composant principal

Creation d'un composant `InstallAppPrompt.tsx` qui encapsule toute la logique de detection, affichage et persistence.

## Detection et conditions d'affichage

**Mode standalone :** Verifie `window.matchMedia('(display-mode: standalone)').matches` ou `navigator.standalone` (iOS). Si deja installe, le popup ne s'affiche jamais.

**Mobile uniquement :** Utilise le hook `useIsMobile()` existant. Aucun affichage sur desktop.

**Flag de refus :** Stocke `pwa_install_dismissed` dans localStorage avec un timestamp. Si l'utilisateur ferme le popup, il ne reapparait qu'apres 7 jours.

**Detection OS :**
- iOS : `navigator.userAgent` contient "iPhone" ou "iPad" et pas "CriOS" (Chrome iOS)
- Android : `navigator.userAgent` contient "Android"
- Le contenu du mini-tutoriel s'adapte dynamiquement

## Declenchement (2 points d'entree)

**1. Page `/start` (questionnaire)** : Le popup s'affiche au montage de `Start.tsx`, avec un delai de 2 secondes pour ne pas bloquer l'entree dans le formulaire.

**2. Fin de l'onboarding (guide tour)** : Dans `OnboardingContext.tsx`, quand `completeTour()` est appele, un flag `show_install_prompt` est mis dans localStorage. Le composant `Hub.tsx` le detecte et affiche le popup apres la completion du tour (une fois le `OnboardingComplete` modal ferme).

## UI du popup

- **Format** : Drawer/sheet depuis le bas de l'ecran (pas un dialog plein ecran). Utilise le composant `Drawer` existant (vaul).
- **Animation** : slide-up fluide (natif au Drawer)
- **Contenu dynamique selon l'OS :**

**iOS (Safari) :**
```
1. Appuie sur l'icone de partage (icone Share)
2. Fais defiler et choisis "Sur l'ecran d'accueil"
3. Confirme en appuyant sur "Ajouter"
```

**Android (Chrome / Samsung) :**
```
1. Appuie sur le menu (3 points) en haut a droite
2. Selectionne "Ajouter a l'ecran d'accueil"
3. Confirme en appuyant sur "Ajouter"
```

- **Boutons :**
  - Sur Android : "Installer" (declenche le `beforeinstallprompt` natif si disponible)
  - Sur iOS : "J'ai compris" (ferme le drawer, car iOS ne supporte pas `beforeinstallprompt`)
  - "Plus tard" (ghost, ferme + stocke le flag de delai 7j)

- **Texte d'accroche :**
  - Titre : "Installe Pulse sur ton telephone"
  - Sous-titre : "Acces rapide, experience fluide, meilleure immersion."

## Gestion du `beforeinstallprompt` (Android)

Un hook `useInstallPrompt` capture l'evenement `beforeinstallprompt` au niveau global (dans `App.tsx` ou directement dans le composant). Sur Android/Chrome, cliquer "Installer" appelle `deferredPrompt.prompt()` pour declencher le vrai dialog d'installation natif.

## Fichiers a creer / modifier

| Fichier | Type | Description |
|---|---|---|
| `src/components/InstallAppPrompt.tsx` | CREATE | Composant principal (drawer + detection OS + tutoriel + persistence) |
| `src/hooks/useInstallPrompt.tsx` | CREATE | Hook pour capturer `beforeinstallprompt` + detecter standalone/OS |
| `src/pages/Start.tsx` | EDIT | Importer et rendre `<InstallAppPrompt trigger="start" />` |
| `src/pages/Hub.tsx` | EDIT | Rendre `<InstallAppPrompt trigger="onboarding-complete" />` apres la fin du tour |

## Details techniques

### `useInstallPrompt.tsx`

```typescript
// Retourne :
{
  isStandalone: boolean;       // deja installe ?
  isIOS: boolean;
  isAndroid: boolean;
  deferredPrompt: Event|null;  // beforeinstallprompt capture
  triggerInstall: () => void;   // appelle prompt() sur Android
  isDismissed: boolean;         // refuse depuis < 7j ?
  dismiss: () => void;          // stocke le flag
}
```

### `InstallAppPrompt.tsx`

Props :
```typescript
interface InstallAppPromptProps {
  trigger: "start" | "onboarding-complete";
}
```

- Si `trigger === "start"` : s'affiche apres 2s de delai (`setTimeout`)
- Si `trigger === "onboarding-complete"` : s'affiche quand le flag localStorage `show_install_prompt` est present (pose par `completeTour`), puis supprime le flag

Le composant ne se rend pas du tout si : desktop, standalone, ou dismissed recemment.

### Integration dans `Hub.tsx`

Apres la fermeture du `OnboardingComplete` modal, afficher le prompt d'installation. Le flag `hub_onboarding_just_completed` (deja existant dans `OnboardingContext`) sert de declencheur.

### Integration dans `Start.tsx`

Ajout simple en bas du JSX :
```typescript
<InstallAppPrompt trigger="start" />
```

## Performance

- Aucun impact sur le chargement : le composant est lazy (delai 2s sur `/start`, conditionnel sur Hub)
- Pas de librairie externe ajoutee : utilise `Drawer` (vaul) deja installe
- Detection OS par `navigator.userAgent` (synchrone, zero cout)

Aucune migration DB, aucune edge function — 100% frontend.

