#!/bin/bash

# EXITLINK OMEGA Update Script
# This script updates EXITLINK OMEGA to the latest version

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
echo -e "${YELLOW}Update Tool${NC}"
echo ""

# Check if git is installed
echo -e "${BLUE}Checking if git is installed...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install git and try again.${NC}"
    exit 1
fi

# Check if repository exists
echo -e "${BLUE}Checking if repository exists...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${RED}Not a git repository. Please run this script from the EXITLINK OMEGA directory.${NC}"
    exit 1
fi

# Create backup
echo -e "${BLUE}Creating backup...${NC}"
BACKUP_DIR="backup_$(date +%Y%m%d%H%M%S)"
mkdir -p $BACKUP_DIR
cp -r .env docker-compose.yml $BACKUP_DIR
echo -e "${GREEN}Backup created in $BACKUP_DIR${NC}"

# Pull latest changes
echo -e "${BLUE}Pulling latest changes...${NC}"
git pull

# Rebuild containers
echo -e "${BLUE}Rebuilding containers...${NC}"
docker-compose down
docker-compose build
docker-compose up -d

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
docker-compose exec backend npm run migrate

# Check if services are running
echo -e "${BLUE}Checking if services are running...${NC}"
sleep 10

if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}EXITLINK OMEGA has been successfully updated!${NC}"
else
    echo -e "${RED}Update failed. Restoring backup...${NC}"
    cp -r $BACKUP_DIR/* .
    docker-compose up -d
    echo -e "${YELLOW}Backup restored. Please check the logs with 'docker-compose logs'.${NC}"
    exit 1
fi