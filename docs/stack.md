# Stack & décisions techniques

Document de référence des choix technologiques. Objectif : une stack « vanilla »,
pérenne et proche des recommandations officielles Nuxt, sans couche superflue.

## Versions (oct. 2026)

| Paquet               | Version    | Rôle                             |
| -------------------- | ---------- | -------------------------------- |
| `nuxt`               | `4.6.x`    | framework full-stack             |
| `vue` / `vue-router` | (via Nuxt) | runtime UI                       |
| `tailwindcss`        | `4.3.x`    | styling utility-first            |
| `@tailwindcss/vite`  | `4.3.x`    | plugin Vite Tailwind v4          |
| `@nuxt/eslint`       | `1.17.x`   | ESLint flat config project-aware |
| `eslint`             | `10.x`     | linter                           |
| `prettier`           | `3.9.x`    | formatage                        |
| `vue-tsc`            | `3.3.x`    | typecheck (via `nuxt typecheck`) |
| `vitest`             | `5.0.x`    | test runner                      |
| `@nuxt/test-utils`   | `4.3.x`    | environnement de test Nuxt       |
| `@vue/test-utils`    | (dernière) | montage de composants            |
| `happy-dom`          | (dernière) | DOM de test                      |
| `nuxt-charts`        | `2.2.x`    | graphiques (module Nuxt, Unovis) |
| `@unovis/ts`         | `1.7.x`    | moteur de rendu des graphiques   |

## Contraintes d'environnement

- **Node.js** : `^22.22.3 || ^24.15.0` (imposé par `nuxt@4.6`). Utiliser Node 22
  ou 24 LTS. Vérifier avec `node -v` avant tout `pnpm install`.
- **pnpm** `>= 10` : gestionnaire imposé. Ne pas générer de `package-lock.json`
  ni `yarn.lock`.

## Décisions

1. **Nuxt 4 vanilla** — Nuxt core + écosystème officiel. Pas de UI kit
   (Nuxt UI, Vuetify...), pas de couche ORM, pas de client HTTP tiers.
2. **TypeScript strict** — `typescript.strict: true`, `typeCheck` activable.
   Types partagés dans `shared/types/`.
3. **Tailwind CSS v4 via `@tailwindcss/vite`** — intégration Vite native,
   recommandée par la documentation Tailwind v4. Configuration par CSS
   (`@import "tailwindcss"` + `@theme`), pas de `tailwind.config.js`. Voir
   [`styling.md`](styling.md).
4. **État via `useState` natif** — suffisant pour du SSR simple. **Pas de
   Pinia.** Un état complexe doit d'abord être justifié ; préférer l'état local
   ou l'URL (`useRoute`/query).
5. **Data fetching Nuxt natif** — `useFetch` / `useAsyncData` / `$fetch`.
   Aucun client HTTP tiers. Voir [`data-and-state.md`](data-and-state.md).
6. **Backend Nitro dans `server/`** — API colocalisées, mêmes types que le front
   via `shared/`. Voir [`server.md`](server.md).
7. **Qualité** — ESLint flat (`@nuxt/eslint`) + Prettier + `vue-tsc` +
   Vitest/`@nuxt/test-utils`. Voir
   [`testing-and-quality.md`](testing-and-quality.md).
8. **Déploiement Vercel** — preset Nitro `vercel`. Voir
   [`deployment.md`](deployment.md).
9. **Graphiques via `nuxt-charts`** — module Nuxt (composants client-only,
   enums auto-importés) basé sur Unovis. Pas de graphique fait main. Voir
   [`simulator.md`](simulator.md) et la section « Graphiques » ci-dessous.

## Graphiques (`nuxt-charts`) : poids et chargement

Unovis est lourd : le bundle des graphes pèse environ **2,3 Mo non compressés**
(~590 ko gzip), dont les données TopoJSON des cartes, inutilisées ici. Le
tree-shaking est impossible côté `vue-chrts` : `dist/index.js` réexporte toutes
les cartes et le paquet ne déclare pas `sideEffects: false`.

Deux réglages limitent donc le chargement à la seule page qui affiche un
graphique :

```ts
// nuxt.config.ts
nuxtChartsLegacy: {
  global: false,
},
```

- `global: false` : les composants restent auto-importés dans les `<template>`,
  mais ne sont plus **enregistrés globalement**. Sans ce réglage, Nuxt ajoute un
  `<link rel="prefetch">` du bundle Unovis sur **toutes** les pages (mesuré :
  951 ko téléchargés inutilement depuis `/`).
- Le lien de navigation vers `/simulateur` (`AppHeader.vue`) utilise
  `:prefetch="false"` : sinon le prefetch de route (NuxtLink) précharge la page
  **et ses dépendances statiques**, donc tout le bundle des graphes.

Résultat : `/` ne référence aucun chunk de graphe ; `/simulateur` les charge à la
demande. Ne pas réactiver `global: true` ni le prefetch de ce lien sans mesurer
l'impact sur `pnpm build`.

## Scripts `package.json` (référence)

```jsonc
{
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "nuxt typecheck",
    "test": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:nuxt": "vitest run --project nuxt",
    "test:e2e": "vitest run --project e2e",
    "test:watch": "vitest",
  },
}
```

## Réglages pnpm

Depuis pnpm 11, le champ `pnpm` de `package.json` **n'est plus lu**. Les réglages
vivent dans `pnpm-workspace.yaml` (ex. `allowBuilds`, l'ancien
`onlyBuiltDependencies`). Avec `strictDepBuilds` activé par défaut, tout build
script de dépendance non approuvé fait **échouer** `pnpm install`
(`ERR_PNPM_IGNORED_BUILDS`). La liste actuelle autorise `esbuild`, `unrs-resolver`
et `@parcel/watcher`.

```yaml
allowBuilds:
  esbuild: true
  unrs-resolver: true
  '@parcel/watcher': true
```

Ajouter une dépendance avec un build script : l'ajouter ici en `true` (via
`pnpm approve-builds` ou manuellement) avant de committer.

## Anti-stack (volontairement exclu)

- UI kits et design systems tiers.
- Pinia / Vuex (utiliser `useState`).
- `axios` ou autre client HTTP (utiliser `$fetch` / `useFetch`).
- `tailwind.config.js` (v4 se configure en CSS).
- Prettier-plugin-tailwindcss non requis par défaut (optionnel, à valider).
