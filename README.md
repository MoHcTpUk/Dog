# DogApp

Web application with a .NET microservice backend, React frontend, and Docker Swarm deployment.

## Project Structure

```
src/
├── frontend/       # React 19 + Vite + Ionic + Tailwind (Feature-Sliced Design)
├── backend/Dog/    # .NET 9 — Gateway, Identity, Users, Dog services
├── landing/        # Static landing page
└── telegrambot/    # Telegram bot
build/              # Dockerfiles for all services
scripts/            # Build, publish, and helper scripts
deploy/             # Docker Compose files and deploy scripts
```

## Quick Start

### 1. Set up local domains

```bash
cd scripts
sudo ./create_local_domain.sh
```

Adds `dogappa.local`, `app.dogappa.local`, `api.dogappa.local`, `auth.dogappa.local` to `/etc/hosts`.

### 2. Generate local HTTPS certificates

```bash
cd deploy
./generate-local-certs.sh
```

Uses `mkcert` (preferred) or falls back to OpenSSL self-signed certs.

### 3. Build images

```bash
cd scripts
./build_all.sh
```

### 4. Deploy locally

```bash
cd deploy
./start_local.sh
```

### 5. Frontend development

```bash
cd src/frontend
npm install
npm run dev
```

Dev server starts at `http://localhost:5173`. API calls go to `https://api.dogappa.local:8443`.

## Common Flows

### Full rebuild + deploy

```bash
cd scripts && ./build_all.sh
cd ../deploy && ./start_local.sh
```

### Rebuild backend only + redeploy app stack

```bash
cd scripts && ./redeploy_backend_local.sh
```

Or manually: `./build_backend.sh` then `../deploy/start_local.sh`. The script runs `deploy/stop.sh` → `build_backend.sh` → `deploy/start_local.sh`.

### Switch Gateway to local (for debugging)

```bash
cd deploy
./switch-gateway-mode.sh local    # routes traffic to host.docker.internal:5115
./switch-gateway-mode.sh docker   # restores Docker gateway service
./switch-gateway-mode.sh status   # show current mode
```

### Publish images to GHCR

```bash
cd scripts
./publish_all.sh                          # linux/amd64
./publish_all.sh linux/amd64,linux/arm64  # multi-platform
```

### Deploy to stage

```bash
cd scripts
./deploy_all_stage.sh
```

Copies compose files via SCP and runs `start_stage.sh` on the server.

## Local Access (localhost)

### Application (via Traefik)

| Service          | URL                                     |
| ---------------- | --------------------------------------- |
| Landing          | https://dogappa.local:8443              |
| Frontend         | https://app.dogappa.local:8443          |
| Backend API      | https://api.dogappa.local:8443/api      |
| Identity         | https://identity.dogappa.local:8443     |

### Infrastructure

| Service            | URL / Port                    |
| ------------------ | ----------------------------- |
| Traefik HTTP       | http://localhost:8181         |
| Traefik HTTPS      | https://localhost:8443        |
| Traefik Dashboard  | http://localhost:9002         |
| Portainer UI       | http://localhost:9003         |
| PostgreSQL         | localhost:6566                |
| NATS Client        | localhost:4223                |
| NATS Monitoring    | http://localhost:8223         |
| MinIO API          | http://localhost:9009         |
| MinIO Console      | http://localhost:9001         |

### Frontend Dev Server

| Service  | URL                      |
| -------- | ------------------------ |
| Vite dev | http://localhost:5173    |

## Deployment Order

1. **Management** stack — Portainer
2. **Infrastructure** stack — Traefik, PostgreSQL, Redis, NATS, MinIO
3. **Application** stack — Gateway, Users, Dogs, Identity, Frontend, Landing

## Scripts Reference

### `scripts/` — Build & Publish

All scripts must be run from the `scripts/` directory. Build scripts accept an optional `platform` argument (auto-detected from CPU arch if omitted).

| Script                    | Description                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| `build_all.sh [platform]` | Builds all images in parallel (frontend, backend, landing, bot)   |
| `build_backend.sh [platform]` | Builds Gateway, Users, Identity, Identity.WebApi, Dog images |
| `build_frontend.sh [platform]` | Builds frontend image                                       |
| `build_landing.sh [platform]`  | Builds landing image                                        |
| `build_telegram_bot.sh [platform]` | Builds Telegram bot image                              |
| `publish_all.sh [platforms]` | Builds and pushes all images to GHCR (`linux/amd64` by default) |

### `scripts/` — Helpers

| Script                    | Description                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| `redeploy_backend_local.sh` | Stop stacks, build backend images, start local deploy (run from `scripts/`) |
| `create_local_domain.sh`  | Adds `*.dogappa.local` entries to `/etc/hosts` (requires `sudo`)  |
| `ios_dev.sh <cmd>`        | Capacitor iOS helper: `open`, `sync`, `run`, `sync:run`, `build:sync:run` |
| `remove_all.sh`           | Removes all stacks and leaves Docker Swarm                        |

### `scripts/` — Stage Deploy

| Script                    | Description                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| `deploy_all_stage.sh`     | Copies compose files to stage server and runs `start_stage.sh`    |

### `deploy/` — Docker Swarm

| Script                              | Description                                                    |
| ----------------------------------- | -------------------------------------------------------------- |
| `start_local.sh`                    | Inits Swarm (if needed), deploys management + infra + app      |
| `start_stage.sh`                    | Pulls images from GHCR, deploys all stacks for stage           |
| `stop.sh`                           | Removes app, infra, and management stacks                      |
| `switch-gateway-mode.sh <mode>`     | Switches Gateway between `docker`, `local`, or shows `status`  |
| `generate-local-certs.sh`           | Generates local HTTPS certs via mkcert or OpenSSL              |
| `generate-local-certs.ps1`          | Same as above, PowerShell version for Windows                  |

### `deploy/` — Compose Files

| File                              | Description                                     |
| --------------------------------- | ----------------------------------------------- |
| `docker-compose.management.yml`   | Portainer                                       |
| `docker-compose.infra.yml`        | Traefik, PostgreSQL, Redis, NATS, MinIO (base)  |
| `docker-compose.infra.local.yml`  | Local port overrides for infra                  |
| `docker-compose.infra.stage.yml`  | Stage overrides (LetsEncrypt, public ports)     |
| `docker-compose.app.yml`          | Gateway, Users, Dogs, Identity, Frontend, Landing (base) |
| `docker-compose.app.stage.yml`    | Stage overrides (public domains, Telegram bot)  |
