# DogApp

A microservices-based dog activity tracking application with frontend, backend services, and landing page.

## Quick Start

### Frontend Development
```bash
cd src/frontend
npm install
npm run dev
```

### Docker Deployment Scripts

All scripts are located in the `scripts/` directory. Run them from the scripts folder:
```bash
cd scripts
bash <script-name>.sh
```

#### 🚀 Full Deployment Scripts

| Script | Description |
|--------|-------------|
| `redeploy_all_local.sh` | **Complete redeploy**: removes all services, rebuilds all containers, and deploys everything |
| `deploy_all_local.sh` | Deploys all services (management, infrastructure, app) without rebuilding containers |
| `remove_all_local.sh` | Removes all Docker stacks, leaves swarm, and cleans up volumes |

#### 🔨 Build Scripts

| Script | Description |
|--------|-------------|
| `build_all_local.sh` | Builds all containers: frontend, backend (gateway + users), and landing |
| `build_backend.sh` | Builds backend services (gateway and users service) |
| `build_frontend.sh` | Builds frontend container |
| `build_landing.sh` | Builds landing page container |

#### ♻️ Update Scripts

| Script | Description |
|--------|-------------|
| `update_backend.sh` | Rebuilds backend and redeploys only the app stack |
| `deploy_app_local.sh` | Redeploys only the app stack (without infrastructure) |

#### 📦 Registry Scripts

| Script | Description |
|--------|-------------|
| `publish_all.sh` | Publishes all built containers to the GitHub Container Registry |

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

### Additional Services (when active)
- **PostgreSQL**: port 4321 (-> 5432 inside container)
- **NATS**: 
  - Client: port 4222
  - Monitoring: port 8222
- **MinIO**: 
  - API: port 9009 (-> 9000 inside container)
  - Web Console: port 9001
- **Keycloak**: port 8085 (-> 8080 inside container)
