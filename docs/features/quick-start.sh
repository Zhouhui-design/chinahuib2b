#!/bin/bash

# chinahuib2b.top AI-First Optimization - Quick Start Script
# This script helps you test all the new AI integration features

set -e

echo "=========================================="
echo "China Hui B2B - AI Integration Quick Start"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the chinahuib2b project root${NC}"
    exit 1
fi

print_header "Step 1: Checking Dependencies"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Check if MCP SDK is installed
if npm list @modelcontextprotocol/sdk > /dev/null 2>&1; then
    print_success "MCP SDK installed"
else
    print_info "Installing MCP SDK..."
    npm install @modelcontextprotocol/sdk
    print_success "MCP SDK installed"
fi

print_header "Step 2: Building the Project"

print_info "Building Next.js application..."
npm run build
print_success "Build completed"

print_header "Step 3: Starting Development Server"

print_info "Starting server on http://localhost:3000"
print_info "Press Ctrl+C to stop the server"
echo ""

# Start the server in the background
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

print_header "Step 4: Testing New Features"

# Test API Docs page
print_info "Testing API Documentation page..."
if curl -s http://localhost:3000/api/docs > /dev/null; then
    print_success "API Docs page accessible at http://localhost:3000/api/docs"
else
    echo -e "${RED}✗ API Docs page not accessible${NC}"
fi

# Test Marketplace page
print_info "Testing Marketplace page..."
if curl -s http://localhost:3000/marketplace > /dev/null; then
    print_success "Marketplace page accessible at http://localhost:3000/marketplace"
else
    echo -e "${RED}✗ Marketplace page not accessible${NC}"
fi

# Test sitemap
print_info "Testing sitemap.xml..."
if curl -s http://localhost:3000/sitemap.xml > /dev/null; then
    print_success "sitemap.xml accessible at http://localhost:3000/sitemap.xml"
else
    echo -e "${RED}✗ sitemap.xml not accessible${NC}"
fi

# Test robots.txt
print_info "Testing robots.txt..."
if curl -s http://localhost:3000/robots.txt > /dev/null; then
    print_success "robots.txt accessible at http://localhost:3000/robots.txt"
else
    echo -e "${RED}✗ robots.txt not accessible${NC}"
fi

print_header "Step 5: Testing CLI Tool"

print_info "Testing CLI tool help command..."
npm run cli -- --help > /dev/null 2>&1 && print_success "CLI tool working" || echo -e "${RED}✗ CLI tool not working${NC}"

print_header "Available Features"

echo -e "${GREEN}1. API Documentation${NC}"
echo "   URL: http://localhost:3000/api/docs"
echo "   Description: Complete API documentation for AI agents"
echo ""

echo -e "${GREEN}2. Task Marketplace${NC}"
echo "   URL: http://localhost:3000/marketplace"
echo "   Description: Post and complete business tasks"
echo ""

echo -e "${GREEN}3. MCP Server${NC}"
echo "   Command: npm run mcp"
echo "   Description: Model Context Protocol server for AI integration"
echo ""

echo -e "${GREEN}4. CLI Tool${NC}"
echo "   Command: npm run cli -- [command]"
echo "   Description: Command-line interface for automation"
echo ""

echo -e "${GREEN}5. Multi-language Support${NC}"
echo "   Languages: en, zh, es, fr, de, ar, pt, ru, ja, ko"
echo "   Description: Full i18n support with hreflang tags"
echo ""

print_header "Quick Commands Reference"

echo -e "${YELLOW}Start development server:${NC}"
echo "  npm run dev"
echo ""

echo -e "${YELLOW}Start MCP server:${NC}"
echo "  npm run mcp"
echo ""

echo -e "${YELLOW}Use CLI tool:${NC}"
echo "  npm run cli -- auth login user@example.com password"
echo "  npm run cli -- products search electronics --max-price=1000"
echo "  npm run cli -- marketplace tasks --limit=5"
echo ""

echo -e "${YELLOW}Build for production:${NC}"
echo "  npm run build"
echo "  npm run start"
echo ""

print_header "Documentation"

echo -e "${GREEN}Full Integration Guide:${NC}"
echo "  File: AI_AGENT_INTEGRATION_GUIDE.md"
echo "  View: cat AI_AGENT_INTEGRATION_GUIDE.md"
echo ""

echo -e "${GREEN}Progress Report:${NC}"
echo "  File: OPTIMIZATION_PROGRESS_REPORT.md"
echo "  View: cat OPTIMIZATION_PROGRESS_REPORT.md"
echo ""

echo -e "${GREEN}Task List:${NC}"
echo "  File: AI_FIRST_OPTIMIZATION_TASKS.md"
echo "  View: cat AI_FIRST_OPTIMIZATION_TASKS.md"
echo ""

print_header "Next Steps"

echo -e "${YELLOW}1. Test the API documentation${NC}"
echo "   Open: http://localhost:3000/api/docs"
echo ""

echo -e "${YELLOW}2. Explore the marketplace${NC}"
echo "   Open: http://localhost:3000/marketplace"
echo ""

echo -e "${YELLOW}3. Try the CLI tool${NC}"
echo "   Run: npm run cli -- --help"
echo ""

echo -e "${YELLOW}4. Set up MCP server (for AI agents)${NC}"
echo "   Run: npm run mcp"
echo ""

echo -e "${YELLOW}5. Read the integration guide${NC}"
echo "   File: AI_AGENT_INTEGRATION_GUIDE.md"
echo ""

print_header "Support"

echo "If you encounter any issues:"
echo "  - Check the logs above for error messages"
echo "  - Review the documentation files"
echo "  - Contact: api-support@chinahuib2b.top"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Quick Start Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Keep the server running
wait $SERVER_PID
