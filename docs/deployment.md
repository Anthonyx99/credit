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

## Cache des assets

Comportement par défaut du preset `node-server` (identique sur Vercel) :

| Ressource                | En-tête `cache-control`                    |
| ------------------------ | ------------------------------------------ |
| `/_nuxt/**` (nom hashé)  | `public, max-age=31536000, immutable`      |
| `public/**` (nom stable) | aucun — seulement `ETag` + `Last-Modified` |
| HTML rendu (SSR)         | aucun                                      |

- Les chunks Nuxt sont hashés par contenu : cache immutable d'un an sans risque,
  un nouveau build change leur nom. Rien à configurer.
- Les fichiers de `public/` gardent leur nom : pas de `Cache-Control` par défaut,
  donc revalidation conditionnelle à chaque requête. Pour les mettre en cache,
  ajouter une règle ciblée :

  ```ts
  routeRules: {
    '/favicon.svg': { headers: { 'cache-control': 'public, max-age=86400' } },
  }
  ```

- Le HTML SSR n'a pas d'en-tête de cache (contenu dynamique). Pour le mettre en
  cache, passer par `isr` / `prerender` dans `routeRules`.

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
