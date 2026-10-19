# Tests & qualité

## Outils

- **ESLint** flat config project-aware via `@nuxt/eslint`.
- **Prettier** pour le formatage (fait autorité).
- **vue-tsc** pour le typecheck, via `nuxt typecheck`.
- **Vitest** + **`@nuxt/test-utils`** pour les tests.

## Scripts

```bash
pnpm lint          # ESLint
pnpm lint:fix
pnpm format        # Prettier --write
pnpm format:check
pnpm typecheck     # nuxt typecheck (vue-tsc)
pnpm test          # tous les projets Vitest
pnpm test:unit     # projet "unit"
pnpm test:nuxt     # projet "nuxt"
pnpm test:e2e      # projet "e2e"
```

## ESLint

Config générée par `@nuxt/eslint` (flat config) dans `eslint.config.mjs`.

```js
// eslint.config.mjs
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
```

- Ne pas désactiver une règle globalement sans justification écrite dans la PR.
- Corriger la cause, pas le symptôme (éviter les `// eslint-disable`).
- Le module `@nuxt/eslint` s'ajoute aux `modules` de `nuxt.config.ts`.

## Prettier

- `.prettierrc` à la racine ; tout le code est formaté par Prettier.
- Ne pas débattre du style : lancer `pnpm format`.
- Intégrer `prettier-plugin-tailwindcss` **uniquement** si validé (tri des
  classes). Sinon ne pas l'ajouter.

## TypeScript / typecheck

- `nuxt typecheck` (vue-tsc) doit passer sans erreur.
- Les types Nuxt générés (`.nuxt/`) sont créés par `nuxt prepare`
  (postinstall).
- Ne pas committer `/// <reference>` manuels : Nuxt prépare les tsconfig.

## Structure des tests

```text
test/
├─ unit/       # logique pure : utils, shared/utils, fonctions
├─ nuxt/       # composants, composables, pages (environnement Nuxt)
└─ e2e/        # parcours bout-en-bout
```

Convention de nommage : `*.test.ts` (ou `*.spec.ts`).

## Configuration Vitest

`vitest.config.ts` avec deux/trois projets (unit, nuxt, e2e) :

```ts
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/*.{test,spec}.ts'],
        },
      },
    ],
  },
})
```

- `environment: 'nuxt'` fournit le runtime Nuxt (auto-imports, `mountSuspended`,
  `useState`...).
- `defineVitestProject` est asynchrone et utilise un top-level `await` : le
  `package.json` doit contenir `"type": "module"`, sinon renommer le fichier
  `vitest.config.mts`.
- Opt-out par fichier : `// @vitest-environment node` en tête.
- `.env.test` pour les variables d'environnement de test.

## Que tester

- **unit** : `shared/utils`, `app/utils`, formatters, calculs métier purs,
  validateurs.
- **nuxt** : composables (`useXxx`) et composants (rendu, props, événements via
  `mountSuspended` de `@nuxt/test-utils/runtime`).
- **e2e** : parcours critiques (auth, checkout...), via `setup()` de
  `@nuxt/test-utils/e2e` et `createPage`.

Ne pas viser un % de couverture arbitraire : tester le comportement à valeur.

## Ordre de vérification (Definition of Done)

Avant de considérer une tâche terminée :

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Puis vérifier : aucun `console.log`, aucun code mort, aucun commentaire inutile,
docs `docs/` mises à jour si le comportement change.
