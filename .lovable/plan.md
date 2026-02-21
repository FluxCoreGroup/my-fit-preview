

# Correction : affichage des etapes meme sans detection iOS/Android

## Pourquoi les etapes n'apparaissent pas

Le tutoriel est conditionne par `isIOS` et `isAndroid`. Dans la preview desktop (et sur certains appareils non detectes), aucune des deux conditions n'est vraie, donc le drawer s'affiche vide -- juste le titre et les boutons.

Sur un vrai telephone mobile, les etapes apparaissent correctement. Mais il manque un **fallback** pour les cas ou l'OS n'est pas detecte.

## Solution

Ajouter un bloc fallback dans `InstallAppPrompt.tsx` qui affiche des instructions generiques quand ni iOS ni Android n'est detecte.

## Fichier a modifier

| Fichier | Modification |
|---|---|
| `src/components/InstallAppPrompt.tsx` | Ajouter un fallback apres les blocs iOS et Android |

## Detail technique

Apres le bloc `{isAndroid && !hasDeferredPrompt && (...)}`, ajouter :

```text
{!isIOS && !isAndroid && (
  <div> 3 etapes generiques :
    1. Copy — "Copie le lien de la webapp" + bouton Copier
    2. Globe — "Ouvre ton navigateur et colle le lien dans la barre d'adresse"
    3. Download — "Cherche l'option Ajouter a l'ecran d'accueil dans le menu"
  </div>
)}
```

Les etapes generiques couvrent tous les navigateurs sans mentionner Safari ni Chrome specifiquement. Le bouton "Copier le lien" reste present.

Aucune migration DB, aucune edge function -- un seul fichier modifie.

