# 🔄 Migration Guide: Local Storage → DigitalOcean Spaces

This guide helps you migrate from local disk storage to DigitalOcean Spaces when you're ready.

---

## 📋 When to Migrate

Consider migrating when:
- ✅ You have paying customers
- ✅ File storage exceeds 50GB
- ✅ You need CDN for faster global access
- ✅ You want automated backups and redundancy
- ✅ Your budget allows for ~$5-10/month for Spaces

---

## 🚀 Migration Steps

### Step 1: Create DigitalOcean Spaces

1. Login to DigitalOcean Control Panel
2. Go to Spaces: https://cloud.digitalocean.com/spaces
3. Click "Create a Space"
4. Fill in:
   - **Name**: `chinahuib2b-storage`
   - **Region**: Singapore (SGP1)
   - **CDN**: Enable
5. Generate API keys and save them securely

### Step 2: Upload Existing Files to Spaces

Create a migration script:

```bash
#!/bin/bash
# migrate-to-spaces.sh

SPACES_BUCKET="chinahuib2b-storage"
SPACES_REGION="sgp1"
SPACES_ENDPOINT="https://${SPACES_REGION}.digitaloceanspaces.com"
ACCESS_KEY="YOUR_ACCESS_KEY"
SECRET_KEY="YOUR_SECRET_KEY"

LOCAL_UPLOADS="/var/www/chinahuib2b/public/uploads"

echo "Installing s3cmd..."
pip install s3cmd

echo "Configuring s3cmd..."
s3cmd --configure \
  --access_key=$ACCESS_KEY \
  --secret_key=$SECRET_KEY \
  --host=$SPACES_ENDPOINT \
  --host-bucket="%(bucket)s.${SPACES_REGION}.digitaloceanspaces.com" \
  --no-ssl

echo "Uploading files to Spaces..."
s3cmd sync --acl-public --recursive $LOCAL_UPLOADS/ s3://$SPACES_BUCKET/uploads/

echo "Migration complete!"
echo "Files are now at: https://${SPACES_BUCKET}.${SPACES_REGION}.cdn.digitaloceanspaces.com/uploads/"
```

### Step 3: Update Database URLs

Run this SQL to update all file URLs:

```sql
-- Update product images
UPDATE "Product" 
SET images = array_replace(images, '/uploads/', 'https://chinahuib2b-storage.sgp1.cdn.digitaloceanspaces.com/uploads/')
WHERE images IS NOT NULL;

UPDATE "Product" 
SET "mainImageUrl" = REPLACE("mainImageUrl", '/uploads/', 'https://chinahuib2b-storage.sgp1.cdn.digitaloceanspaces.com/uploads/')
WHERE "mainImageUrl" IS NOT NULL;

-- Update seller profiles
UPDATE "SellerProfile" 
SET "logoUrl" = REPLACE("logoUrl", '/uploads/', 'https://chinahuib2b-storage.sgp1.cdn.digitaloceanspaces.com/uploads/')
WHERE "logoUrl" IS NOT NULL;

UPDATE "SellerProfile" 
SET "bannerUrl" = REPLACE("bannerUrl", '/uploads/', 'https://chinahuib2b-storage.sgp1.cdn.digitaloceanspaces.com/uploads/')
WHERE "bannerUrl" IS NOT NULL;

-- Update brochures
UPDATE "StoreBrochure" 
SET "fileUrl" = REPLACE("fileUrl", '/uploads/', 'https://chinahuib2b-storage.sgp1.cdn.digitaloceanspaces.com/uploads/');

UPDATE "ProductBrochure" 
SET "fileUrl" = REPLACE("fileUrl", '/uploads/', 'https://chinahuib2b-storage.sgp1.cdn.digitaloceanspaces.com/uploads/');
```

### Step 4: Update Application Code

**Update `.env.production`:**

```bash
# Comment out or remove local storage config
# UPLOAD_DIR=/var/www/chinahuib2b/public/uploads

# Uncomment and configure Spaces
DO_SPACES_ENDPOINT="https://sgp1.digitaloceanspaces.com"
DO_SPACES_BUCKET="chinahuib2b-storage"
DO_SPACES_ACCESS_KEY="YOUR_ACTUAL_ACCESS_KEY"
DO_SPACES_SECRET_KEY="YOUR_ACTUAL_SECRET_KEY"
DO_SPACES_REGION="sgp1"
```

**Revert upload API to use Spaces:**

Replace the current `src/app/api/upload/route.ts` with the Spaces version (from earlier commits or backup).

### Step 5: Deploy and Test

```bash
# Commit changes
git add .
git commit -m "feat: migrate from local storage to DigitalOcean Spaces"
git push origin main

# On server
cd /var/www/chinahuib2b
git pull origin main
npm install
npm run build
pm2 restart chinahuib2b-next
```

### Step 6: Verify Everything Works

Test these features:
- [ ] Upload product image
- [ ] Upload logo
- [ ] Upload banner
- [ ] Upload brochure
- [ ] View uploaded images on public pages
- [ ] Download brochures
- [ ] Check file URLs point to Spaces CDN

### Step 7: Cleanup (After 1 Week of Testing)

Once confirmed everything works:

```bash
# Backup local uploads (just in case)
tar czf /backups/uploads-backup-$(date +%Y%m%d).tar.gz /var/www/chinahuib2b/public/uploads

# Remove local uploads directory
rm -rf /var/www/chinahuib2b/public/uploads
```

---

## ⚠️ Important Notes

### During Migration
- **Downtime**: Plan for 10-15 minutes of maintenance
- **Backup**: Always backup before migration
- **Test**: Thoroughly test in staging first if possible

### Cost Comparison

| Storage Type | Cost (Monthly) | Features |
|-------------|----------------|----------|
| Local Disk (current) | $0 | Limited by server disk, no CDN |
| DigitalOcean Spaces | ~$5-10 | 250GB included, CDN, backups |

### Benefits of Spaces
✅ Global CDN for faster downloads  
✅ Automatic backups and redundancy  
✅ No server disk space concerns  
✅ Easy scaling  
✅ Better security  

### Benefits of Local Storage
✅ Zero cost  
✅ Simpler setup  
✅ Faster for local users  
✅ Full control  

---

## 🔙 Rollback Plan

If something goes wrong:

1. **Revert code changes:**
   ```bash
   git revert HEAD
   npm run build
   pm2 restart chinahuib2b-next
   ```

2. **Restore database URLs:**
   ```sql
   -- Reverse the URL replacements
   UPDATE "Product" 
   SET images = array_replace(images, 'https://chinahuib2b-storage.sgp1.cdn.digitaloceanspaces.com/uploads/', '/uploads/')
   WHERE images IS NOT NULL;
   
   -- ... (similar for other tables)
   ```

3. **Restore local files from backup**

---

## 📞 Need Help?

If you encounter issues during migration:
1. Check PM2 logs: `pm2 logs chinahuib2b-next`
2. Verify Spaces credentials in `.env.production`
3. Test Spaces connection manually with AWS SDK
4. Check CORS configuration in Spaces settings

---

## ✨ Summary

**Current State**: Local storage (free, simple)  
**Future State**: DigitalOcean Spaces ($5-10/month, scalable)  
**Migration Time**: ~30 minutes  
**Risk**: Low (with proper backup)  

**Recommendation**: Stay with local storage until you have revenue or hit storage limits!
