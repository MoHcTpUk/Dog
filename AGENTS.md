# DogApp — instructions for agents

This file provides project context for AI agents in Cursor.

## What this project is

**DogApp** is a web app with a microservice backend and a separate frontend. Deploy is Docker Swarm (Traefik, Portainer, app services).

## Main parts

| Part     | Path               | Tech                        |
|----------|--------------------|-----------------------------|
| Frontend | `src/frontend/`    | npm, dev server             |
| Backend  | `src/backend/Dog/`| .NET 9, Gateway, Identity, Dog API |
| Build    | `scripts/`         | bash scripts, Docker build  |
| Deploy   | `deploy/`          | Docker Compose/Swarm, Traefik |

## Common tasks

1. **Local frontend dev**: `cd src/frontend && npm install && npm run dev`
2. **Build images**: from `scripts/` — `./build_backend.sh`, `./build_frontend.sh`, or `./build_all.sh`
3. **Local deploy**: from `deploy/` — `./start_local.sh`; stop — `./stop.sh`
4. **Backend redeploy (stop → build → start)**: from `scripts/` — `./redeploy_backend_local.sh`
5. **Switch Gateway**: `deploy/switch-gateway-mode.sh docker|local`

## Cursor rules

Additional rules (style, deploy, etc.) live in `.cursor/rules/`. They are applied automatically by description and glob patterns.

## Useful files

- **README.md** — Quick Start, ports, deploy order
- **deploy/docker-compose.app.yml** — app stack (gateway, users, dogs, identity, frontend, landing)
