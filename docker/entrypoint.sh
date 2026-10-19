#!/bin/sh
set -e

if [ -f package.json ] && [ ! -f node_modules/.modules.yaml ]; then
  echo "> Dependencies not installed yet, running pnpm install..."
  pnpm install
fi

exec "$@"
