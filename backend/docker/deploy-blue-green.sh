#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose --env-file .env -f docker/docker-compose.prod.yml"
DYNAMIC_CONFIG="docker/traefik/dynamic/backend.yml"
DRAIN_SECONDS=10
HEALTH_TIMEOUT=120

if grep -q "backend_blue" "$DYNAMIC_CONFIG"; then
  ACTIVE_COLOR="blue"
  NEW_COLOR="green"
else
  ACTIVE_COLOR="green"
  NEW_COLOR="blue"
fi

if ! docker ps -q -f "name=^komissx_backend_blue$" | grep -q . \
  && ! docker ps -q -f "name=^komissx_backend_green$" | grep -q .; then
  NEW_COLOR="blue"
  ACTIVE_COLOR=""
fi

echo "==> Cor ativa: ${ACTIVE_COLOR:-nenhuma} | Nova cor: $NEW_COLOR"

$COMPOSE up -d --wait postgres redis

echo "==> Buildando backend-$NEW_COLOR..."
$COMPOSE --profile "$NEW_COLOR" build "backend-$NEW_COLOR"

echo "==> Subindo backend-$NEW_COLOR..."
$COMPOSE --profile "$NEW_COLOR" up -d --force-recreate "backend-$NEW_COLOR"

echo "==> Aguardando healthcheck..."
elapsed=0
until [ "$(docker inspect -f '{{.State.Health.Status}}' "komissx_backend_${NEW_COLOR}")" = "healthy" ]; do
  sleep 2
  elapsed=$((elapsed + 2))
  if [ "$elapsed" -ge "$HEALTH_TIMEOUT" ]; then
    echo "!! Timeout. Abortando."
    $COMPOSE --profile "$NEW_COLOR" logs --tail=100 "backend-$NEW_COLOR"
    exit 1
  fi
done

echo "==> Rodando migrations..."
$COMPOSE --profile "$NEW_COLOR" exec -T "backend-$NEW_COLOR" npm run migration:run

if docker ps -aq -f "name=^komissx_backend$" | grep -q .; then
  echo "==> Parando container legado komissx_backend (porta 3000)"
  docker stop komissx_backend || true
  docker rm -f komissx_backend || true
fi

$COMPOSE up -d traefik

echo "==> Trocando Traefik para $NEW_COLOR..."
cat > "$DYNAMIC_CONFIG" <<EOF
http:
  routers:
    backend:
      rule: "PathPrefix(\`/\`)"
      entryPoints:
        - web
      service: backend

  services:
    backend:
      loadBalancer:
        healthCheck:
          path: /api/health
          interval: "5s"
          timeout: "3s"
        servers:
          - url: "http://komissx_backend_${NEW_COLOR}:3000"
EOF

sleep "$DRAIN_SECONDS"

if [ -n "$ACTIVE_COLOR" ] && [ "$ACTIVE_COLOR" != "$NEW_COLOR" ]; then
  echo "==> Removendo backend-$ACTIVE_COLOR..."
  $COMPOSE --profile "$ACTIVE_COLOR" stop "backend-$ACTIVE_COLOR"
  $COMPOSE --profile "$ACTIVE_COLOR" rm -f "backend-$ACTIVE_COLOR"
fi

echo "==> Deploy concluído. Cor ativa: $NEW_COLOR"