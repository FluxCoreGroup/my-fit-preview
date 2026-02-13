

## Header Hub : version minimaliste et compacte

### Constat

Le header actuel prend trop de place verticalement (~180px) avec un padding genereux (`py-8`), des lignes de texte espacees, et la barre de progression. L'objectif est de le rendre plus compact tout en gardant un rendu premium.

### Changements proposes

#### Reduire l'encombrement vertical

- Passer le padding de `py-8` a `py-5`
- Mettre la salutation et le nom sur une seule ligne : "Bonsoir, **Bryan** 👋"
- Reduire le sous-titre dynamique en `text-xs`
- Remonter la barre de progression avec un `mt-2.5` au lieu de `mt-4`
- Reduire les marges entre chaque element (`mt-0.5` vers `mt-0`)

#### Layout plus structure

- Afficher salutation + nom en une ligne avec `flex items-baseline gap-1.5`
- Le sous-titre passe juste en dessous, plus discret
- La barre de progression reste mais plus compacte : `h-1.5` au lieu de `h-2`, labels en `text-[11px]`

### Section technique

**Fichier modifie** : `src/pages/Hub.tsx` (bloc header, lignes 167-187)

Remplacement du header par :

```text
<div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-4 py-5 text-white">
  <div className="flex items-baseline gap-1.5">
    <span className="text-sm text-white/60">{getGreeting()},</span>
    <h1 className="text-xl font-bold">{userName} 👋</h1>
  </div>
  <p className="text-xs text-white/70 mt-1">
    {getSubtitle(sessionsData?.completed, sessionsData?.total)}
  </p>
  {sessionsData?.total && sessionsData.total > 0 ? (
    <div className="mt-2.5">
      <div className="flex justify-between text-[11px] text-white/50 mb-1">
        <span>{sessionsData.completed}/{sessionsData.total} seances</span>
        <span>{Math.round(...)}</span>
      </div>
      <Progress value={...} className="h-1.5 bg-white/15 [&>div]:bg-white" />
    </div>
  ) : null}
</div>
```

Resultat : header ~40% plus compact, meme information, rendu plus clean et aerien.

