# Structure du projet (Nuxt 4)

Nuxt 4 a changé la structure par défaut : le `srcDir` est désormais **`app/`**.
Toute la majorité des exemples Nuxt 3 trouvables en ligne (pages à la racine)
sont **obsolètes**. Ne jamais recréer une arborescence Nuxt 3.

## Arborescence de référence

```text
credit/
├─ app/                       # srcDir — tout le code Vue
│  ├─ app.vue                 # racine de l'app (obligatoire si pas de layout)
│  ├─ app.config.ts           # config réactive (build-time, exposable au client)
│  ├─ error.vue               # page d'erreur globale
│  ├─ assets/
│  │  └─ css/main.css         # entrée Tailwind v4
│  ├─ components/             # composants auto-importés
│  ├─ composables/            # composables auto-importés (préfixe `use`)
│  ├─ layouts/                # layouts auto-enregistrés
│  ├─ middleware/             # route middleware (`.global.ts` = global)
│  ├─ pages/                  # routing par fichiers
│  ├─ plugins/                # plugins Nuxt
│  └─ utils/                  # utils auto-importés
├─ server/                    # Nitro — code serveur
│  ├─ api/                    # endpoints sous /api/**
│  ├─ routes/                 # routes serveur (sans préfixe /api)
│  ├─ middleware/             # exécuté à chaque requête
│  ├─ plugins/                # plugins Nitro
│  └─ utils/                  # utils auto-importés côté serveur
├─ shared/                    # partagé app <-> server
│  ├─ utils/                  # auto-importés des deux côtés
│  └─ types/                  # auto-importés
├─ public/                    # servi tel quel (favicon.ico, robots.txt...)
├─ test/                      # unit/ · nuxt/ · e2e/
├─ docs/
├─ nuxt.config.ts
├─ vitest.config.ts
├─ eslint.config.mjs
├─ .prettierrc
├─ tsconfig.json
├─ package.json
└─ AGENTS.md
```

## Ce qui va dans `app/` vs à la racine

| Emplacement     | Contenu                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/` (srcDir) | `app.vue`, `app.config.ts`, `error.vue`, `assets/`, `components/`, `composables/`, `layouts/`, `middleware/`, `pages/`, `plugins/`, `utils/` |
| Racine          | `server/`, `shared/`, `public/`, `modules/`, `layers/`, `content/`, `nuxt.config.ts`                                                         |

Piège courant : `server/` **ne va pas** dans `app/`. `public/` non plus.

## Alias

| Alias      | Cible            |
| ---------- | ---------------- |
| `~`, `@`   | `app/`           |
| `~~`, `@@` | racine du projet |
| `#shared`  | `shared/`        |
| `#server`  | `server/`        |
| `assets`   | `app/assets/`    |

Exemples : `~/components/Button.vue` = `app/components/Button.vue` ;
`~~/nuxt.config` ; `#shared/utils/format` = `shared/utils/format.ts`.

## Auto-imports

Tout ce qui suit est **global**, ne jamais l'importer manuellement :

- Composants : `app/components/**` (nom = chemin en PascalCase,
  `components/ui/Button.vue` -> `<UiButton>`).
- Composables : `app/composables/**` (et l'auto-import `utils`).
- Utils : `app/utils/**`, `shared/utils/**`.
- Types : `shared/types/**`.
- API Nuxt : `useFetch`, `useAsyncData`, `useState`, `useRoute`, `ref`,
  `computed`, `defineEventHandler`, `defineNuxtRouteMiddleware`, etc.

Il n'est **pas** nécessaire d'ajouter des `import` pour ces éléments. Voir
[`conventions.md`](conventions.md) pour le style.

## `app/app.vue`

Racine de l'application. Il doit contenir au minimum :

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

Si l'app n'utilise pas de layouts, `<NuxtPage />` seul suffit. `app.vue` est
global : n'y mettre que le squelette persistant.

## `app/app.config.ts`

Configuration **réactive**, sérialisable et exposable au client (pas de secret).
Pour du theming/feature-flag purement build-time, préférer `app.config.ts` à
`runtimeConfig`.

```ts
export default defineAppConfig({
  theme: {
    brand: '#16a34a',
  },
})
```

Consommation : `const appConfig = useAppConfig()`.

## `app/pages/` — routing par fichiers

- `pages/index.vue` -> `/`
- `pages/users/index.vue` -> `/users`
- `pages/users/[id].vue` -> `/users/:id`
- `pages/[...slug].vue` -> catch-all
- `pages/(group)/x.vue` -> groupe de routes sans segment d'URL
- Layout/middleware via `definePageMeta` (compile-time, non réactif).

## `app/layouts/`

- `layouts/default.vue` est le layout par défaut.
- Utilisation : `<NuxtLayout name="admin">` ou `definePageMeta({ layout: 'admin' })`.
- Un layout doit rendre `<slot />`.

## `app/middleware/`

- `middleware/auth.ts` -> middleware nommé (via `definePageMeta({ middleware: 'auth' })`).
- `middleware/auth.global.ts` -> exécuté à chaque navigation, dans l'ordre
  alphabétique des fichiers (préfixer `00-`, `01-` pour forcer l'ordre).
- Route middleware uniquement. Le middleware serveur va dans `server/middleware/`.

## `server/` (aperçu)

Détail dans [`server.md`](server.md). Points de structure :

- `server/api/*.ts` sont préfixés par `/api`.
- `server/routes/*.ts` ne le sont pas (ex. `server/routes/sitemap.xml.ts`).
- `server/middleware/*.ts` s'exécutent à chaque requête (sans réponse).
- `server/utils/*.ts` sont auto-importés côté serveur.

## `shared/`

Code réutilisable par le Vue app **et** le Nitro server.

- `shared/utils/**` et `shared/types/**` : auto-importés des deux côtés.
- Tout le reste dans `shared/` n'est PAS auto-importé (importer via `#shared/...`).

Cas d'usage typiques : schémas de validation partagés, types d'entités métier,
formatters purs.

## Où créer un nouveau fichier

| Besoin                          | Emplacement                 |
| ------------------------------- | --------------------------- |
| Composant réutilisable          | `app/components/`           |
| Logique réutilisable côté Vue   | `app/composables/useXxx.ts` |
| Helper pur app-only             | `app/utils/`                |
| Helper pur partagé app + server | `shared/utils/`             |
| Type partagé                    | `shared/types/`             |
| Route UI                        | `app/pages/`                |
| Endpoint API                    | `server/api/`               |
| Route serveur non-API           | `server/routes/`            |
| Accès secret / base de données  | `server/` (jamais `app/`)   |
| Fichier statique                | `public/`                   |
