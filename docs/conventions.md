# Conventions de code

Objectif : un code homogène, strictement typé, idiomatique Nuxt 4 / Vue 3.

## TypeScript

- **Mode strict** activé (`typescript.strict: true`). Zéro `any` non justifié ;
  préférer `unknown` + narrowing, ou un générique.
- Typer explicitement les valeurs de retour publiques des composables et des
  handlers serveur.
- Types partagés app <-> server dans `shared/types/` (auto-importés).
- Augmentation de types via `declare module` dans un fichier dédié si besoin
  (`runtimeConfig`, `appConfig`...).
- Ne pas utiliser `as` pour contourner une erreur de type ; corriger le type.

## Vue — Single File Components

- Toujours `<script setup lang="ts">`.
- Ordre des blocs : `<script>` puis `<template>` puis `<style>` (si nécessaire).
- Un composant par fichier.
- Nom de fichier **PascalCase** pour les composants (`UserCard.vue`).
- Nom de composant : plusieurs mots (jamais `Button.vue` seul) pour éviter les
  collisions avec les éléments HTML.
- `defineProps` / `defineEmits` avec types TypeScript, pas de tableau de strings :

```vue
<script setup lang="ts">
interface Props {
  label: string
  disabled?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ submit: [id: string] }>()
</script>
```

- Pas de `defineComponent` sauf cas exceptionnel ; `defineNuxtComponent` n'est
  pas nécessaire.
- Éviter les `<style>` : utiliser Tailwind. Si un style est indispensable, le
  garder `scoped`.

## Auto-imports (rappel critique)

Ne jamais écrire d'`import` pour :

- composants de `app/components/`,
- composables de `app/composables/`,
- utils de `app/utils/` et `shared/utils/`,
- types de `shared/types/`,
- API Nuxt (`ref`, `computed`, `useFetch`, `useState`, `defineEventHandler`...),
- API Vue (`ref`, `computed`, `watch`, `onMounted`...).

En revanche, on importe explicitement :

- les dépendances npm,
- le code partagé **non auto-importé** via `#shared/...`,
- les types d'`@nuxt/schema` / `h3` / `#imports` si nécessaire.

## Nommage

| Élément                   | Convention                 | Exemple                         |
| ------------------------- | -------------------------- | ------------------------------- |
| Composant (fichier + nom) | PascalCase, multi-mots     | `UserCard.vue`                  |
| Page                      | kebab-case                 | `pages/user-settings.vue`       |
| Composable                | `useXxx`                   | `useAuth.ts`                    |
| Util                      | camelCase (nom de fichier) | `formatPrice.ts`                |
| Composable — retour       | objet de refs              | `return { user, login }`        |
| Constante                 | SCREAMING_SNAKE_CASE       | `MAX_RETRIES`                   |
| Type / interface          | PascalCase                 | `interface User`                |
| Route API (fichier)       | `index.[method].ts`        | `server/api/users/index.get.ts` |

- Un composable retourne un **objet de refs** (jamais un ref nu) pour rester
  destructurable.
- Les composables qui touchent à l'état global utilisent `useState` (voir
  [`data-and-state.md`](data-and-state.md)).

## Organisation des fichiers

- Imports en haut, groupés : npm, puis alias (`~`, `#shared`), puis relatifs.
- Pas de logique métier lourde dans `<template>` : extraire dans le script des
  `computed`.
- Extraire un composant dès qu'un bloc de template dépasse ~100 lignes ou est
  réutilisé.

## Gestion des erreurs

- Côté serveur : `throw createError({ statusCode, statusMessage, data? })`.
- Côté client : `useFetch`/`useAsyncData` exposent `error` ; utiliser
  `showError()` pour propager vers `error.vue` si nécessaire.
- Ne jamais avaler une erreur silencieusement ; logguer côté serveur avec
  `console.error` **uniquement** dans `server/` (jamais côté client en prod).

## Interdits

- Aucun commentaire dans le code, sauf demande explicite.
- Aucun `console.log` laissé en place.
- Aucun `process.env` dans le code client (utiliser `runtimeConfig`).
- Aucun import manuel d'un auto-import.
- Aucun `any` implicite ou explicite non justifié.
- Aucune dépendance ajoutée sans validation.

## Qualité

Voir [`testing-and-quality.md`](testing-and-quality.md) pour ESLint, Prettier,
typecheck et tests. Le formatage est géré par Prettier (ne pas discuter le
style : laisser Prettier trancher).
