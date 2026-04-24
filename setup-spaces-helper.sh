#!/bin/bash
# Helper script to configure DigitalOcean Spaces credentials

echo "=========================================="
echo "DigitalOcean Spaces Configuration Helper"
echo "=========================================="
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Go to: https://cloud.digitalocean.com/spaces"
echo "2. Click 'Create a Space'"
echo "3. Enter details:"
echo "   - Name: chinahuib2b-storage"
echo "   - Region: Singapore (SGP1)"
echo "   - Enable CDN: Yes (recommended)"
echo ""
echo "4. After creating, go to API section and generate keys:"
echo "   - Click 'Generate New Key'"
echo "   - Name: chinahuib2b-spaces-key"
echo "   - Copy Access Key ID and Secret Access Key"
echo ""
echo "5. Configure CORS in Space settings:"
echo '   Add this JSON:'
echo '   ['
echo '     {'
echo '       "AllowedOrigins": ["https://chinahuib2b.top", "http://localhost:3000"],'
echo '       "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],'
echo '       "AllowedHeaders": ["*"],'
echo '       "MaxAgeSeconds": 3000'
echo '     }'
echo '   ]'
echo ""
echo "=========================================="
echo "Once you have your credentials, update .env.production:"
echo ""
echo "DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com"
echo "DO_SPACES_BUCKET=chinahuib2b-storage"
echo "DO_SPACES_ACCESS_KEY=YOUR_ACCESS_KEY_HERE"
echo "DO_SPACES_SECRET_KEY=YOUR_SECRET_KEY_HERE"
echo "DO_SPACES_REGION=sgp1"
echo "=========================================="
echo ""
read -p "Press Enter after you've created the Space and copied credentials..."
