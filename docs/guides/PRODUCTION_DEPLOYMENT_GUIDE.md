# 🚀 PRODUCTION DEPLOYMENT GUIDE - chinahuib2b.top

## Overview

This guide covers complete deployment of the B2B Exhibition Platform to DigitalOcean Ubuntu 22.04 server with:
- Next.js application (PM2)
- PostgreSQL database
- Redis cache
- Nginx reverse proxy with SSL
- DigitalOcean Spaces for file storage
- Automated backups

---

## 📋 Prerequisites

### DigitalOcean Account Setup
1. Create DigitalOcean account
2. Create a new Droplet:
   - **Region**: Singapore (sgp1)
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic (4GB RAM, 2 CPUs) - $24/month
   - **Authentication**: SSH key (recommended) or password
3. Create DigitalOcean Spaces:
   - **Region**: Singapore (sgp1)
   - **Name**: chinahuib2b-storage
   - Enable CDN (optional but recommended)
4. Generate Spaces API keys:
   - Access Key ID
   - Secret Access Key

### Domain Configuration
1. Point `chinahuib2b.top` to your Droplet IP:
   ```
   A record: chinahuib2b.top → YOUR_DROPLET_IP
   A record: www.chinahuib2b.top → YOUR_DROPLET_IP
   ```

---

## 🔧 Step-by-Step Deployment

### Step 1: Connect to Server

```bash
ssh root@YOUR_DROPLET_IP
```

### Step 2: Update System & Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required software
sudo apt install -y \
  curl \
  git \
  postgresql \
  postgresql-contrib \
  redis-server \
  nginx \
  certbot \
  python3-certbot-nginx \
  ufw \
  fail2ban

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version    # Should be v20.x
npm --version     # Should be 10.x
psql --version    # Should be 14+
redis-cli --version
nginx -v
```

### Step 3: Install PM2 Globally

```bash
sudo npm install -g pm2
pm2 --version
```

### Step 4: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verify rules
sudo ufw status
```

### Step 5: Setup PostgreSQL Database

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE chinahuib2b;
CREATE USER expo_user WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE chinahuib2b TO expo_user;
ALTER DATABASE chinahuib2b OWNER TO expo_user;
\q
EOF

# Test connection
psql "postgresql://expo_user:STRONG_PASSWORD_HERE@localhost:5432/chinahuib2b"
```

### Step 6: Setup Redis

```bash
# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping  # Should return PONG

# Set Redis password (optional but recommended)
sudo nano /etc/redis/redis.conf
# Find: # requirepass foobared
# Change to: requirepass YOUR_REDIS_PASSWORD
# Save and restart
sudo systemctl restart redis-server
```

### Step 7: Clone Repository & Install Dependencies

```bash
# Create application directory
sudo mkdir -p /var/www
cd /var/www

# Remove old code if exists
sudo rm -rf chinahuib2b

# Clone repository
sudo git clone https://github.com/YOUR_USERNAME/chinahuib2b.git
cd chinahuib2b

# Install dependencies
npm install

# Build application
npm run build
```

### Step 8: Configure Environment Variables

```bash
# Create production environment file
sudo nano .env.production
```

Paste the following content (replace placeholders):

```bash
# ============================================
# Database Configuration
# ============================================
DATABASE_URL="postgresql://expo_user:STRONG_PASSWORD_HERE@localhost:5432/chinahuib2b"

# ============================================
# Redis Configuration
# ============================================
REDIS_URL="redis://:YOUR_REDIS_PASSWORD@localhost:6379"

# ============================================
# NextAuth Authentication
# ============================================
NEXTAUTH_URL="https://chinahuib2b.top"
NEXTAUTH_SECRET="RUN: openssl rand -base64 32 AND PASTE HERE"

