

## Plan : Moderniser le Header et la Landing Page

### Objectif
Creer un design plus moderne et fluide en :
1. Simplifiant le header (logo gauche, titre centre, connexion droite)
2. Supprimant la separation visuelle entre header et hero
3. Integrant le header dans le gradient du hero pour un effet "seamless"

---

### Changements prevus

#### 1. Header Marketing simplifie

**Fichier** : `src/components/Header.tsx`

Remplacer le header marketing actuel (lignes 223-360) par une version minimaliste :

```text
Structure actuelle :
+--------------------------------------------------+
| Logo    | Comment? Pourquoi? Coach Prix FAQ | Btn |
+--------------------------------------------------+

Nouvelle structure :
+--------------------------------------------------+
| Logo             Pulse.ai (titre centre)     Btn |
+--------------------------------------------------+
```

**Modifications techniques :**
- Supprimer la navigation (`<nav>`) avec les 5 liens anchor
- Supprimer le menu mobile Sheet pour la version marketing
- Ajouter un titre centre "Pulse.ai" ou slogan court
- Garder le bouton Connexion/Dashboard a droite
- Rendre le header transparent avec `bg-transparent` et supprimer `border-b`

---

#### 2. Header transparent integre au hero

**Fichier** : `src/components/Header.tsx`

Nouvelles classes CSS pour le header marketing :
```tsx
// Avant
<header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">

// Apres
<header className="fixed top-0 left-0 right-0 z-50">
  {/* Fond transparent, s'integre au gradient hero */}
```

---

#### 3. Hero section ajustee

**Fichier** : `src/pages/Landing.tsx`

Ajuster le hero pour qu'il commence en haut de page sans marge :

```tsx
// Avant (ligne 105)
<section className="relative overflow-hidden pt-20 md:pt-24 px-4 md:px-6 lg:px-8 pb-8">

// Apres - Hero plein ecran depuis le top
<section className="relative overflow-hidden px-4 md:px-6 lg:px-8 pt-0">
  <div className="gradient-hero rounded-b-[2.5rem] min-h-screen ...">
```

Le gradient hero s'etend maintenant jusqu'en haut de l'ecran, le header "flotte" par-dessus.

---

#### 4. Style du nouveau header marketing

**Structure finale :**

```tsx
// Header Marketing simplifie
<header className="fixed top-0 left-0 right-0 z-50">
  <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
    {/* Logo gauche */}
    <Link to="/" className="flex items-center gap-2">
      <Dumbbell className="w-7 h-7 text-primary-foreground" />
    </Link>
    
    {/* Titre centre - nouveau */}
    <div className="absolute left-1/2 -translate-x-1/2">
      <span className="text-xl font-bold text-primary-foreground">
        Pulse.ai
      </span>
    </div>
    
    {/* Bouton connexion droite */}
    <div className="flex items-center">
      {user ? (
        <Link to="/hub">
          <Button variant="outline" size="sm" 
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            Dashboard
          </Button>
        </Link>
      ) : (
        <Link to="/auth">
          <Button variant="ghost" size="sm" 
            className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10">
            Connexion
          </Button>
        </Link>
      )}
    </div>
  </div>
</header>
```

---

#### 5. Effet scroll optionnel (bonus UX)

Ajouter un effet ou le header change de style au scroll :

```tsx
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 50);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Classes conditionnelles
<header className={cn(
  "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
  scrolled 
    ? "bg-background/90 backdrop-blur-lg border-b shadow-sm" 
    : "bg-transparent"
)}>
```

Cela permet au header de devenir opaque quand l'utilisateur scroll vers le bas (pour les autres sections).

---

### Ajustements supplementaires

#### Hero avec padding top pour le header
```tsx
// Le contenu hero aura un padding-top pour laisser l'espace du header
<div className="gradient-hero ... pt-24 md:pt-28">
  {/* Contenu existant */}
</div>
```

#### Couleurs du header sur fond gradient
- Icone Dumbbell : `text-primary-foreground` (blanc sur gradient bleu)
- Titre : `text-primary-foreground`
- Bouton Connexion : style ghost avec couleur claire
- Apres scroll : couleurs standard du theme

---

### Resume visuel

```text
AVANT :
+------------------HEADER (avec bordure)------------------+
|  Logo  |  Comment?  Pourquoi?  Coach  Prix  FAQ  | Btn  |
+---------------------------------------------------------+
                      [espace blanc]
        +------ HERO (card avec rounded corners) ------+
        |               Ton coach fitness...            |
        +-----------------------------------------------+

APRES :
+---------------------------------------------------------+
|    Logo           Pulse.ai              Connexion       |  <- Header transparent
|                                                         |
|               Ton coach fitness                         |  <- Hero gradient
|               dans ta poche.                            |     commence au top
|                                                         |
|                    [phone]                              |
|                                                         |
|                  [Faire le quiz]                        |
+---------------------------------------------------------+
        (rounded-bottom uniquement)

```

---

### Fichiers modifies

1. `src/components/Header.tsx` - Header marketing simplifie + effet scroll
2. `src/pages/Landing.tsx` - Hero ajuste sans padding-top excessif

---

### Section technique

#### Dependencies
- Aucune nouvelle dependance requise

#### Compatibilite
- Les variants "app" et "onboarding" du Header restent inchanges
- Seul le variant "marketing" (defaut) est modifie
- Le mobile aura aussi le header simplifie (plus de menu burger necessaire pour 5 liens)

#### Points d'attention
- Tester le contraste du header sur le gradient hero (texte blanc sur bleu)
- Verifier le comportement au scroll avec l'effet de transition
- S'assurer que le bouton reste cliquable sur fond transparent

