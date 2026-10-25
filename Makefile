DC := docker compose
PROD := $(DC) -f docker-compose.prod.yml
APP := app
RUN := $(DC) run --rm $(APP)

GIT ?= git
BRANCH ?= main

.DEFAULT_GOAL := help

.PHONY: help install up dev down logs sh run build preview lint lint-fix format format-check typecheck test test-unit test-nuxt test-e2e test-watch rebuild clean prod-build prod-up prod-down prod-logs deploy

help: ## Affiche cette aide
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Installe les dépendances (dans le conteneur)
	$(RUN) pnpm install

up: ## Démarre le serveur de dev (http://localhost:3000)
	$(DC) up $(APP) -d

dev: up ## Alias de up

down: ## Arrête et supprime les conteneurs
	$(DC) down

logs: ## Suit les logs du service app
	$(DC) logs -f $(APP)

sh: ## Shell interactif dans le conteneur
	$(RUN) sh

run: ## Commande libre : make run C="pnpm add -D foo"
	$(RUN) $(C)

build: ## Build production
	$(RUN) pnpm build

preview: ## Prévisualise le build production
	$(RUN) pnpm preview

lint: ## ESLint
	$(RUN) pnpm lint

lint-fix: ## ESLint --fix
	$(RUN) pnpm lint:fix

format: ## Prettier --write
	$(RUN) pnpm format

format-check: ## Prettier --check
	$(RUN) pnpm format:check

typecheck: ## Typecheck (vue-tsc via nuxt typecheck)
	$(RUN) pnpm typecheck

test: ## Tous les tests
	$(RUN) pnpm test

test-unit: ## Tests unit
	$(RUN) pnpm test:unit

test-nuxt: ## Tests environnement Nuxt
	$(RUN) pnpm test:nuxt

test-e2e: ## Tests e2e
	$(RUN) pnpm test:e2e

test-watch: ## Tests en watch mode
	$(RUN) pnpm test:watch

rebuild: ## Rebuild l'image dev sans cache
	$(DC) build --no-cache $(APP)

clean: ## Détruit les conteneurs + le volume node_modules
	$(DC) down -v

## Production (serveur, derrière Traefik)

prod-build: ## Build l'image de production
	$(PROD) build

prod-up: ## Démarre la prod (Traefik : credit.example.com)
	$(PROD) up -d

prod-down: ## Arrête la prod
	$(PROD) down

prod-logs: ## Suit les logs de la prod
	$(PROD) logs -f $(APP)

deploy: ## Serveur : pull + rebuild + relance de la prod
	$(GIT) pull origin $(BRANCH)
	$(PROD) build
	$(PROD) up -d --remove-orphans
