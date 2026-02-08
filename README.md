## Quick Start

### Frontend Development
```bash
cd src/frontend
npm install
npm run dev
```

### Scripts (build / deploy)

Most scripts in `scripts/` must be run from that folder:

```bash
cd scripts
bash <script>.sh [args]
```

#### Build (local images, `--load`)

| Script | What it does |
|--------|--------------|
| `build_all.sh [platform]` | Builds frontend + backend + landing + telegram bot in parallel |
| `build_backend.sh [platform]` | Builds: Gateway, Users, Identity, Identity.WebApi |
| `build_frontend.sh [platform]` | Builds frontend image |
| `build_landing.sh [platform]` | Builds landing image |
| `build_telegram_bot.sh [platform]` | Builds telegram-bot image |

`platform` defaults to your CPU (`linux/amd64` or `linux/arm64`).

#### Publish (push to GHCR)

| Script | What it does |
|--------|--------------|
| `publish_all.sh [platforms]` | Builds & pushes all images to GitHub Container Registry |

`platforms` defaults to `linux/amd64`. You can pass a comma-separated list, e.g. `linux/amd64,linux/arm64`.

#### Local helpers

| Script | What it does |
|--------|--------------|
| `create_local_domain.sh` | Adds `*.dogappa.local` entries into `/etc/hosts` (Linux/macOS/WSL, needs `sudo`) |
| `ios_dev.sh <cmd>` | iOS dev helper for Capacitor (`open`, `sync`, `run`, ...) — edit device UDID inside |

#### Deploy (Docker Swarm)

Local deploy scripts live in `deploy/`:

| Script | What it does |
|--------|--------------|
| `deploy/start_local.sh` | Initializes swarm (if needed) and deploys `management` + `infra` + `app` stacks |
| `deploy/stop.sh` | Removes stacks (`app`, `infra`, `management`) |
| `deploy/generate-local-certs.ps1` / `deploy/generate-local-certs.sh` | Generates local HTTPS certs into `deploy/certs/` (mkcert preferred) |
| `deploy/switch-gateway-mode.sh <mode>` | Switches API routing between Docker gateway and locally running gateway |
| `scripts/remove_all.sh` | Removes stacks and leaves swarm (`docker swarm leave --force`) |

Common flows (local):

```bash
# Full rebuild + deploy
cd scripts
./build_all.sh
cd ../deploy
./start_local.sh

# Rebuild backend + redeploy only app stack
cd scripts
./build_backend.sh
cd ../deploy
docker stack deploy --detach=false --compose-file docker-compose.app.yml app
```

Stage deploy:

| Script | What it does |
|--------|--------------|
| `scripts/deploy_all_stage.sh` | SSH to server and runs `deploy/start_stage.sh` (pulls images from GHCR) |

### Deployment Order

The deployment process follows this order:
1. **Management** stack (Portainer)
2. **Infrastructure** stack (Traefik)
3. **Application** stack (Gateway, Users, Frontend, Landing)

## Port Mappings (Local Development)

### Main Services
- **Landing**: http://localhost:8000/ (via Traefik)
- **Backend API**: http://localhost:8000/api (via Traefik)
- **Frontend**: http://localhost:8000/ (via Traefik)

### Infrastructure Services
- **Traefik Dashboard**: http://localhost:9002/
  - HTTP entry point: port 8000 (-> 80 inside container)
  - Dashboard/API: port 9002 (-> 8080 inside container)

- **Portainer**: http://localhost:9000/
  - Web UI: port 9000

- **PostgreSQL**: port 4321 (-> 5432 inside container)

- **NATS**: 
  - Client: port 4222
  - Monitoring: port 8222

- **MinIO**: 
  - API: port 9009 (-> 9000 inside container)
  - Web Console: port 9001

- **Keycloak**: port 8085 (-> 8080 inside container)
