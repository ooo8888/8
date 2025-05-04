#!/bin/bash

# EXITLINK OMEGA Uninstall Script
# This script uninstalls EXITLINK OMEGA

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
echo -e "${YELLOW}Uninstall Tool${NC}"
echo ""

# Confirm uninstallation
echo -e "${RED}WARNING: This will remove EXITLINK OMEGA and all its data.${NC}"
echo -e "${RED}This action cannot be undone.${NC}"
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Uninstallation cancelled.${NC}"
    exit 0
fi

# Ask if user wants to create a backup
read -p "Do you want to create a backup before uninstalling? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Creating backup...${NC}"
    BACKUP_DIR="exitlink_backup_$(date +%Y%m%d%H%M%S)"
    mkdir -p $BACKUP_DIR
    
    # Backup database
    echo -e "${BLUE}Backing up database...${NC}"
    docker-compose exec postgres pg_dump -U postgres exitlink > $BACKUP_DIR/exitlink_db.sql
    
    # Backup files
    echo -e "${BLUE}Backing up files...${NC}"
    docker-compose exec minio mc cp -r /data $BACKUP_DIR/minio_data
    
    # Backup configuration
    echo -e "${BLUE}Backing up configuration...${NC}"
    cp -r .env docker-compose.yml $BACKUP_DIR
    
    echo -e "${GREEN}Backup created in $BACKUP_DIR${NC}"
    echo -e "${GREEN}You can restore the database with 'psql -U postgres exitlink < $BACKUP_DIR/exitlink_db.sql'${NC}"
fi

# Stop and remove containers
echo -e "${BLUE}Stopping and removing containers...${NC}"
docker-compose down -v

# Remove images
echo -e "${BLUE}Removing Docker images...${NC}"
docker rmi $(docker images | grep exitlink | awk '{print $3}') 2>/dev/null || true

# Remove firewall rules if UFW is installed
echo -e "${BLUE}Removing firewall rules...${NC}"
if command -v ufw &> /dev/null; then
    ufw delete allow 12000/tcp
    ufw delete allow 3000/tcp
    ufw delete allow 9090/tcp
    ufw delete allow 3001/tcp
fi

# Remove files
echo -e "${BLUE}Removing files...${NC}"
read -p "Do you want to remove all EXITLINK OMEGA files? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf .env docker-compose.yml prometheus.yml frontend backend scripts
    echo -e "${GREEN}Files removed.${NC}"
else
    echo -e "${YELLOW}Files not removed.${NC}"
fi

echo ""
echo -e "${GREEN}EXITLINK OMEGA has been successfully uninstalled.${NC}"
echo -e "${YELLOW}Thank you for using EXITLINK OMEGA.${NC}"