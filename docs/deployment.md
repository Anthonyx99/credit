# Déploiement — Vercel

## Preset Nitro

Cible Vercel. Le preset est auto-détecté par Nitro sur Vercel ; on peut le
forcer explicitement :

```ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel',
  },
})
```

`pnpm build` produit un bundle Nitro (fonctions serverless + assets statiques)
dans `.output/`.

## Build & preview

```bash
pnpm build      # build production
pnpm preview    # prévisualisation locale du build
```

- Ne pas committer `.output/` ni `.nuxt/`.
- `postinstall: nuxt prepare` doit exister pour générer les types après
  installation.

## Variables d'environnement

Mapping `runtimeConfig` <-> env, préfixe `NUXT_` :

| Clé runtime config             | Variable d'environnement | Portée  |
| ------------------------------ | ------------------------ | ------- |
| `runtimeConfig.databaseUrl`    | `NUXT_DATABASE_URL`      | serveur |
| `runtimeConfig.public.apiBase` | `NUXT_PUBLIC_API_BASE`   | client  |

- Configurer les variables dans le dashboard Vercel (Production / Preview /
  Development).
- **Jamais** de secret dans une clé `public` (exposée au client).
- Documenter toute nouvelle variable d'environnement requise.

## Cache des assets & cache busting

Toutes les URL produites par le build sont hashées par contenu : un fichier
modifié change de nom, donc d'URL. Le cache busting est automatique, rien à
versionner à la main.

Réglage en place (`nuxt.config.ts`) :

```ts
routeRules: {
  '/**': { headers: { 'cache-control': 'no-cache' } },
},
```

En-têtes constatés en preview (preset `node-server`) :

| Ressource                | `cache-control`                       |
| ------------------------ | ------------------------------------- |
| `/_nuxt/**` (nom hashé)  | `public, max-age=31536000, immutable` |
| HTML rendu (SSR)         | `no-cache` + `ETag`                   |
| `public/**` (nom stable) | `no-cache` + `ETag`                   |

- Nitro conserve son en-tête `immutable` pour `/_nuxt/**`, qui garde priorité :
  le `no-cache` ne s'applique donc qu'au HTML et aux fichiers de `public/`.
- `no-cache` n'empêche pas la mise en cache : la réponse est stockée puis
  revérifiée (`304` si l'`ETag` n'a pas changé). Sans cet en-tête, le navigateur
  peut appliquer un cache heuristique au HTML et continuer à référencer des
  chunks supprimés lors d'un déploiement.
- Pour donner un TTL long à un fichier de `public/`, ajouter une règle plus
  spécifique, par exemple
  `'/logo.png': { headers: { 'cache-control': 'public, max-age=86400' } }`.

### Mise à jour d'un client déjà ouvert

- **Manifeste de build** (`experimental.appManifest`, actif par défaut) : le
  client interroge `/_nuxt/builds/latest.json` (avec un cache-buster
  `?timestamp`) selon `experimental.checkOutdatedBuildInterval` (1 h par défaut).
  Si l'`id` diffère du build courant, la page est rechargée à la navigation
  suivante.
- **Échec de chargement de chunk** (`experimental.emitRouteChunkError:
'automatic'`, défaut) : si un chunk ne se charge plus (vieux HTML + chunk
  supprimé), Nuxt appelle `reloadNuxtApp` — rechargement complet, état conservé.
- Pour forcer la mise à jour immédiatement, un rechargement dur suffit : le HTML
  est en `no-cache`.

Pour une page réellement statique, `prerender` / `isr` restent disponibles dans
`routeRules` ; vérifier les en-têtes en preview car ils prennent le pas sur le
`no-cache` global.

## `routeRules` (cache / rendu)

Utiliser `routeRules` pour le rendu hybride et le cache :

```ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/blog/**': { isr: 3600 },
    '/api/**': { cors: true },
    '/admin/**': { ssr: false },
  },
})
```

- `prerender` : généré au build.
- `isr: <secondes>` : revalidation incrémentale (cache CDN).
- `ssr: false` : rendu client (SPA) pour une route.
- Tester en preview que le comportement de cache attendu est bien appliqué.

## CI (ordre recommandé)

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Une PR ne peut être mergée que si toute la chaîne passe.

## Checklist avant déploiement

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` passent.
- [ ] Variables d'environnement définies sur Vercel.
- [ ] Aucun secret dans le code ou le payload client.
- [ ] `compatibilityDate` fixée dans `nuxt.config.ts` (format `YYYY-MM-DD`).
- [ ] `.output/`, `.nuxt/`, `node_modules/`, `.env*` ignorés par git.
