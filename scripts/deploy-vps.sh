#!/usr/bin/env bash
# Manual VPS pull/recreate for jolt (mirrors GH Actions deploy step).
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/jolt}"
IMAGE="${IMAGE:-ghcr.io/jolangker/jolt}"
TAG="${1:-latest}"
FULL="${IMAGE}:${TAG}"

cd "$DEPLOY_DIR"
echo "pulling ${FULL}"
docker pull "${FULL}"
docker tag "${FULL}" "${IMAGE}:latest"
docker tag "${FULL}" jolleyx/jolt:latest
docker compose up -d --force-recreate --remove-orphans
sleep 2
docker ps --filter name=jolt --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
curl -fsS -o /dev/null -w 'local:%{http_code}\n' http://127.0.0.1:3010/
echo "ok ${FULL}"
