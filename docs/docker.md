# Environnement Docker (dev & tooling)

Objectif : exécuter **Node, pnpm et toute l'outbox** dans un conteneur, pour ne
dépendre d'aucune installation locale. Indispensable ici car le host n'a pas la
bonne version de Node (Nuxt 4.6 exige Node `^22.22.3 || ^24.15.0`).

## Prérequis

- **Docker Desktop démarré** (le daemon doit tourner ; `docker compose config`
  fonctionne sans, mais `up`/`build` non).
- **Intégration WSL2 activée** : Docker Desktop > Settings > Resources > WSL
  Integration > cocher la distro `Ubuntu`. Sans cela, la commande `docker` est
  absente dans WSL et les bind-mounts vers `/home/...` échouent.
- Lancer les commandes **depuis WSL/Ubuntu**, dans le dossier du projet côté
  WSL (ex. `/chemin/vers/credit`) : les bind-mounts de chemins UNC Windows
  `\\wsl.localhost\...` ne sont pas fiables.
- Compose v2 (vérifié : Docker 29 / Compose v5).

## Fichiers

| Fichier                | Rôle                                                        |
| ---------------------- | ----------------------------------------------------------- |
| `Dockerfile`           | images `dev` (défaut), `build` et `prod`                    |
| `docker-compose.yml`   | service `app` de développement (HMR, volumes)               |
| `docker/entrypoint.sh` | installe les deps au premier démarrage si nécessaire        |
| `.dockerignore`        | exclut `node_modules`, `.nuxt`, `.output`, docs... du build |

- Image de base : `node:24-bookworm-slim` (slim Debian, plus sûr qu'Alpine pour
  les modules natifs).
- pnpm installé globalement dans l'image (version épinglée via `PNPM_VERSION`).
- L'utilisateur du conteneur est `node` (uid/gid 1000), aligné sur l'utilisateur
  WSL par défaut : les fichiers générés (`.nuxt`, etc.) appartiennent au host.

## Raccourcis (Makefile)

Le `Makefile` enveloppe tout. À lancer depuis WSL, dans le dossier du projet :

```bash
make help         # liste toutes les cibles
make install      # pnpm install dans le conteneur
make up           # serveur de dev en arrière-plan (port : APP_PORT)
make down         # arrêt
make logs         # logs du service app (suivi continu)
make sh           # shell dans le conteneur
make lint         # ESLint
make lint-fix     # ESLint --fix
make format       # Prettier --write
make format-check
make typecheck
make test         # unit + nuxt + e2e
make test-unit
make test-nuxt
make test-e2e
make test-watch
make build        # build production
make preview
make rebuild      # rebuild de l'image sans cache
make clean        # down -v (supprime le volume node_modules)
make run C="pnpm add -D zod"   # commande libre dans le conteneur
```

Le port hôte se règle via `APP_PORT` dans `.env` (défaut `3000`).

Depuis Windows/PowerShell, définir une fois dans `$PROFILE` :

```powershell
function dev { wsl -d Ubuntu -- make -C /chemin/vers/credit @args }
```

puis `dev lint`, `dev up`, `dev test`.

## Démarrage

```bash
# Builder puis lancer le serveur de dev (http://localhost:3000)
docker compose up app

# En arrière-plan
docker compose up -d app

# Logs / arrêt
docker compose logs -f app
docker compose down
```

Au **premier** démarrage, l'entrypoint exécute `pnpm install` si
`node_modules` est vide. Les dépendances vivent dans un **volume nommé**
`node_modules` (non pollué par le host, non versionné).

## Exécuter les commandes du projet (lint, tests, ...)

Toute commande `pnpm` du projet s'exécute dans le conteneur :

```bash
docker compose run --rm app pnpm install
docker compose run --rm app pnpm lint
docker compose run --rm app pnpm typecheck
docker compose run --rm app pnpm test
docker compose run --rm app pnpm build
docker compose run --rm app pnpm add <pkg>        # ajouter une dépendance
docker compose run --rm app pnpm dlx <cli>        # outil ponctuel
```

- `run --rm` : conteneur jetable, idéal pour les tâches one-shot.
- `exec` : pour une commande dans un conteneur **déjà démarré**
  (`docker compose exec app sh`).
- Shell interactif : `docker compose run --rm app sh`.

## HMR / file watching

- Le port hôte est configurable via `APP_PORT` (défaut `3000`, mappé sur `3000`
  dans le conteneur). Ex. `APP_PORT=3001` dans `.env` si `3000` est déjà pris.
- Si le HMR ne réagit pas (typique sous Docker Desktop Windows), forcer le
  polling via un fichier `.env` à la racine :

  ```dotenv
  CHOKIDAR_USEPOLLING=true
  ```

  Puis `docker compose up app`.

## Rebuilder l'image

À refaire après modification du `Dockerfile`, de `docker-compose.yml` ou montée
de version de Node :

```bash
docker compose build app
docker compose build --no-cache app   # si besoin de repartir de zéro
```

## Image de production (self-hosting, optionnel)

Le déploiement principal reste **Vercel** (voir [`deployment.md`](deployment.md)).
Pour un self-hosting (VPS, Docker), le `Dockerfile` fournit une cible `prod`
basée sur le preset Nitro `node-server` :

```bash
docker build --target prod -t credit-prod .
docker run --rm -p 3000:3000 --env-file .env credit-prod
```

Nécessite un `pnpm-lock.yaml` à jour (le build utilise `--frozen-lockfile`).

## Dépannage

| Symptôme                    | Piste                                                         |
| --------------------------- | ------------------------------------------------------------- |
| `EACCES` sur `node_modules` | Rebuild de l'image ; l'utilisateur est `node` (uid 1000).     |
| HMR inactif                 | `CHOKIDAR_USEPOLLING=true` dans `.env`.                       |
| Conflit de port 3000        | Définir `APP_PORT=3001` dans `.env` puis relancer.            |
| Deps obsolètes              | `docker compose run --rm app pnpm install`.                   |
| Cache corrompu              | `docker compose down -v` (supprime le volume `node_modules`). |
