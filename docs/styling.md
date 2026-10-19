# Styling — Tailwind CSS v4

## Intégration (v4, via le plugin Vite)

Tailwind v4 s'intègre avec `@tailwindcss/vite`, pas avec un `tailwind.config.js`.

`nuxt.config.ts` :

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
})
```

`app/assets/css/main.css` :

```css
@import 'tailwindcss';
```

C'est tout. Pas de `@tailwind base/components/utilities` (syntaxe v3 obsolète),
pas de `tailwind.config.js`, pas de `content: []` (la détection est automatique).

## Design tokens via `@theme`

Les tokens (couleurs, fonts, espacements) se déclarent en CSS dans `@theme`.
Ils génèrent des variables CSS **et** des utilitaires associés.

```css
@import 'tailwindcss';

@theme {
  --color-brand-50: oklch(0.97 0.02 150);
  --color-brand-500: oklch(0.62 0.17 150);
  --color-brand-600: oklch(0.55 0.17 150);
  --font-display: 'Inter', sans-serif;
  --radius-card: 0.75rem;
}
```

Usage : `bg-brand-500`, `text-brand-600`, `font-display`, `rounded-card`.

- Ne pas ajouter de couleurs « one-off » en dur dans les composants : passer par
  un token `@theme`.
- Le thème sombre se gère via la variante `dark:` ; définir la stratégie une
  seule fois (classe/attribut sur `<html>`).

## Conventions d'écriture

- Utility-first : le style vit dans le `class` du template.
- Ordre des classes : laisser Prettier/`prettier-plugin-tailwindcss` trier si
  activé ; sinon regroupement logique (layout, espacement, typographie,
  couleur, état).
- Extraire un composant plutôt que dupliquer une longue chaîne de classes.
- Pour un ensemble d'utilitaires réutilisé, définir une **classe composant** via
  `@utility` ou `@layer components` dans `main.css` — pas de `<style>` scoped
  par défaut.

```css
@layer components {
  .btn {
    @apply inline-flex items-center rounded-md px-3 py-2 font-medium;
  }
}
```

- Variantes (`hover:`, `focus-visible:`, `md:`, `dark:`) en ligne, pas de CSS
  conditionnel en JS.
- Accessibilité : toujours un `focus-visible` visible, jamais `outline-none` sans
  remplacement.

## Interdits

- `<style>` non scoped ou CSS custom superflu.
- `style="..."` inline pour du layout statique (utiliser les utilitaires).
- Classes dynamiques construites par concaténation (`'text-' + color`) : Tailwind
  ne les détecte pas. Utiliser des classes complètes ou un objet de mapping.
- `@apply` massif qui recrée un framework CSS maison.

## Fichiers

| Fichier                   | Rôle                                                       |
| ------------------------- | ---------------------------------------------------------- |
| `app/assets/css/main.css` | entrée unique : `@import` + `@theme` + `@layer components` |

Un seul point d'entrée CSS. Ne pas importer d'autres feuilles Tailwind.
