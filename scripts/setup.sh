#!/bin/bash

# Create necessary directories
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p nginx

# Copy nginx template files
cp nginx/*.conf.template nginx/

# Make scripts executable
chmod +x scripts/deploy.sh
chmod +x scripts/init-letsencrypt.sh

# Create docker network
docker network create chat-network 