#!/bin/bash

# Load environment variables
export $(cat .env | xargs)

# Check and stop system nginx if running
if systemctl is-active --quiet nginx; then
    echo "Stopping system Nginx..."
    sudo systemctl stop nginx
    sudo systemctl disable nginx
fi

# Check if any process is using port 80 or 443
if lsof -i :80 || lsof -i :443; then
    echo "Ports 80 or 443 are in use. Attempting to free them..."
    sudo fuser -k 80/tcp
    sudo fuser -k 443/tcp
fi

# Clean up any existing containers
docker-compose down

# Replace domain in nginx configs
envsubst '${DOMAIN_NAME}' < nginx/chat.conf.template > nginx/chat.conf
envsubst '${DOMAIN_NAME}' < nginx/api.conf.template > nginx/api.conf

# Create necessary directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Start nginx first for domain validation
docker-compose up -d nginx

# Wait for nginx to start
sleep 5

# Initialize SSL certificates
./scripts/init-letsencrypt.sh

# Start all services
docker-compose up -d

echo "Deployment completed successfully!"

# Show logs
docker-compose logs -f