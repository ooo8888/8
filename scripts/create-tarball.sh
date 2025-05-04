#!/bin/bash

# EXITLINK OMEGA Tarball Creation Script
# This script creates a tarball of the EXITLINK OMEGA application for distribution

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "███████╗██╗  ██╗██╗████████╗██╗     ██╗███╗   ██╗██╗  ██╗"
echo "██╔════╝╚██╗██╔╝██║╚══██╔══╝██║     ██║████╗  ██║██║ ██╔╝"
echo "█████╗   ╚███╔╝ ██║   ██║   ██║     ██║██╔██╗ ██║█████╔╝ "
echo "██╔══╝   ██╔██╗ ██║   ██║   ██║     ██║██║╚██╗██║██╔═██╗ "
echo "███████╗██╔╝ ██╗██║   ██║   ███████╗██║██║ ╚████║██║  ██╗"
echo "╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝"
echo "                      OMEGA                               "
echo -e "${NC}"
echo -e "${YELLOW}Tarball Creation Script${NC}"
echo ""

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VERSION=$(grep '"version"' "$PROJECT_DIR/package.json" | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[:space:]')
TIMESTAMP=$(date +%Y%m%d%H%M%S)
TARBALL_NAME="exitlink-omega-${VERSION}-${TIMESTAMP}.tar.gz"
TEMP_DIR="/tmp/exitlink-omega-${TIMESTAMP}"

# Create temporary directory
echo -e "${BLUE}Creating temporary directory...${NC}"
mkdir -p "$TEMP_DIR"

# Copy files to temporary directory
echo -e "${BLUE}Copying files...${NC}"
cp -r "$PROJECT_DIR/backend" "$TEMP_DIR/"
cp -r "$PROJECT_DIR/frontend" "$TEMP_DIR/"
cp -r "$PROJECT_DIR/scripts" "$TEMP_DIR/"
cp -r "$PROJECT_DIR/docs" "$TEMP_DIR/"
cp "$PROJECT_DIR/docker-compose.yml" "$TEMP_DIR/"
cp "$PROJECT_DIR/package.json" "$TEMP_DIR/"
cp "$PROJECT_DIR/README.md" "$TEMP_DIR/"
cp "$PROJECT_DIR/LICENSE" "$TEMP_DIR/"
cp "$PROJECT_DIR/CONTRIBUTING.md" "$TEMP_DIR/"
cp "$PROJECT_DIR/SECURITY.md" "$TEMP_DIR/"
cp "$PROJECT_DIR/start.sh" "$TEMP_DIR/"

# Remove node_modules and other unnecessary files
echo -e "${BLUE}Removing unnecessary files...${NC}"
rm -rf "$TEMP_DIR/backend/node_modules"
rm -rf "$TEMP_DIR/frontend/node_modules"
rm -rf "$TEMP_DIR/backend/.env"
rm -rf "$TEMP_DIR/frontend/.env.local"
rm -rf "$TEMP_DIR/backend/dist"
rm -rf "$TEMP_DIR/frontend/.next"
find "$TEMP_DIR" -name ".DS_Store" -delete
find "$TEMP_DIR" -name "*.log" -delete

# Create .env.example files if they don't exist
if [ ! -f "$TEMP_DIR/backend/.env.example" ]; then
  echo -e "${BLUE}Creating backend .env.example...${NC}"
  cat > "$TEMP_DIR/backend/.env.example" << EOL
# EXITLINK OMEGA Backend Environment Variables

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=supersecretkey

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=exitlink
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# MinIO
MINIO_HOST=minio
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_BUCKET=exitlink

# Server
PORT=3000
NODE_ENV=production

# Encryption
ENCRYPTION_KEY=masterencryptionkey

# Base URL
BASE_URL=http://localhost:12000
EOL
fi

if [ ! -f "$TEMP_DIR/frontend/.env.example" ]; then
  echo -e "${BLUE}Creating frontend .env.example...${NC}"
  cat > "$TEMP_DIR/frontend/.env.example" << EOL
# EXITLINK OMEGA Frontend Environment Variables

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:12000

# Feature Flags
NEXT_PUBLIC_ENABLE_KYBER=false
NEXT_PUBLIC_ENABLE_CAMOUFLAGE=true
NEXT_PUBLIC_ENABLE_SCREENSHOT_DETECTION=true
EOL
fi

# Create tarball
echo -e "${BLUE}Creating tarball...${NC}"
cd /tmp
tar -czf "$TARBALL_NAME" "exitlink-omega-${TIMESTAMP}"

# Move tarball to project directory
echo -e "${BLUE}Moving tarball to project directory...${NC}"
mv "$TARBALL_NAME" "$PROJECT_DIR/"

# Clean up
echo -e "${BLUE}Cleaning up...${NC}"
rm -rf "$TEMP_DIR"

# Create SHA256 checksum
echo -e "${BLUE}Creating SHA256 checksum...${NC}"
cd "$PROJECT_DIR"
sha256sum "$TARBALL_NAME" > "${TARBALL_NAME}.sha256"

# Done
echo -e "${GREEN}Tarball created successfully: ${TARBALL_NAME}${NC}"
echo -e "${GREEN}SHA256 checksum: ${TARBALL_NAME}.sha256${NC}"
echo ""
echo -e "${YELLOW}To verify the tarball:${NC}"
echo -e "  sha256sum -c ${TARBALL_NAME}.sha256"
echo ""
echo -e "${YELLOW}To extract the tarball:${NC}"
echo -e "  tar -xzf ${TARBALL_NAME}"
echo ""
echo -e "${YELLOW}To install EXITLINK OMEGA:${NC}"
echo -e "  cd exitlink-omega-*"
echo -e "  ./scripts/verify.sh"
echo -e "  sudo ./scripts/install.sh"