# ============================================
# DigitalOcean Spaces Storage
# ============================================
DO_SPACES_ENDPOINT="https://sgp1.digitaloceanspaces.com"
DO_SPACES_BUCKET="chinahuib2b-storage"
DO_SPACES_ACCESS_KEY="YOUR_SPACES_ACCESS_KEY"
DO_SPACES_SECRET_KEY="YOUR_SPACES_SECRET_KEY"
DO_SPACES_REGION="sgp1"

# ============================================
# Chat System WebSocket Configuration
# ============================================
NEXT_PUBLIC_CHAT_API_URL="https://chinahuib2b.top/api/chat"
NEXT_PUBLIC_CHAT_WS_URL="wss://chinahuib2b.top/ws"

# ============================================
# Other Configuration
# ============================================
NODE_ENV="production"
PORT="3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Save the file (Ctrl+X, Y, Enter).

### Step 9: Run Database Migrations

```bash
# Apply Prisma migrations
npx prisma migrate deploy

# (Optional) Seed test data
# npx prisma db seed
```

### Step 10: Configure PM2

Create PM2 ecosystem config:

```bash
sudo nano ecosystem.config.js
```

Paste:

```javascript
module.exports = {
  apps: [
    {
      name: 'chinahuib2b-next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/chinahuib2b',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/chinahuib2b-error.log',
      out_file: '/var/log/pm2/chinahuib2b-out.log',
      log_file: '/var/log/pm2/chinahuib2b-combined.log',
      time: true,
    },
  ],
};
```

Create log directory:

```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

Start application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Copy and run the command that PM2 outputs
```

### Step 11: Configure Nginx

Create Nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/chinahuib2b
```

Paste:

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name chinahuib2b.top www.chinahuib2b.top;
    return 301 https://$server_name$request_uri;
}

# HTTPS main configuration
server {
    listen 443 ssl http2;
    server_name chinahuib2b.top www.chinahuib2b.top;

    # SSL certificate (will be configured by Certbot)
    ssl_certificate     /etc/letsencrypt/live/chinahuib2b.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chinahuib2b.top/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/chinahuib2b-access.log;
    error_log  /var/log/nginx/chinahuib2b-error.log;

    # Client max upload size (for PDF brochures)
    client_max_body_size 25M;

    # WebSocket support
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    # Reverse proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2|woff|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/chinahuib2b /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### Step 12: Setup SSL with Let's Encrypt

```bash
sudo certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect option (2: Redirect all traffic to HTTPS)
```

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

### Step 13: Setup Automated Backups

Create backup script:

```bash
sudo nano /opt/backup-chinahuib2b.sh
```

Paste:

```bash
#!/bin/bash
# Daily backup of database

BACKUP_DIR="/backups/chinahuib2b"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="chinahuib2b"
DB_USER="expo_user"
DB_PASS="STRONG_PASSWORD_HERE"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
PGPASSWORD=$DB_PASS pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Keep last 30 days of backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_$DATE.sql.gz"
```

Make executable and setup cron:

```bash
sudo chmod +x /opt/backup-chinahuib2b.sh
sudo crontab -e
```

Add this line:

```
0 2 * * * /opt/backup-chinahuib2b.sh >> /var/log/backup.log 2>&1
```

---

## ✅ Post-Deployment Verification

### 1. Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs chinahuib2b-next

# Check if running on port 3000
sudo lsof -i :3000
```

### 2. Test Website Access

```bash
# Test HTTP redirect
curl -I http://chinahuib2b.top

# Test HTTPS
curl -I https://chinahuib2b.top
```

Open browser and visit: `https://chinahuib2b.top`

### 3. Test Core Features

#### Authentication
- [ ] Register new account
- [ ] Login with existing account
- [ ] Logout works correctly

#### Seller Features
- [ ] Login as seller: `seller1@test.com` / `password123`
- [ ] Visit `/seller/products` - products list displays
- [ ] Click "Add Product" - form loads
- [ ] Upload product images - FileUpload works
- [ ] Submit product - saves successfully
- [ ] Visit `/seller/store` - profile editor loads
- [ ] Upload logo/banner - images save
- [ ] Visit `/seller/brochures` - brochure manager loads
- [ ] Upload PDF brochure - file uploads and lists

