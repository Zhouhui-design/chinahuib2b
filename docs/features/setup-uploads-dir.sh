#!/bin/bash
# Setup uploads directory on production server

set -e

echo "=========================================="
echo "Setting up uploads directory"
echo "=========================================="
echo ""

UPLOAD_DIR="/var/www/chinahuib2b/public/uploads"

# Create uploads directory structure
echo "Creating uploads directories..."
mkdir -p "$UPLOAD_DIR/products"
mkdir -p "$UPLOAD_DIR/logos"
mkdir -p "$UPLOAD_DIR/banners"
mkdir -p "$UPLOAD_DIR/brochures"
mkdir -p "$UPLOAD_DIR/others"

# Set permissions (readable by web server)
echo "Setting permissions..."
chmod -R 755 "$UPLOAD_DIR"

# Verify
echo ""
echo "Uploads directory structure created:"
ls -la "$UPLOAD_DIR"
echo ""
echo "✓ Uploads directory is ready!"
echo ""
echo "Files will be accessible at: https://chinahuib2b.top/uploads/..."
echo ""
