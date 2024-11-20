#!/bin/bash

# Load environment variables
export $(cat .env | xargs)

# Replace domain in nginx configs
envsubst '${DOMAIN_NAME}' < nginx/chat.conf.template > nginx/chat.conf
envsubst '${DOMAIN_NAME}' < nginx/api.conf.template > nginx/api.conf

# Start containers
docker-compose up -d

# Initialize SSL certificates
./scripts/init-letsencrypt.sh 