#### Buyer Features
- [ ] Browse home page - products display
- [ ] View product detail - images carousel works
- [ ] View store page - company info displays
- [ ] Download brochure - PDF downloads
- [ ] Chat widget appears - can initiate chat

### 4. Check Logs for Errors

```bash
# PM2 logs
pm2 logs chinahuib2b-next --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/chinahuib2b-error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 5. Monitor Resources

```bash
# CPU and Memory
htop

# Disk space
df -h

# Database connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname='chinahuib2b';"
```

---

## 🔧 Maintenance Commands

### Restart Application

```bash
pm2 restart chinahuib2b-next
```

### Reload After Code Update

```bash
cd /var/www/chinahuib2b
git pull
npm install
npm run build
pm2 restart chinahuib2b-next
```

### View Real-time Logs

```bash
pm2 logs chinahuib2b-next --lines 50
```

### Database Backup (Manual)

```bash
/opt/backup-chinahuib2b.sh
```

### Check SSL Certificate Expiry

```bash
sudo certbot certificates
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs chinahuib2b-next

# Check environment variables
cat /var/www/chinahuib2b/.env.production

# Test database connection
npx prisma db pull
```

### 502 Bad Gateway

```bash
# Check if PM2 is running
pm2 status

# Check if port 3000 is listening
sudo lsof -i :3000

# Restart PM2
pm2 restart chinahuib2b-next

# Check Nginx config
sudo nginx -t
sudo systemctl status nginx
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql "postgresql://expo_user:PASSWORD@localhost:5432/chinahuib2b"

# Check DATABASE_URL in .env.production
```

### File Upload Fails

```bash
# Check DigitalOcean Spaces credentials
# Verify bucket exists and is accessible
# Check DO_SPACES_* variables in .env.production

# Test S3 connection manually
node -e "
const { S3Client } = require('@aws-sdk/client-s3');
const client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
  }
});
console.log('S3 client created successfully');
"
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates

# Verify Nginx SSL config
sudo nginx -t
```

---

## 📊 Monitoring Setup (Optional)

### PM2 Monitoring Dashboard

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Uptime Monitoring

Use external services like:
- UptimeRobot (free)
- Pingdom
- Better Stack

Monitor: `https://chinahuib2b.top/api/health` (if you create health endpoint)

---

## 🎯 Next Steps After Deployment

1. **Invite Beta Testers**
   - Share login credentials with 5-10 sellers
   - Collect feedback on usability
   - Monitor error logs daily

2. **Add Search/Filters** (Priority: Medium)
   - Implement category filtering
   - Add country filter
   - Keyword search

3. **Integrate Stripe** (Priority: Low)
   - Create subscription plans
   - Setup webhook handling
   - Test payment flow

4. **Marketing Tools** (Priority: Low)
   - Social proof popups
   - Email collection forms
   - Abandoned cart recovery

---

## 📞 Support & Resources

- **DigitalOcean Docs**: https://docs.digitalocean.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Guide**: https://nginx.org/en/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## ✨ Success Checklist

- [ ] Server provisioned on DigitalOcean Singapore
- [ ] All dependencies installed
- [ ] Database created and migrated
- [ ] Application built and running via PM2
- [ ] Nginx configured with SSL
- [ ] Domain points to server IP
- [ ] HTTPS working correctly
- [ ] All core features tested
- [ ] Automated backups configured
- [ ] Monitoring in place
- [ ] Beta testers invited

**Congratulations! Your B2B Exhibition Platform is now LIVE!** 🎉

---

**Last Updated**: 2026-04-24  
**Version**: 1.0  
**Platform**: chinahuib2b.top
