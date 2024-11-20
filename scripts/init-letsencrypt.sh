#!/bin/bash

# Load environment variables
export $(cat .env | xargs)

domains=(chat.$DOMAIN_NAME chat-api.$DOMAIN_NAME)
rsa_key_size=4096
data_path="./certbot"
email="contact@amarneche.me"  # Replace with your email

# Install certbot certificates
for domain in "${domains[@]}"; do
  echo "Creating certificate for $domain"
  
  # Stop nginx
  docker-compose stop nginx
  
  # Get certificates
  docker-compose run --rm --entrypoint "\
    certbot certonly --webroot \
      --webroot-path=/var/www/certbot \
      --email $email \
      --agree-tos \
      --no-eff-email \
      --force-renewal \
      -d $domain" certbot

  # Start nginx
  docker-compose start nginx
done 