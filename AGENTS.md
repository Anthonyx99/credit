# AGENTS.md — Guide des agents de code

> Point d'entrée de la documentation. **Lis ce fichier en entier** avant toute
> modification. Les détails par domaine sont dans `docs/`.
> En cas de doute sur une API, consulte la doc officielle de la version
> installée (Nuxt 4.x) plutôt que ta mémoire d'entraînement.

## Le projet

Application web **full-stack Nuxt 4** en stack « vanilla » : le framework Nuxt
et son écosystème officiel uniquement (pas de UI kit, pas de Pinia, pas de
couche d'abstraction superflue). Rendu serveur (SSR) activé, déploiement Vercel.

- Langage : TypeScript strict partout.
- Responsabilité : UI + logique dans `app/`, backend dans `server/`, code
  partagé dans `shared/`.

## Stack (versions épinglées — oct. 2026)

| Rôle                 | Paquet                              | Version                  |
| -------------------- | ----------------------------------- | ------------------------ |
| Framework            | `nuxt`                              | `4.6.x`                  |
| Vue                  | `vue` / `vue-router`                | gérés par Nuxt           |
| Styling              | `tailwindcss` + `@tailwindcss/vite` | `4.3.x`                  |
| Lint                 | `@nuxt/eslint` (ESLint flat)        | `1.17.x`                 |
| Format               | `prettier`                          | `3.9.x`                  |
| Types (app + server) | `vue-tsc` via `nuxt typecheck`      | `3.3.x`                  |
| Tests                | `vitest` + `@nuxt/test-utils`       | `5.0.x` / `4.3.x`        |
| Runtime              | Node.js                             | `^22.22.3 \|\| ^24.15.0` |
| Gestionnaire         | pnpm                                | `>= 10`                  |

Détails et justifications : [`docs/stack.md`](docs/stack.md).

## Règle n°1 — C'est Nuxt 4, pas Nuxt 3

**La structure des dossiers a changé en Nuxt 4.** Ne te fie pas à ta mémoire
Nuxt 3 : la majorité des exemples en ligne sont obsolètes. Points critiques :

- Le `srcDir` par défaut est **`app/`**. Tout le code Vue (pages, composants,
  layouts, composables, plugins, middleware, assets, `app.vue`,
  `app.config.ts`, `error.vue`) vit dans **`app/`**, pas à la racine.
- Restent **à la racine** : `server/`, `shared/`, `public/`, `modules/`,
  `layers/`, `nuxt.config.ts`.
- Alias (défauts Nuxt 4) :
  - `~` et `@` → `app/` (ex. `~/pages` = `app/pages`)
  - `~~` et `@@` → racine du projet
  - `#shared` → `shared/`, `#server` → `server/`
- `assets/` est aliasé vers `app/assets/`.

Détails complets : [`docs/structure.md`](docs/structure.md).

## Règles non négociables

1. **Auto-imports Nuxt** : ne JAMAIS importer manuellement un composant de
   `app/components/`, un composable de `app/composables/`, un util de
   `app/utils/` ou `shared/utils/`, ni les API Nuxt (`useFetch`, `useState`,
   `ref`, `computed`, `defineEventHandler`, ...). Ils sont globaux.
2. **TypeScript strict**, zéro `any` non justifié. Les types partagés vivent
   dans `shared/types/`.
3. **Pas de `$fetch` dans `<script setup>` au rendu** : utiliser `useFetch` /
   `useAsyncData` (sinon double fetch SSR + fuite de données). Voir
   [`docs/data-and-state.md`](docs/data-and-state.md).
4. **Pas de secret côté client** : les variables sensibles passent par
   `runtimeConfig` (privé) et `server/`. Jamais de `process.env` dans le code
   client.
5. **État partagé via `useState`** (pas de Pinia dans cette stack). Clés
   explicites et uniques.
6. **Styling via Tailwind v4** en classes utilitaires. Pas de CSS custom sauf
   besoin réel, pas de `@tailwind base/components/utilities` (syntaxe v3
   obsolète). Voir [`docs/styling.md`](docs/styling.md).
7. **Aucun commentaire** dans le code sauf demande explicite.
8. **Pas de dépendance ajoutée** sans validation explicite. La stack est
   « vanilla » par choix.

## Commandes

Tout tourne dans **Docker** (Node 22/24 + pnpm 12 dans le conteneur — voir
[`docs/docker.md`](docs/docker.md)). Le **`Makefile`** enveloppe les commandes ;
à lancer depuis WSL, dans le dossier du projet.

```bash
make help       # liste toutes les cibles
make install    # dépendances (pnpm install)
make up         # serveur de dev → http://localhost:3000 (port : `APP_PORT`)
make lint       # ESLint
make typecheck  # vue-tsc via `nuxt typecheck`
make test       # Vitest (unit + nuxt + e2e)
make build      # build production
make sh         # shell dans le conteneur
make clean      # conteneurs + volume node_modules
```

Sous le capot, chaque cible exécute `docker compose run --rm app pnpm <script>`.
Scripts `pnpm` (référence) : `dev`, `build`, `preview`, `generate`, `lint`,
`lint:fix`, `format`, `format:check`, `typecheck`, `test`, `test:unit`,
`test:nuxt`, `test:e2e`, `test:watch`.

Depuis Windows/PowerShell, éviter de retaper la commande WSL en ajoutant une fois
dans `$PROFILE` :

```powershell
function dev { wsl -d Ubuntu -- make -C /chemin/vers/credit @args }
```

puis `dev lint`, `dev up`, `dev test`.

## Carte du dépôt

```text
credit/
├─ app/                      # srcDir — tout le code Vue
│  ├─ app.vue                # composant racine
│  ├─ app.config.ts          # config réactive build-time (token-safe)
│  ├─ error.vue              # page d'erreur globale
│  ├─ assets/css/main.css    # entrée Tailwind v4
│  ├─ components/            # auto-importés
│  ├─ composables/           # auto-importés (préfixe `use`)
│  ├─ layouts/               # auto-enregistrés
│  ├─ middleware/            # route middleware (.global.ts = global)
│  ├─ pages/                 # routing par fichiers
│  ├─ plugins/               # plugins Nuxt
│  └─ utils/                 # auto-importés
├─ server/                   # Nitro (backend)
│  ├─ api/                   # endpoints /api/**
│  ├─ routes/                # routes serveur (ex. sitemap.xml)
│  ├─ middleware/            # server middleware (toutes requêtes)
│  ├─ plugins/               # plugins Nitro
│  └─ utils/                 # auto-importés côté serveur
├─ shared/                   # code partagé app <-> server
│  ├─ utils/                 # auto-importés des deux côtés
│  └─ types/                 # auto-importés
├─ public/                   # fichiers servis tels quels
├─ test/                     # unit/ · nuxt/ · e2e/
├─ docker/entrypoint.sh      # entrypoint du conteneur dev
├─ docs/                     # cette documentation
├─ nuxt.config.ts            # config Nuxt
├─ vitest.config.ts
├─ eslint.config.mjs
├─ .prettierrc
├─ tsconfig.json
├─ package.json
├─ pnpm-workspace.yaml       # réglages pnpm (allowBuilds, ...)
├─ Makefile                  # raccourcis Docker + pnpm
├─ Dockerfile                # images dev / build / prod
├─ docker-compose.yml        # service dev
├─ .dockerignore
└─ AGENTS.md
```

## Documentation par domaine

| Sujet                                | Fichier                                                      |
| ------------------------------------ | ------------------------------------------------------------ |
| Stack, versions, scripts             | [`docs/stack.md`](docs/stack.md)                             |
| Structure des dossiers (Nuxt 4)      | [`docs/structure.md`](docs/structure.md)                     |
| Conventions de code (TS / Vue)       | [`docs/conventions.md`](docs/conventions.md)                 |
| Data fetching & état                 | [`docs/data-and-state.md`](docs/data-and-state.md)           |
| Styling Tailwind v4                  | [`docs/styling.md`](docs/styling.md)                         |
| Backend `server/`                    | [`docs/server.md`](docs/server.md)                           |
| Tests & qualité                      | [`docs/testing-and-quality.md`](docs/testing-and-quality.md) |
| Déploiement Vercel                   | [`docs/deployment.md`](docs/deployment.md)                   |
| Environnement Docker (dev & tooling) | [`docs/docker.md`](docs/docker.md)                           |
| Simulateur de crédit                 | [`docs/simulator.md`](docs/simulator.md)                     |

## Workflow attendu d'un agent

1. Lire `AGENTS.md` puis le(s) doc(s) du domaine concerné.
2. Vérifier la structure réelle existante avant de créer un fichier (ne pas
   inventer un dossier « Nuxt 3 »).
3. Implémenter en respectant les règles non négociables ci-dessus.
4. Ajouter/mettre à jour les tests pertinents (`test/`).
5. Terminer par la Definition of Done ci-dessous.

## Definition of Done

Une tâche est terminée uniquement si, dans l'ordre :

1. `pnpm lint` passe ;
2. `pnpm typecheck` passe ;
3. `pnpm test` passe ;
4. aucun `console.log` / code mort / commentaire inutile laissé ;
5. la documentation impactée (`docs/`) est mise à jour si le comportement change.
