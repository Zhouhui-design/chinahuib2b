# Deployment Guide - Global Expo Network

## Pre-Deployment Checklist

### 1. Environment Setup on DigitalOcean Server

```bash
# Install required software
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs postgresql-16 redis-server nginx pm2 git build-essential

# Start services
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 2. Database Setup

```bash
# Create production database
sudo -u postgres psql
CREATE DATABASE global_expo_prod;
CREATE USER expo_prod WITH PASSWORD 'strong-production-password';
GRANT ALL PRIVILEGES ON DATABASE global_expo_prod TO expo_prod;
ALTER USER expo_prod CREATEDB;
\q

# Grant schema permissions
sudo -u postgres psql -d global_expo_prod
GRANT ALL ON SCHEMA public TO expo_prod;
\q
```

### 3. Clone Repository

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone <your-repository-url> global-expo
cd global-expo
sudo chown -R $USER:$USER .
```

### 4. Environment Configuration

Create `.env.production`:

```bash
cp .env.local .env.production
nano .env.production
```

Update with production values:

```env
# Database
DATABASE_URL="postgresql://expo_prod:strong-production-password@localhost:5432/global_expo_prod"

# Redis
REDIS_URL="redis://localhost:6379"

# DigitalOcean Spaces (Get from DigitalOcean Control Panel)
DO_SPACES_ENDPOINT="https://sgp1.digitaloceanspaces.com"
DO_SPACES_BUCKET="global-expo-storage"
DO_SPACES_ACCESS_KEY="your-spaces-access-key"
DO_SPACES_SECRET_KEY="your-spaces-secret-key"

# NextAuth (Generate strong random string)
NEXTAUTH_URL="https://chinahuib2b.top"
NEXTAUTH_SECRET="generate-a-strong-random-string-here-use-openssl-rand-base64-32"

# Chat System
NEXT_PUBLIC_CHAT_API_URL="https://chat.chinahuib2b.top"
NEXT_PUBLIC_CHAT_WS_URL="wss://chat.chinahuib2b.top/ws"
CHAT_SYSTEM_JWT_SECRET="same-as-NEXTAUTH_SECRET"

# Subscription
STRIPE_SECRET_KEY="sk_live_your-stripe-key"
SUBSCRIPTION_PRICE=10
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 5. Install Dependencies & Build

```bash
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
```

### 6. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'nextjs-app',
      cwd: '/var/www/global-expo',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 2, // Use 2 instances for better performance
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/pm2/nextjs-error.log',
      out_file: '/var/log/pm2/nextjs-out.log',
    },
    {
      name: 'chat-system',
      cwd: '/var/www/chat-system',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        JWT_SECRET: 'same-as-NEXTAUTH_SECRET-above',
        MONGODB_URI: 'mongodb://localhost:27017/chat_system',
      },
      autorestart: true,
      watch: false,
    }
  ]
}
```

Start PM2:

```bash
mkdir -p /var/log/pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Nginx Configuration

Create `/etc/nginx/sites-available/chinahuib2b.top`:

```nginx
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name chinahuib2b.top www.chinahuib2b.top;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name chinahuib2b.top www.chinahuib2b.top;

    # SSL Certificate (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/chinahuib2b.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chinahuib2b.top/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Next.js App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket for Chat System
    location /ws {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Chat API
    location /api/chat {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/chinahuib2b.top /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### 9. DigitalOcean Spaces Setup

1. Go to DigitalOcean Control Panel → Spaces
2. Create new Space: `global-expo-storage` in Singapore region
3. Set CORS configuration:
   ```json
   [
     {
       "AllowedOrigins": ["https://chinahuib2b.top"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. Generate Access Key and Secret Key
5. Add keys to `.env.production`

### 10. Chat System Setup

The chat system should already be deployed at `/var/www/chat-system`. Ensure:

1. MongoDB is installed and running
2. Chat system environment variables are set
3. JWT_SECRET matches NEXTAUTH_SECRET
4. PM2 process is running

```bash
cd /var/www/chat-system
npm install --production
pm2 start chat-system  # Or use ecosystem.config.js
```

## Deployment Script

Create `deploy.sh` in project root:

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📦 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📥 Installing dependencies..."
npm install --production

# Run database migrations
echo "🗄️  Running migrations..."
npx prisma migrate deploy

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart nextjs-app

echo "✅ Deployment complete!"
echo "🌐 Visit: https://chinahuib2b.top"
```

Make it executable:

```bash
chmod +x deploy.sh
```

Deploy with:

```bash
./deploy.sh
```

## Post-Deployment Verification

### 1. Check Services

```bash
# Check PM2 processes
pm2 status

# Check logs
pm2 logs nextjs-app --lines 50

# Check Nginx
sudo systemctl status nginx

# Check databases
sudo systemctl status postgresql
sudo systemctl status redis-server
```

### 2. Test Website

Visit https://chinahuib2b.top and test:

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Products are displayed
- [ ] Images load properly
- [ ] HTTPS is working (green lock icon)

### 3. Test Core Features

- [ ] Register as seller
- [ ] Login as seller
- [ ] Browse products as buyer
- [ ] Download brochure (if available)
- [ ] View contact info (requires login)

### 4. Monitor Resources

```bash
# Check server resources
htop
df -h
free -m

# Check PM2 memory usage
pm2 monit
```

## Backup Strategy

### Database Backup

Create `/usr/local/bin/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U expo_prod global_expo_prod > "$BACKUP_DIR/db_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete

echo "Database backup completed: db_$DATE.sql"
```

```bash
chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### File Backup

DigitalOcean Spaces already provides redundancy. For additional safety:

```bash
# Weekly full backup
0 3 * * 0 tar czf /backups/full_$(date +\%Y\%m\%d).tar.gz /var/www/global-expo/.next /var/www/global-expo/public
```

## Monitoring & Maintenance

### 1. Log Rotation

PM2 handles log rotation automatically. Configure if needed:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. Security Updates

```bash
# Weekly security updates
sudo apt update && sudo apt upgrade -y
sudo systemctl restart nginx
```

### 3. Performance Monitoring

Consider setting up:
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry)
- Analytics (Google Analytics, Plausible)

## Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs nextjs-app --err

# Check if port is in use
sudo lsof -i :3000

# Check environment variables
cat .env.production
```

### Database Connection Issues

```bash
# Test database connection
psql -U expo_prod -d global_expo_prod -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew manually
sudo certbot renew
```

## Scaling Considerations

When traffic increases:

1. **Vertical Scaling**: Upgrade DigitalOcean droplet (more CPU/RAM)
2. **Horizontal Scaling**: Add more PM2 instances or servers
3. **Database**: Enable connection pooling, add read replicas
4. **CDN**: Use Cloudflare for static assets
5. **Caching**: Implement Redis caching for product lists
6. **Load Balancer**: Add DigitalOcean Load Balancer

## Support Contacts

- **Server Issues**: Check DigitalOcean status page
- **Application Bugs**: Review PM2 logs
- **Database Issues**: Check PostgreSQL logs
- **SSL Issues**: Check Let's Encrypt logs

---

**Last Updated**: 2026-04-24  
**Version**: 1.0  
**Domain**: chinahuib2b.top
