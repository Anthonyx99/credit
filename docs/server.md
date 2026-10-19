# Backend — `server/` (Nitro)

Tout le code serveur vit dans `server/` (à la racine, **pas** dans `app/`).
Aucune clé secrète ni accès privilégié ne doit fuiter côté client.

## Répertoires

| Chemin               | Rôle                                                       |
| -------------------- | ---------------------------------------------------------- |
| `server/api/`        | endpoints REST sous `/api/**`                              |
| `server/routes/`     | routes serveur hors `/api` (ex. `sitemap.xml`)             |
| `server/middleware/` | exécuté à chaque requête, avant les routes (ne répond pas) |
| `server/plugins/`    | démarrage Nitro (hooks, init)                              |
| `server/utils/`      | helpers auto-importés côté serveur                         |

## Handler d'API

Toujours `defineEventHandler` (auto-importé). Un handler peut être `async`.

```ts
// server/api/users/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = Number(query.page ?? 1)
  const limit = Math.min(Number(query.limit ?? 20), 100)

  const db = useDatabase()
  const users = await db.users.findMany({ page, limit })

  return { users, page, limit }
})
```

### Méthodes & nommage

- Suffixer le fichier par la méthode : `index.get.ts`, `index.post.ts`,
  `[id].get.ts`, `[id].patch.ts`, `[id].delete.ts`.
- Contrôler explicitement la méthode : `event.method` ou en se basant sur le
  suffixe.
- Un endpoint sans suffixe répond à toutes les méthodes.

### Lecture d'entrée

- Query : `getQuery(event)`.
- Body : `await readBody(event)`.
- Params dynamiques : `getRouterParam(event, 'id')`.
- Headers : `getHeader(event, 'authorization')`.

**Valider systématiquement** les entrées non fiables. Recommandé :
`readValidatedBody` / `getValidatedQuery` (h3) avec un schéma, sinon validation
manuelle robuste. Un schéma réutilisé côté front doit vivre dans `shared/`.

### Réponse

- Retourner un objet JS : Nuxt le sérialise en JSON automatiquement.
- Statut : `setResponseStatus(event, 201)`.
- Headers : `setHeader(event, 'Location', ...)`.
- Cookies : `setCookie(event, name, value, { httpOnly: true, secure: true,
sameSite: 'lax', maxAge })`.

### Erreurs

```ts
throw createError({
  statusCode: 404,
  statusMessage: 'User not found',
})
```

- Toujours utiliser `createError` (jamais `throw new Error` nu dans un handler).
- Ne pas exposer de détail interne (`stack`, requête SQL) dans `statusMessage`.
- Codes cohérents : 400 validation, 401 auth, 403 autorisation, 404, 409
  conflit, 500 interne.

## Middleware serveur

`server/middleware/*.ts` s'exécute à **chaque** requête, avant les routes. Il ne
doit **pas** retourner de réponse (sauf court-circuit volontaire).

```ts
export default defineEventHandler((event) => {
  const start = Date.now()
  event.node.res.on('finish', () => {
    console.error(`${getRequestURL(event)} ${Date.now() - start}ms`)
  })
})
```

Rester léger : pas d'I/O lourde à chaque requête.

## Config & secrets

- Déclarer dans `nuxt.config.ts` -> `runtimeConfig`.
- Privé (serveur uniquement) : `runtimeConfig.apiSecret`.
- Public (exposé au client) : `runtimeConfig.public.xxx`.
- Surcharge via variables d'environnement préfixées `NUXT_`
  (ex. `NUXT_API_SECRET`, `NUXT_PUBLIC_API_BASE`).

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    databaseUrl: '',
    public: {
      siteUrl: 'http://localhost:3000',
    },
  },
})
```

Lecture : `useRuntimeConfig(event)` dans un handler. **Jamais** `process.env`
dans `app/`.

## Logique partagée

- Fonctions pures app + serveur -> `shared/utils/`.
- Types métier -> `shared/types/`.
- Schémas de validation réutilisés -> `shared/`.

Ne pas dupliquer une règle métier entre un endpoint et le front : l'extraire
dans `shared/`.

## Anti-patterns

- Retourner des données brutes de DB telles quelles (filtrer les champs
  sensibles : hash de mot de passe, tokens).
- Mettre la logique métier dans le handler sans extraction testable.
- `console.log` de debug laissé en place (préférer `console.error` contextualisé
  pour les erreurs réelles).
- Appeler une API externe depuis le client alors qu'un endpoint `server/` dédié
  cache/valide mieux.
