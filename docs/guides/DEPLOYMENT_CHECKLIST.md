# 🚀 DEPLOYMENT CHECKLIST - chinahuib2b.top

## Pre-Deployment Preparation

### On Your Local Machine
- [ ] Review PRODUCTION_DEPLOYMENT_GUIDE.md completely
- [ ] Have DigitalOcean account ready
- [ ] Create DigitalOcean Spaces bucket (chinahuib2b-storage)
- [ ] Generate Spaces API keys
- [ ] Point domain DNS to server IP (A records)
- [ ] Prepare strong passwords for database and Redis

---

## Server Setup (SSH into server)

### 1. Initial Server Setup
```bash
ssh root@YOUR_DROPLET_IP
```

- [ ] Update system: `sudo apt update && sudo apt upgrade -y`
- [ ] Install dependencies (Node.js, PostgreSQL, Redis, Nginx, etc.)
- [ ] Configure firewall (UFW): Allow SSH, HTTP, HTTPS
- [ ] Install PM2 globally: `sudo npm install -g pm2`

### 2. Database Setup
- [ ] Start PostgreSQL: `sudo systemctl start postgresql`
- [ ] Create database: `CREATE DATABASE chinahuib2b;`
- [ ] Create user: `CREATE USER expo_user WITH PASSWORD 'STRONG_PASSWORD';`
- [ ] Grant privileges
- [ ] Test connection

### 3. Redis Setup
- [ ] Start Redis: `sudo systemctl start redis-server`
- [ ] Set password in /etc/redis/redis.conf
- [ ] Restart Redis
- [ ] Test: `redis-cli ping`

### 4. Clone & Build Application
- [ ] Navigate to /var/www
- [ ] Remove old code if exists: `sudo rm -rf chinahuib2b`
- [ ] Clone repository: `git clone YOUR_REPO_URL`
- [ ] Install dependencies: `npm install`
- [ ] Build application: `npm run build`

### 5. Configure Environment
- [ ] Copy .env.production.example to .env.production
- [ ] Edit .env.production with actual values:
  - [ ] DATABASE_URL (with correct password)
  - [ ] REDIS_URL (with correct password)
  - [ ] NEXTAUTH_SECRET (generate with openssl rand -base64 32)
  - [ ] DO_SPACES_ACCESS_KEY
  - [ ] DO_SPACES_SECRET_KEY
- [ ] Run migrations: `npx prisma migrate deploy`

### 6. Start Application with PM2
- [ ] Create log directory: `sudo mkdir -p /var/log/pm2`
- [ ] Start PM2: `pm2 start ecosystem.config.js`
- [ ] Save PM2 config: `pm2 save`
- [ ] Setup PM2 startup: `pm2 startup` (copy and run command)
- [ ] Verify running: `pm2 status`

### 7. Configure Nginx
- [ ] Copy nginx-chinahuib2b.conf to /etc/nginx/sites-available/chinahuib2b
- [ ] Enable site: `sudo ln -s /etc/nginx/sites-available/chinahuib2b /etc/nginx/sites-enabled/`
- [ ] Remove default site: `sudo rm /etc/nginx/sites-enabled/default`
- [ ] Test config: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`

### 8. Setup SSL
- [ ] Run Certbot: `sudo certbot --nginx -d chinahuib2b.top -d www.chinahuib2b.top`
- [ ] Follow prompts (email, agree terms, redirect to HTTPS)
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`

### 9. Setup Backups
- [ ] Copy backup-script.sh to /opt/backup-chinahuib2b.sh
- [ ] Edit with correct database password
- [ ] Make executable: `sudo chmod +x /opt/backup-chinahuib2b.sh`
- [ ] Add cron job: `sudo crontab -e`
- [ ] Add line: `0 2 * * * /opt/backup-chinahuib2b.sh >> /var/log/backup.log 2>&1`

---

## Post-Deployment Testing

### Basic Connectivity
- [ ] Visit http://chinahuib2b.top → redirects to HTTPS
- [ ] Visit https://chinahuib2b.top → site loads
- [ ] Check SSL certificate in browser (green lock)

### Authentication
- [ ] Register new account
- [ ] Login with test seller: seller1@test.com / password123
- [ ] Logout works

### Seller Dashboard
- [ ] Visit /seller/products → list displays
- [ ] Click "Add Product" → form loads
- [ ] Upload product image → FileUpload works
- [ ] Submit product → saves successfully
- [ ] Visit /seller/store → profile editor loads
- [ ] Upload logo → saves correctly
- [ ] Upload banner → saves correctly
- [ ] Visit /seller/brochures → manager loads
- [ ] Upload PDF brochure → uploads and lists
- [ ] Delete brochure → removes from list

### Buyer Experience
- [ ] Browse home page → products display
- [ ] Click product → detail page loads
- [ ] Image carousel works
- [ ] View store page → company info shows
- [ ] Download brochure → PDF downloads
- [ ] Chat widget appears

### Performance
- [ ] Page load time < 3 seconds
- [ ] No console errors in browser
- [ ] Images load properly
- [ ] WebSocket connects (check browser console)

### Logs & Monitoring
- [ ] Check PM2 logs: `pm2 logs chinahuib2b-next`
- [ ] Check Nginx error log: `sudo tail /var/log/nginx/chinahuib2b-error.log`
- [ ] Check resource usage: `htop`, `df -h`, `free -h`

---

## Cleanup Old Code (Important!)

Since you mentioned there's old residual code on the domain:

- [ ] Verify all old files removed from /var/www/chinahuib2b
- [ ] Check that only new code is deployed
- [ ] Test that old URLs/routes don't work
- [ ] Verify database is fresh (no old data conflicts)

---

## Final Verification

- [ ] All core features working
- [ ] No critical errors in logs
- [ ] SSL certificate valid
- [ ] Automated backups configured
- [ ] PM2 auto-start configured
- [ ] Domain DNS propagated
- [ ] Mobile responsive design works
- [ ] Multi-language switcher works

---

## Go Live! 🎉

- [ ] Announce launch to beta testers
- [ ] Monitor logs closely first 24 hours
- [ ] Collect user feedback
- [ ] Plan next iteration (search/filters, payments)

---

## Emergency Contacts & Resources

**If something breaks:**
1. Check PM2 logs: `pm2 logs chinahuib2b-next`
2. Restart app: `pm2 restart chinahuib2b-next`
3. Check Nginx: `sudo systemctl status nginx`
4. Check database: `sudo systemctl status postgresql`
5. Review PRODUCTION_DEPLOYMENT_GUIDE.md troubleshooting section

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Server IP**: _______________  
**Notes**: _______________
