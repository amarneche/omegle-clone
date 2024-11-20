#!/bin/bash

# Load environment variables
export $(cat .env | xargs)

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