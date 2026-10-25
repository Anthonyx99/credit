# syntax=docker/dockerfile:1

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG PNPM_VERSION=12
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/* \
  && npm install --global pnpm@${PNPM_VERSION} \
  && pnpm --version \
  && mkdir -p "$PNPM_HOME" \
  && chown -R node:node "$PNPM_HOME"
WORKDIR /app

FROM base AS dev
ENV NODE_ENV=development
RUN mkdir -p /app/node_modules && chown -R node:node /app
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
USER node
EXPOSE 3000 24678
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

FROM base AS build
ENV NITRO_PRESET=node-server
COPY . .
RUN pnpm install --frozen-lockfile \
  && pnpm build

FROM node:${NODE_VERSION}-bookworm-slim AS prod
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
