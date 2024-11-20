#!/bin/bash

# Stop all containers

# Remove all containers and volumes
docker-compose down
docker-compose rm -f -v
rm -f nginx/*.conf
rm -rf certbot/
docker network rm chat-network-nginx 

./scripts/setup.sh
./scripts/deploy.sh