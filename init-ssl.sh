#!/bin/bash
set -e

DOMAIN="officebackend.amptechnology.in"
EMAIL="devs.amptechnology@gmail.com"
APP_PORT="9001"
CERT_PATH="./certbot/conf/live/$DOMAIN/fullchain.pem"

echo "=== Starting SSL setup for $DOMAIN ==="

# Kill any native mongod process that might hold port 27017
systemctl stop mongod 2>/dev/null || true
pkill mongod 2>/dev/null || true

# Ensure required directories exist
mkdir -p ./nginx/conf.d
mkdir -p ./certbot/www/.well-known/acme-challenge
mkdir -p ./certbot/conf
chown -R root:root ./certbot
chmod -R 755 ./certbot

# Generate mongo keyfile if it doesn't exist
if [ ! -f ./mongo-keyfile ]; then
  echo "Generating MongoDB keyfile..."
  openssl rand -base64 756 > ./mongo-keyfile
  chmod 400 ./mongo-keyfile
  echo "MongoDB keyfile created."
fi

# Writes the final HTTPS reverse-proxy config for the Node app
write_https_config() {
cat > ./nginx/conf.d/app.conf << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://node-app:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF
}

# ─────────────────────────────────────────────────────────────
# CASE 1: Certificate already exists → just redeploy app stack
# ─────────────────────────────────────────────────────────────
if test -f "$CERT_PATH"; then
  echo "Certificate already exists — skipping SSL generation."

  write_https_config

  echo "Redeploying updated app stack..."
  docker compose down --remove-orphans || true
  docker rm -f nginx node-app mongodb mongo-init 2>/dev/null || true

  docker compose up -d --build --remove-orphans

  sleep 5
  docker compose exec nginx nginx -s reload || true

  echo ""
  echo "=== Redeploy complete! ==="
  echo "=== https://$DOMAIN is live ==="
  exit 0
fi

# ─────────────────────────────────────────────────────────────
# CASE 2: First time — generate SSL certificate
# ─────────────────────────────────────────────────────────────
echo "No certificate found — starting first-time SSL setup..."

# Write a temporary HTTP-only nginx config for ACME challenge
cat > ./nginx/conf.d/app.conf << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINXEOF

echo "Temporary HTTP nginx config written."

# Tear down any existing containers + force remove named containers
docker compose down --remove-orphans || true
docker rm -f nginx node-app mongodb mongo-init 2>/dev/null || true

# Start nginx only
docker compose up -d --no-deps nginx
echo "Waiting for nginx to be ready..."
sleep 8

# Confirm nginx started
if ! docker ps --format '{{.Names}}' | grep -q '^nginx$'; then
  echo "ERROR: nginx failed to start!"
  docker logs nginx
  exit 1
fi

echo "nginx is up — verifying port 80..."
curl -sf http://localhost:80 > /dev/null && echo "port 80 OK" || { echo "ERROR: port 80 not responding"; exit 1; }

# Request certificate from Let's Encrypt
echo "Requesting certificate from Let's Encrypt..."
docker run --rm \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# Fix ownership
chown -R root:root ./certbot
chmod -R 755 ./certbot
sleep 2

# Verify certificate was actually created
if ! test -f "$CERT_PATH"; then
  echo "ERROR: Certificate not found at $CERT_PATH after certbot run!"
  ls -la ./certbot/conf/live/ 2>/dev/null || echo "live/ folder does not exist"
  docker logs nginx
  exit 1
fi

echo "Certificate obtained successfully!"

# Write the real HTTPS reverse-proxy config now that certs exist
write_https_config
echo "HTTPS nginx config written."

# Stop temporary nginx cleanly
docker compose down --remove-orphans || true
docker rm -f nginx node-app mongodb mongo-init 2>/dev/null || true

# Start the full stack
echo "Starting full application stack..."
docker compose up -d --build --remove-orphans

echo "Waiting for services to be ready..."
sleep 10

# Reload nginx with HTTPS config
docker compose exec nginx nginx -s reload || true

echo ""
echo "=== SSL setup complete! ==="
echo "=== https://$DOMAIN is now live! ==="