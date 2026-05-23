#!/bin/bash
# Production Deployment Preparation Script for chinahuib2b.top
# Run this on your DigitalOcean server after SSH connection

set -e  # Exit on error

echo "=========================================="
echo "chinahuib2b.top Deployment Preparation"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo or login as root)"
    exit 1
fi

print_success "Running as root user"
echo ""

# Step 1: Update system
echo "Step 1/8: Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"
echo ""

# Step 2: Install required software
echo "Step 2/8: Installing required software..."
apt install -y \
    curl \
    git \
    postgresql \
    postgresql-contrib \
    redis-server \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    zip \
    unzip

print_success "Software installed"
echo ""

# Step 3: Install Node.js 20.x (if not already installed)
echo "Step 3/8: Checking Node.js installation..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not installed")
echo "Current Node.js version: $NODE_VERSION"

if [[ "$NODE_VERSION" != *"v20"* ]] && [[ "$NODE_VERSION" != *"v22"* ]]; then
    print_warning "Installing Node.js 20.x LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_success "Node.js 20.x installed"
else
    print_success "Node.js version is compatible"
fi

npm install -g pm2
print_success "PM2 installed globally"
echo ""

# Step 4: Configure firewall
echo "Step 4/8: Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
print_success "Firewall configured (SSH, HTTP, HTTPS allowed)"
echo ""

# Step 5: Setup PostgreSQL
echo "Step 5/8: Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chinahuib2b') THEN
        CREATE DATABASE chinahuib2b;
    END IF;
END
\$\$;

DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'expo_user') THEN
        CREATE USER expo_user WITH PASSWORD 'CHANGE_THIS_STRONG_PASSWORD';
    END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE chinahuib2b TO expo_user;
ALTER DATABASE chinahuib2b OWNER TO expo_user;
EOF

print_success "PostgreSQL configured"
print_warning "Remember to change the database password in .env.production!"
echo ""

# Step 6: Setup Redis
echo "Step 6/8: Setting up Redis..."
systemctl start redis-server
systemctl enable redis-server

# Set Redis password
REDIS_CONF="/etc/redis/redis.conf"
if grep -q "^# requirepass" "$REDIS_CONF"; then
    sed -i 's/^# requirepass foobared/requirepass CHANGE_THIS_REDIS_PASSWORD/' "$REDIS_CONF"
    systemctl restart redis-server
    print_success "Redis configured with password"
    print_warning "Remember to set REDIS_URL with password in .env.production!"
else
    print_success "Redis is running"
fi
echo ""

# Step 7: Create application directory
echo "Step 7/8: Creating application directory..."
mkdir -p /var/www
cd /var/www

# Remove old code if exists
if [ -d "chinahuib2b" ]; then
    print_warning "Old chinahuib2b directory found. Removing..."
    rm -rf chinahuib2b
    print_success "Old code removed"
fi

print_success "Application directory ready at /var/www"
echo ""

# Step 8: Create log directories
echo "Step 8/8: Creating log directories..."
mkdir -p /var/log/pm2
mkdir -p /backups/chinahuib2b
chown -R root:root /var/log/pm2
chown -R root:root /backups/chinahuib2b
print_success "Log and backup directories created"
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}Server preparation complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Clone your repository:"
echo "   cd /var/www"
echo "   git clone YOUR_REPO_URL"
echo "   cd chinahuib2b"
echo ""
echo "2. Install dependencies and build:"
echo "   npm install"
echo "   npm run build"
echo ""
echo "3. Configure environment:"
echo "   cp .env.production.example .env.production"
echo "   nano .env.production"
echo ""
echo "4. Update these values in .env.production:"
echo "   - DATABASE_URL (with actual password)"
echo "   - REDIS_URL (with actual password)"
echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
echo "   - DO_SPACES_ACCESS_KEY (from DigitalOcean)"
echo "   - DO_SPACES_SECRET_KEY (from DigitalOcean)"
echo ""
echo "5. Run migrations:"
echo "   npx prisma migrate deploy"
echo ""
echo "6. Start application:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "7. Configure Nginx and SSL (see DEPLOYMENT_CHECKLIST.md)"
echo ""
echo "=========================================="
print_warning "IMPORTANT: Before deploying, create DigitalOcean Spaces bucket!"
echo "See: setup-spaces-helper.sh for instructions"
echo "=========================================="
