#!/bin/bash

# EXITLINK OMEGA Verification Script
# This script checks if the system meets the requirements for EXITLINK OMEGA

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
echo -e "${YELLOW}System Verification Tool${NC}"
echo ""

# Check CPU
echo -e "${BLUE}Checking CPU...${NC}"
CPU_CORES=$(grep -c ^processor /proc/cpuinfo)
if [ $CPU_CORES -ge 4 ]; then
    echo -e "${GREEN}CPU: $CPU_CORES cores (Recommended: 4+ cores) ✓${NC}"
else
    echo -e "${YELLOW}CPU: $CPU_CORES cores (Recommended: 4+ cores) ⚠${NC}"
    echo -e "${YELLOW}EXITLINK OMEGA may run slower with fewer CPU cores.${NC}"
fi

# Check RAM
echo -e "${BLUE}Checking RAM...${NC}"
TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
if [ $TOTAL_RAM -ge 8192 ]; then
    echo -e "${GREEN}RAM: $TOTAL_RAM MB (Recommended: 8192+ MB) ✓${NC}"
elif [ $TOTAL_RAM -ge 4096 ]; then
    echo -e "${YELLOW}RAM: $TOTAL_RAM MB (Recommended: 8192+ MB) ⚠${NC}"
    echo -e "${YELLOW}EXITLINK OMEGA may run with limited performance.${NC}"
else
    echo -e "${RED}RAM: $TOTAL_RAM MB (Recommended: 8192+ MB) ✗${NC}"
    echo -e "${RED}EXITLINK OMEGA requires at least 4GB of RAM.${NC}"
fi

# Check Disk Space
echo -e "${BLUE}Checking Disk Space...${NC}"
DISK_SPACE=$(df -h / | awk 'NR==2 {print $4}')
DISK_SPACE_MB=$(df -m / | awk 'NR==2 {print $4}')
if [ $DISK_SPACE_MB -ge 20480 ]; then
    echo -e "${GREEN}Disk Space: $DISK_SPACE (Recommended: 20+ GB) ✓${NC}"
elif [ $DISK_SPACE_MB -ge 10240 ]; then
    echo -e "${YELLOW}Disk Space: $DISK_SPACE (Recommended: 20+ GB) ⚠${NC}"
    echo -e "${YELLOW}EXITLINK OMEGA may run with limited storage capacity.${NC}"
else
    echo -e "${RED}Disk Space: $DISK_SPACE (Recommended: 20+ GB) ✗${NC}"
    echo -e "${RED}EXITLINK OMEGA requires at least 10GB of free disk space.${NC}"
fi

# Check Docker
echo -e "${BLUE}Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    echo -e "${GREEN}Docker: $DOCKER_VERSION ✓${NC}"
else
    echo -e "${RED}Docker: Not installed ✗${NC}"
    echo -e "${RED}EXITLINK OMEGA requires Docker to be installed.${NC}"
fi

# Check Docker Compose
echo -e "${BLUE}Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
    echo -e "${GREEN}Docker Compose: $DOCKER_COMPOSE_VERSION ✓${NC}"
else
    echo -e "${RED}Docker Compose: Not installed ✗${NC}"
    echo -e "${RED}EXITLINK OMEGA requires Docker Compose to be installed.${NC}"
fi

# Check Ports
echo -e "${BLUE}Checking Ports...${NC}"
check_port() {
    if netstat -tuln | grep -q ":$1 "; then
        echo -e "${RED}Port $1: In use ✗${NC}"
        echo -e "${RED}EXITLINK OMEGA requires port $1 to be available.${NC}"
    else
        echo -e "${GREEN}Port $1: Available ✓${NC}"
    fi
}

check_port 12000 # Frontend
check_port 3000  # Backend API
check_port 5432  # PostgreSQL
check_port 6379  # Redis
check_port 9000  # MinIO
check_port 9001  # MinIO Console
check_port 9090  # Prometheus
check_port 3001  # Grafana

# Check DNS
echo -e "${BLUE}Checking DNS...${NC}"
if ping -c 1 google.com &> /dev/null; then
    echo -e "${GREEN}DNS: Working ✓${NC}"
else
    echo -e "${RED}DNS: Not working ✗${NC}"
    echo -e "${RED}EXITLINK OMEGA requires DNS resolution to work properly.${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}Verification Summary:${NC}"
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null && [ $TOTAL_RAM -ge 4096 ] && [ $DISK_SPACE_MB -ge 10240 ]; then
    echo -e "${GREEN}Your system meets the minimum requirements for EXITLINK OMEGA.${NC}"
    echo -e "${GREEN}You can proceed with the installation.${NC}"
else
    echo -e "${RED}Your system does not meet the minimum requirements for EXITLINK OMEGA.${NC}"
    echo -e "${RED}Please fix the issues above before proceeding with the installation.${NC}"
fi