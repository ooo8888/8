#!/bin/bash

# EXITLINK OMEGA Deployment Script
# This script deploys EXITLINK OMEGA using Docker Compose

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
echo -e "${YELLOW}Deployment Tool${NC}"
echo ""

# Check if Docker is running
echo -e "${BLUE}Checking if Docker is running...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Build and start containers
echo -e "${BLUE}Building and starting containers...${NC}"
docker-compose up -d --build

# Check if services are running
echo -e "${BLUE}Checking if services are running...${NC}"
sleep 10

# Function to check if a service is running
check_service() {
    if docker-compose ps | grep $1 | grep -q "Up"; then
        echo -e "${GREEN}$1: Running ✓${NC}"
        return 0
    else
        echo -e "${RED}$1: Not running ✗${NC}"
        return 1
    fi
}

# Check each service
SERVICES=("frontend" "backend" "postgres" "redis" "minio" "prometheus" "grafana")
FAILED=0

for SERVICE in "${SERVICES[@]}"; do
    if ! check_service $SERVICE; then
        FAILED=1
    fi
done

# Health check
echo -e "${BLUE}Performing health checks...${NC}"

# Check frontend
echo -e "${BLUE}Checking frontend...${NC}"
if curl -s http://localhost:12000 &> /dev/null; then
    echo -e "${GREEN}Frontend: Accessible ✓${NC}"
else
    echo -e "${RED}Frontend: Not accessible ✗${NC}"
    FAILED=1
fi

# Check backend
echo -e "${BLUE}Checking backend...${NC}"
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo -e "${GREEN}Backend: Healthy ✓${NC}"
else
    echo -e "${RED}Backend: Not healthy ✗${NC}"
    FAILED=1
fi

# Summary
echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}EXITLINK OMEGA has been successfully deployed!${NC}"
    echo -e "${GREEN}Frontend: http://localhost:12000${NC}"
    echo -e "${GREEN}Backend API: http://localhost:3000${NC}"
    echo -e "${GREEN}Prometheus: http://localhost:9090${NC}"
    echo -e "${GREEN}Grafana: http://localhost:3001 (admin/admin)${NC}"
    echo -e "${GREEN}MinIO Console: http://localhost:9001 (minioadmin/minioadmin)${NC}"
else
    echo -e "${RED}EXITLINK OMEGA deployment has issues. Please check the logs with 'docker-compose logs'.${NC}"
    exit 1
fi