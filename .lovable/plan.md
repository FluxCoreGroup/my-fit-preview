

## Problemes identifies

### 1. Sélecteur de langue pas mobile-friendly (marketing header)
Le header marketing a "Pulse.ai" en position absolute au centre (`absolute left-1/2 -translate-x-1/2`) et le `LanguageSelector` a droite. Sur mobile, le drapeau emoji se retrouve visuellement confondu avec le titre car l'espace est trop restreint. Le bouton de langue n'a pas assez de separation visuelle.

### 2. Pas de sauvegarde en base de donnees
La fonction `changeLanguage` dans Header.tsx fait uniquement `i18n.changeLanguage(lng)` - elle ne persiste PAS la preference dans la table `app_preferences`. Seul le composant `AppPreferencesSection` (page Settings) fait un upsert en base. Donc si un utilisateur change la langue via le header, au prochain login la preference DB ecrase le choix.

---

## Plan d'implementation

### Tache 1 : Rendre le sélecteur mobile-friendly

- **Marketing header** : Deplacer le `LanguageSelector` a gauche du bouton login/dashboard, avec un `size="icon"` sur mobile (uniquement le drapeau, pas de texte). Ajouter un `gap-1` entre les elements pour eviter le chevauchement avec "Pulse.ai".
- **App header (mobile menu)** : Remplacer le dropdown par 3 boutons drapeaux inline (pas besoin d'ouvrir un sous-menu dans un menu). Plus intuitif et plus rapide en touch.
- **Onboarding header** : Ajouter le `LanguageSelector` (actuellement absent) a droite du bouton suivant, en mode compact (icon only).

### Tache 2 : Synchroniser la preference en base

- Modifier `changeLanguage` dans `Header.tsx` pour qu'il fasse un upsert dans `app_preferences` si l'utilisateur est connecte (`user` existe).
- Importer `supabase` et utiliser le meme pattern que `AppPreferencesSection.handlePreferenceChange`.
- Si l'utilisateur n'est pas connecte (landing page), sauvegarder uniquement en localStorage via i18next (comportement actuel).

### Details techniques

```text
Header.tsx changeLanguage():
  1. i18n.changeLanguage(lng)           ← existant
  2. if (user) {                         ← nouveau
       supabase.from("app_preferences")
         .upsert({ user_id, language: lng })
     }
```

Pour le mobile menu (app variant), remplacer le `<LanguageSelector>` dropdown par des boutons flags inline :
```text
┌──────────────────────┐
│ 🇫🇷  🇬🇧  🇳🇱           │  ← 3 boutons touch-friendly
│ ⚙️ Parametres         │
│ 🚪 Deconnexion        │
└──────────────────────┘
```

