#!/bin/bash
set -e

echo "=========================================="
echo "Setup SSL Certificate with Let's Encrypt"
echo "=========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Error: This script must be run as root or with sudo"
    exit 1
fi

# Install certbot if not already installed
echo "📦 Installing certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get update
    apt-get install -y certbot
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi

# Create certbot webroot directory
echo ""
echo "📁 Creating certbot webroot directory..."
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot
echo "✅ Webroot directory created"

# Stop any service using port 80 temporarily
echo ""
echo "🛑 Stopping frontend container temporarily..."
cd /opt/portal
docker compose --profile prod stop frontend || true

# Obtain SSL certificate
echo ""
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
echo "This will verify domain ownership via HTTP challenge"
echo ""

certbot certonly \
    --standalone \
    --preferred-challenges http \
    --email admin@hotosm.org \
    --agree-tos \
    --no-eff-email \
    --domain portal.hotosm.org \
    --non-interactive

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate obtained successfully!"
    echo ""
    echo "Certificate location: /etc/letsencrypt/live/portal.hotosm.org/"
    echo "  - fullchain.pem (certificate)"
    echo "  - privkey.pem (private key)"
else
    echo ""
    echo "❌ Failed to obtain SSL certificate"
    exit 1
fi

# Set up automatic renewal
echo ""
echo "⏰ Setting up automatic certificate renewal..."

# Create renewal hook script
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/bash
# Reload nginx in Docker container after certificate renewal
cd /opt/portal
docker compose --profile prod exec frontend nginx -s reload
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# Test renewal (dry run)
echo ""
echo "🧪 Testing certificate renewal (dry run)..."
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo "✅ Renewal test successful!"
else
    echo "⚠️  Renewal test failed, but certificate was obtained"
fi

# Add cron job for renewal if not exists
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    echo ""
    echo "📅 Adding cron job for automatic renewal..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'cd /opt/portal && docker compose --profile prod exec frontend nginx -s reload'") | crontab -
    echo "✅ Cron job added (runs daily at 3 AM)"
fi

echo ""
echo "=========================================="
echo "✅ SSL Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Pull latest changes: cd /opt/portal && git pull origin develop"
echo "2. Restart services: docker compose --profile prod up -d --force-recreate"
echo "3. Visit: https://portal.hotosm.org"
echo ""
echo "Certificate will auto-renew every 90 days."
echo "=========================================="
