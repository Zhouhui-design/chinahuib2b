# 🚀 Quick Start: Deploy to chinahuib2b.top

## Your Server Details
- **IP Address**: 139.59.108.156
- **OS**: Ubuntu 24.04.4 LTS
- **RAM**: 4GB
- **Disk**: 77GB (55GB free)
- **Node.js**: v22.22.2 ✓
- **SSH Access**: Passwordless ✓

---

## Step 1: Create DigitalOcean Spaces (Do This First!)

### Via Web Browser:

1. **Login to DigitalOcean**
   ```
   https://cloud.digitalocean.com/
   ```

2. **Create Space**
   - Go to: https://cloud.digitalocean.com/spaces
   - Click "Create a Space"
   - Fill in:
     - **Name**: `chinahuib2b-storage`
     - **Region**: Singapore (SGP1) ← Important!
     - **CDN**: Enable (recommended)
   - Click "Create Space"

3. **Generate API Keys**
   - In Spaces page, click "API" or "Manage Keys"
   - Click "Generate New Key"
   - Name: `chinahuib2b-spaces-key`
   - **Copy and save**:
     - Access Key ID (e.g., `DO00XXXXXXXXXXXXXX`)
     - Secret Access Key (long string)
   - ⚠️ You won't see the secret key again!

4. **Configure CORS**
   - In your Space settings, find "CORS Configuration"
   - Add:
   ```json
   [
     {
       "AllowedOrigins": ["https://chinahuib2b.top", "http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

---

## Step 2: Prepare Your Server

### Upload deployment files to server:

From your local machine:

```bash
cd ~/projects/chinahuib2b

# Upload preparation script
scp deploy-prepare-server.sh root@139.59.108.156:/root/

# Upload configuration files
scp .env.production.example root@139.59.108.156:/root/
scp ecosystem.config.js root@139.59.108.156:/root/
scp nginx-chinahuib2b.conf root@139.59.108.156:/root/
scp backup-script.sh root@139.59.108.156:/root/
```

### SSH into server and run preparation:

```bash
ssh root@139.59.108.156

# Make script executable
chmod +x /root/deploy-prepare-server.sh

# Run preparation (this will take 5-10 minutes)
/root/deploy-prepare-server.sh
```

The script will:
- ✅ Update system packages
- ✅ Install PostgreSQL, Redis, Nginx
- ✅ Configure firewall
- ✅ Setup database and user
- ✅ Configure Redis with password
- ✅ Create directories
- ✅ Install PM2

---

## Step 3: Clone Repository & Build

After preparation script completes:

```bash
# Still on server
cd /var/www

# Clone your repository (replace with your actual repo URL)
git clone YOUR_GITHUB_REPO_URL
cd chinahuib2b

# Install dependencies
npm install

# Build application
npm run build
```

---

## Step 4: Configure Environment Variables

```bash
# Copy example file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

**Update these values:**

```bash
# Database (use the password you set or change it)
DATABASE_URL="postgresql://expo_user:YOUR_DB_PASSWORD@localhost:5432/chinahuib2b"

# Redis (use the password from redis.conf)
REDIS_URL="redis://:YOUR_REDIS_PASSWORD@localhost:6379"

# NextAuth (generate new secret)
NEXTAUTH_SECRET="RUN: openssl rand -base64 32 AND PASTE HERE"

# DigitalOcean Spaces (from Step 1)
DO_SPACES_ACCESS_KEY="YOUR_ACTUAL_ACCESS_KEY"
DO_SPACES_SECRET_KEY="YOUR_ACTUAL_SECRET_KEY"

# Everything else stays the same
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# Copy the output and paste it in .env.production
```

Save file: `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Run Database Migrations

```bash
npx prisma migrate deploy
```

This creates all database tables.

---

## Step 6: Start Application with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command that PM2 outputs

# Verify it's running
pm2 status
pm2 logs chinahuib2b-next
```

---

## Step 7: Configure Nginx

```bash
# Copy Nginx config
cp /root/nginx-chinahuib2b.conf /etc/nginx/sites-available/chinahuib2b

# Enable site
ln -s /etc/nginx/sites-available/chinahuib2b /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## Step 8: Setup SSL with Let's Encrypt

```bash
# Get SSL certificate
certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top

# Follow prompts:
# - Enter your email
# - Agree to terms (A)
# - Choose redirect option (2: Redirect to HTTPS)

# Test auto-renewal
certbot renew --dry-run
```

---

## Step 9: Setup Automated Backups

```bash
# Copy backup script
cp /root/backup-script.sh /opt/backup-chinahuib2b.sh

# Edit with your database password
nano /opt/backup-chinahuib2b.sh
# Update DB_PASS="YOUR_ACTUAL_DB_PASSWORD"

# Make executable
chmod +x /opt/backup-chinahuib2b.sh

# Add cron job (runs daily at 2 AM)
crontab -e
# Add this line at the end:
0 2 * * * /opt/backup-chinahuib2b.sh >> /var/log/backup.log 2>&1
```

---

## Step 10: Test Everything

### Open browser and test:

1. **Visit**: http://chinahuib2b.top
   - Should redirect to HTTPS
   - Site should load

2. **Test Seller Login**:
   - Email: `seller1@test.com`
   - Password: `password123`
   - Visit `/seller/products`
   - Try adding a product with image upload

3. **Test Store Profile**:
   - Visit `/seller/store`
   - Upload logo and banner

4. **Test Brochures**:
   - Visit `/seller/brochures`
   - Upload a PDF

5. **Test Buyer View**:
   - Logout
   - Browse home page
   - View product details
   - Download brochure

---

## Troubleshooting

### If site doesn't load:

```bash
# Check if PM2 is running
pm2 status

# Check logs
pm2 logs chinahuib2b-next

# Check if port 3000 is listening
lsof -i :3000

# Restart PM2
pm2 restart chinahuib2b-next
```

### If you get 502 Bad Gateway:

```bash
# Check Nginx
systemctl status nginx
nginx -t

# Check if app is running
pm2 status

# Check Nginx error log
tail -f /var/log/nginx/chinahuib2b-error.log
```

### If file uploads fail:

```bash
# Check .env.production has correct Spaces credentials
cat .env.production | grep DO_SPACES

# Verify bucket exists in DigitalOcean control panel
# Check CORS configuration is set correctly
```

---

## Quick Reference Commands

```bash
# View application logs
pm2 logs chinahuib2b-next

# Restart application
pm2 restart chinahuib2b-next

# Check server resources
htop
df -h
free -h

# Manual database backup
/opt/backup-chinahuib2b.sh

# Check SSL certificate
certbot certificates

# View Nginx access logs
tail -f /var/log/nginx/chinahuib2b-access.log
```

---

## After Deployment

1. **Monitor logs** for first 24 hours
2. **Invite beta testers** (5-10 sellers)
3. **Collect feedback**
4. **Plan next features** (search/filters, payments)

---

## Need Help?

- Check `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed troubleshooting
- Review `DEPLOYMENT_CHECKLIST.md` for step-by-step verification
- All configuration files are in your project root

---

**Good luck with your deployment!** 🚀

If you encounter any issues, check the logs first, then refer to the comprehensive deployment guide.
