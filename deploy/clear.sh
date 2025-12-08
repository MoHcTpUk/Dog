#!/bin/bash

echo ""
echo "⚠️  ========================================== ⚠️"
echo "   WARNING! DANGEROUS OPERATION!"
echo "⚠️  ========================================== ⚠️"
echo ""
echo "This script will DELETE:"
echo "  • All stopped containers"
echo "  • All Docker volumes (database data, files, etc.)"
echo "  • All custom Docker networks"
echo "  • All build cache"
echo ""
echo "❌ ALL DATA WILL BE PERMANENTLY LOST!"
echo ""

read -p "Are you sure you want to continue? (yes/no): " confirm1
if [[ "$confirm1" != "yes" ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo ""
read -p "🔴 CONFIRM AGAIN. Type 'DELETE ALL' to proceed: " confirm2
if [[ "$confirm2" != "DELETE ALL" ]]; then
    echo "❌ Operation cancelled."
    exit 1
fi

echo ""
echo "🧹 Cleaning up Docker..."

# Stop all running containers (optional, uncomment if needed)
# echo "Stopping all running containers..."
# docker stop $(docker ps -aq) 2>/dev/null

# Remove all stopped containers
echo "📦 Removing stopped containers..."
docker container prune -f

# Remove unused images
# echo "🖼️  Removing unused images..."
# docker image prune -a -f

# Remove ALL volumes (including named volumes)
echo "💾 Removing ALL volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null || true

# Remove ALL custom networks (excluding default: bridge, host, none and Swarm ingress)
echo "🌐 Removing ALL custom networks..."
docker network ls --format '{{.Name}}' --filter type=custom | grep -v '^ingress$' | xargs -r docker network rm 2>/dev/null || true

# Remove build cache
echo "🔨 Removing build cache..."
docker builder prune -f

# Alternative: Remove everything at once (more aggressive)
# docker system prune -a --volumes -f

echo "✅ Docker cleanup complete!"
echo ""
echo "📊 Current Docker disk usage:"
docker system df

