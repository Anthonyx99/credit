# Data fetching & état

## Règle d'or

**Dans `<script setup>`, au rendu : jamais de `$fetch` nu.** Utiliser `useFetch`
ou `useAsyncData`. Un `$fetch` nu s'exécute deux fois (SSR + client) et casse la
sérialisation du payload.

| Contexte                                         | Outil                                            |
| ------------------------------------------------ | ------------------------------------------------ |
| Charger des données au rendu d'un composant/page | `useFetch` / `useAsyncData`                      |
| Après une action utilisateur (submit, clic)      | `$fetch`                                         |
| Mutation puis rafraîchissement                   | `$fetch` + `refresh()` ou `refreshNuxtData(key)` |
| État partagé simple entre composants             | `useState`                                       |

## `useFetch` vs `useAsyncData`

- `useFetch(url)` = raccourci `useAsyncData` + `$fetch`. À préférer pour un GET
  simple.
- `useAsyncData(key, handler)` quand :
  - la requête n'est pas un simple `$fetch`,
  - on combine plusieurs appels,
  - on a besoin d'une clé stable.

```ts
const route = useRoute()
const { data, pending, error, refresh } = await useFetch<Post[]>('/api/posts', {
  query: { page: route.query.page },
  watch: [() => route.query.page],
})
```

Points clés :

- **`key`** : fournir une clé explicite et stable si le handler est dynamique,
  pour éviter les collisions de cache/dédup.
- **`lazy: true`** (`useLazyFetch`) : ne bloque pas la navigation, `pending` gère
  le squelette.
- **`server: false`** : uniquement si la donnée ne peut/doit pas être rendue SSR.
- **`transform` / `pick`** : ne renvoyer au client que le nécessaire (évite de
  fuiter des champs serveur dans le payload).
- **`getCachedData`** : réutiliser le cache Nuxt pour éviter un refetch inutile.
- **`refresh()`** accepte `{ dedupe: 'cancel' | 'defer' }` pour gérer les appels
  concurrents.
- **`status`** remplace l'usage d'un booléen `pending` quand on a besoin des
  états `idle | pending | success | error`.

## `$fetch` (uniquement hors rendu)

```ts
async function createUser(input: CreateUserInput) {
  await $fetch('/api/users', { method: 'POST', body: input })
  await refreshNuxtData('users')
}
```

- `$fetch` côté client est fine : c'est le client HTTP universel (ofetch).
- Ne pas l'utiliser directement dans le corps de setup au rendu.
- Ne jamais l'appeler sans gestion d'erreur (try/catch, ou `useFetch` avec
  `error`).

## État partagé — `useState`

Pas de Pinia dans cette stack. Utiliser `useState` avec une **clé explicite et
unique**, stable entre serveur et client.

```ts
export function useCounter() {
  const count = useState<number>('counter', () => 0)
  const increment = () => {
    count.value++
  }
  return { count, increment }
}
```

Bonnes pratiques :

- La clé suit un namespace : `'auth:user'`, `'cart:items'`.
- Valeur initiale via une **factory** (`() => valeur`) pour éviter le partage de
  référence entre requêtes SSR.
- Ne pas stocker de données non sérialisables.
- Préférer l'état local (`ref`) ou l'URL (`useRoute().query`) quand le partage
  global n'est pas nécessaire.
- Pour un calcul dérivé, utiliser `computed`, pas un `useState` recalculé.

## `callOnce` / `useAsyncData` au niveau plugin

Pour exécuter une logique une seule fois au démarrage de l'app (charger la
session, etc.), utiliser `callOnce` dans un plugin plutôt que `useAsyncData`.

## Anti-patterns à bannir

- `$fetch` dans `<script setup>` au rendu.
- `fetch`/`axios` natifs à la place des helpers Nuxt.
- `useState` avec une clé générique (`'data'`, `'state'`) : risque de collision.
- State mutable global exporté d'un module (fuite entre requêtes SSR).
- Recopier dans `useState` ce qui est déjà géré par `useFetch` (source de
  désynchronisation).

## Payload & fuite de données

Le payload SSR est sérialisé et envoyé au client. Toute donnée obtenue via
`useAsyncData`/`useFetch` et non filtrée est **visible par le client** :

- Ne jamais y mettre de secret/token.
- Utiliser `transform`/`pick` pour exposer a minima.
- Les accès privilégiés (DB, API privée) restent dans `server/` ; l'app ne
  consomme que des endpoints `/api`.
