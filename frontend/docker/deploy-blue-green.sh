#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose --env-file .env -f docker/docker-compose.prod.yml"
DYNAMIC_CONFIG="../backend/docker/traefik/dynamic/frontend.yml"
DRAIN_SECONDS=5
HEALTH_TIMEOUT=90

if grep -q "frontend_blue" "$DYNAMIC_CONFIG"; then
  ACTIVE_COLOR="blue"
  NEW_COLOR="green"
else
  ACTIVE_COLOR="green"
  NEW_COLOR="blue"
fi

if ! docker ps -q -f "name=^komissx_frontend_blue$" | grep -q . \
  && ! docker ps -q -f "name=^komissx_frontend_green$" | grep -q .; then
  NEW_COLOR="blue"
  ACTIVE_COLOR=""
fi

echo "==> Frontend cor ativa: ${ACTIVE_COLOR:-nenhuma} | Nova cor: $NEW_COLOR"

FRONTEND_IMAGE=$(grep -E '^FRONTEND_IMAGE=' .env | cut -d= -f2- | tr -d '\r')
if [ -z "$FRONTEND_IMAGE" ]; then
  echo "!! FRONTEND_IMAGE ausente no .env"
  exit 1
fi

echo "==> Pull frontend $FRONTEND_IMAGE..."
docker pull "$FRONTEND_IMAGE"

echo "==> Subindo frontend-$NEW_COLOR..."
$COMPOSE --profile "$NEW_COLOR" up -d --force-recreate --no-build "frontend-$NEW_COLOR"

echo "==> Aguardando healthcheck..."
elapsed=0
until [ "$(docker inspect -f '{{.State.Health.Status}}' "komissx_frontend_${NEW_COLOR}")" = "healthy" ]; do
  sleep 2
  elapsed=$((elapsed + 2))
  if [ "$elapsed" -ge "$HEALTH_TIMEOUT" ]; then
    echo "!! Timeout. Abortando frontend."
    $COMPOSE --profile "$NEW_COLOR" logs --tail=100 "frontend-$NEW_COLOR"
    exit 1
  fi
done

if docker ps -aq -f "name=^komissx_frontend$" | grep -q .; then
  echo "==> Parando container legado komissx_frontend (porta 8080)"
  docker stop komissx_frontend || true
  docker rm -f komissx_frontend || true
fi

echo "==> Trocando Traefik frontend para $NEW_COLOR..."
cat > "$DYNAMIC_CONFIG" <<EOF
http:
  routers:
    frontend-api:
      rule: "PathPrefix(\`/api\`)"
      entryPoints:
        - frontend
      service: backend
      priority: 100

    frontend:
      rule: "PathPrefix(\`/\`)"
      entryPoints:
        - frontend
      service: frontend
      priority: 1

  services:
    frontend:
      loadBalancer:
        healthCheck:
          path: /health
          interval: "5s"
          timeout: "3s"
        servers:
          - url: "http://komissx_frontend_${NEW_COLOR}:80"

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
  echo "==> Removendo frontend-$ACTIVE_COLOR..."
  $COMPOSE --profile "$ACTIVE_COLOR" stop "frontend-$ACTIVE_COLOR"
  $COMPOSE --profile "$ACTIVE_COLOR" rm -f "frontend-$ACTIVE_COLOR"
fi

echo "==> Frontend deploy concluído. Cor ativa: $NEW_COLOR"