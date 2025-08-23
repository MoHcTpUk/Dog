build_all_local.sh - build docker containers for both front and back

build_backend.sh - build docker for back

build_frontend.sh - build docker for frontend

deploy_all_local.sh - deploy all services locally with no containers builds

publish_all.sh - publish containers to registry

redeploy_all_local.sh - clean all, build all, deploy all

remove_all_local.sh - clean all

Run frontend: npm i / npm run dev

Traefik: http://localhost:8080/dashboard/#/
Portainer: http://127.0.0.1:9000/

Backend: http://localhost/api