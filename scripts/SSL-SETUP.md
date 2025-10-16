# SSL Setup Guide for Portal

This guide explains how to set up HTTPS with Let's Encrypt SSL certificates for portal.hotosm.org.

## Prerequisites

- SSH access to EC2 server
- Port 80 and 443 open in security group
- Domain `portal.hotosm.org` pointing to the EC2 server

## Setup Instructions

### 1. Commit and Deploy Configuration Changes

First, push the SSL configuration to GitHub:

```bash
# On local machine
git add .
git commit -m "Add SSL/HTTPS support with Let's Encrypt"
git push origin develop
```

### 2. SSH into EC2 Server

```bash
ssh user@portal.hotosm.org
```

### 3. Run SSL Setup Script

```bash
# Navigate to portal directory
cd /opt/portal

# Pull latest changes
git pull origin develop

# Run SSL setup script as root
sudo bash scripts/setup-ssl.sh
```

The script will:
- ✅ Install certbot
- ✅ Create necessary directories
- ✅ Stop frontend container temporarily
- ✅ Obtain SSL certificate from Let's Encrypt
- ✅ Set up automatic renewal (cron job)
- ✅ Test renewal process

### 4. Restart Services with SSL

After the script completes successfully:

```bash
cd /opt/portal
docker compose --profile prod up -d --force-recreate
```

### 5. Verify HTTPS

Visit https://portal.hotosm.org in your browser. You should see:
- 🔒 Secure padlock icon
- Valid SSL certificate
- Automatic redirect from HTTP to HTTPS

## Certificate Renewal

Certificates are automatically renewed every 90 days via cron job at 3 AM daily.

To manually renew:

```bash
sudo certbot renew
```

To test renewal (dry run):

```bash
sudo certbot renew --dry-run
```

## Troubleshooting

### Port 80/443 not accessible

Check AWS Security Group allows inbound traffic on ports 80 and 443:

```bash
# From local machine
aws ec2 describe-security-groups --group-ids <your-sg-id>
```

### Certificate not found

Verify certificate was created:

```bash
sudo ls -la /etc/letsencrypt/live/portal.hotosm.org/
```

Should show:
- `fullchain.pem`
- `privkey.pem`
- `chain.pem`
- `cert.pem`

### Nginx fails to start

Check nginx logs:

```bash
docker compose --profile prod logs frontend
```

### Force certificate regeneration

If you need to regenerate:

```bash
sudo certbot delete --cert-name portal.hotosm.org
sudo bash scripts/setup-ssl.sh
```

## Files Changed

- `frontend/nginx-ssl.conf` - New nginx config with SSL support
- `docker-compose.yml` - Updated to mount certificates and expose port 443
- `scripts/setup-ssl.sh` - Automated SSL setup script

## Architecture

```
Internet (Port 443)
    ↓
AWS Security Group (Allow 80, 443)
    ↓
EC2 Instance
    ↓
Docker Container (portal-frontend)
    ↓
Nginx with SSL
    - Serves static files
    - Proxies /api to backend
    - Redirects HTTP → HTTPS
```

## Certificate Locations

- **Certificates**: `/etc/letsencrypt/live/portal.hotosm.org/`
- **Renewal Config**: `/etc/letsencrypt/renewal/portal.hotosm.org.conf`
- **Certbot Webroot**: `/var/www/certbot`
- **Logs**: `/var/log/letsencrypt/`

## Security Notes

- Certificates are mounted read-only in the container
- HSTS header enabled (Strict-Transport-Security)
- Modern TLS protocols only (TLSv1.2, TLSv1.3)
- Strong cipher suites configured
- Automatic HTTP → HTTPS redirect

## Support

For issues, check:
1. Docker logs: `docker compose logs frontend`
2. Nginx error log: `docker compose exec frontend cat /var/log/nginx/error.log`
3. Certbot logs: `sudo cat /var/log/letsencrypt/letsencrypt.log`
