#!/bin/bash

# Stop running services
pm2 stop all

# Pull latest changes
git pull origin main

# Install dependencies
cd client
npm install
npm run build

cd ../server
npm install

# Copy built files to nginx directory
sudo cp -r ../client/dist/* /var/www/random-chat/dist/

# Restart services
pm2 start ecosystem.config.js --env production
sudo systemctl restart nginx 