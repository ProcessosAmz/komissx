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

if grep -qE '^SKIP_DATABASE=true' .env; then
  echo "==> SKIP_DATABASE=true — subindo só redis"
  $COMPOSE up -d --no-recreate --wait --wait-timeout 60 redis
else
  $COMPOSE up -d --no-recreate --wait --wait-timeout 60 postgres redis
  docker network connect --alias postgres komissx komissx_postgres 2>/dev/null || true
fi

docker network connect --alias redis komissx komissx_redis 2>/dev/null || true

if ! docker image inspect traefik:v3.1 >/dev/null 2>&1; then
  echo "==> Pull Traefik..."
  $COMPOSE pull traefik
else
  echo "==> Traefik já está no host, pulando pull"
fi

BACKEND_IMAGE=$(grep -E '^BACKEND_IMAGE=' .env | cut -d= -f2- | tr -d '\r')
if [ -z "$BACKEND_IMAGE" ]; then
  echo "!! BACKEND_IMAGE ausente no .env"
  exit 1
fi

echo "==> Pull backend $BACKEND_IMAGE..."
docker pull "$BACKEND_IMAGE"

echo "==> Subindo backend-$NEW_COLOR..."
$COMPOSE --profile "$NEW_COLOR" up -d --force-recreate --no-build "backend-$NEW_COLOR"

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
if grep -qE '^SKIP_DATABASE=true' .env; then
  echo "==> SKIP_DATABASE=true — pulando migrations"
else
  $COMPOSE --profile "$NEW_COLOR" exec -T "backend-$NEW_COLOR" npm run migration:run
fi

if docker ps -aq -f "name=^komissx_backend$" | grep -q .; then
  echo "==> Parando container legado komissx_backend (porta 3000)"
  docker stop komissx_backend || true
  docker rm -f komissx_backend || true
fi

if docker ps -aq -f "name=^komissx_frontend$" | grep -q .; then
  echo "==> Parando container legado komissx_frontend (porta 8080)"
  docker stop komissx_frontend || true
  docker rm -f komissx_frontend || true
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
          path: /api/health/live
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
