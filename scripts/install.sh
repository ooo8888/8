#!/bin/bash

# EXITLINK OMEGA Installation Script
# This script installs Docker, Docker Compose, and sets up EXITLINK OMEGA

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
echo -e "${YELLOW}Self-Destructing Link Platform${NC}"
echo -e "${YELLOW}Military-Grade Security | Luxury UX | Crypto Payments${NC}"
echo ""

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root${NC}"
  exit 1
fi

# Detect OS
echo -e "${BLUE}Detecting operating system...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
    echo -e "${GREEN}Detected: $OS $VER${NC}"
else
    echo -e "${RED}Unsupported OS. Please use Ubuntu, Debian, CentOS, or Fedora.${NC}"
    exit 1
fi

# Install Docker if not installed
echo -e "${BLUE}Checking for Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    
    # Install Docker based on OS
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt-get update
        apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/$ID/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$ID $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Fedora"* ]]; then
        yum install -y yum-utils
        yum-config-manager --add-repo https://download.docker.com/linux/$ID/docker-ce.repo
        yum install -y docker-ce docker-ce-cli containerd.io
        systemctl start docker
        systemctl enable docker
    else
        echo -e "${RED}Unsupported OS for Docker installation.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Docker installed successfully!${NC}"
else
    echo -e "${GREEN}Docker is already installed.${NC}"
fi

# Install Docker Compose if not installed
echo -e "${BLUE}Checking for Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing Docker Compose...${NC}"
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    echo -e "${GREEN}Docker Compose installed successfully!${NC}"
else
    echo -e "${GREEN}Docker Compose is already installed.${NC}"
fi

# Configure firewall if UFW is installed
echo -e "${BLUE}Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    echo -e "${YELLOW}UFW detected. Configuring firewall rules...${NC}"
    
    # Allow SSH, HTTP, and HTTPS
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow EXITLINK OMEGA ports
    ufw allow 12000/tcp # Frontend
    ufw allow 3000/tcp # Backend API
    
    # Optional: Allow monitoring ports
    ufw allow 9090/tcp # Prometheus
    ufw allow 3001/tcp # Grafana
    
    echo -e "${GREEN}Firewall configured successfully!${NC}"
else
    echo -e "${YELLOW}UFW not detected. Skipping firewall configuration.${NC}"
fi

# Create environment file
echo -e "${BLUE}Creating environment file...${NC}"
cat > .env << EOL
# EXITLINK OMEGA Environment Variables

# JWT Secret (change this to a secure random string)
JWT_SECRET=$(openssl rand -hex 32)

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=exitlink

# Redis
REDIS_PASSWORD=

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# Base URL (change this to your domain)
BASE_URL=http://localhost:12000
EOL

echo -e "${GREEN}Environment file created successfully!${NC}"

# Start EXITLINK OMEGA
echo -e "${BLUE}Starting EXITLINK OMEGA...${NC}"
docker-compose up -d

# Check if services are running
echo -e "${BLUE}Checking if services are running...${NC}"
sleep 10

if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}EXITLINK OMEGA is now running!${NC}"
    echo -e "${GREEN}Frontend: http://localhost:12000${NC}"
    echo -e "${GREEN}Backend API: http://localhost:3000${NC}"
    echo -e "${GREEN}Prometheus: http://localhost:9090${NC}"
    echo -e "${GREEN}Grafana: http://localhost:3001 (admin/admin)${NC}"
    echo -e "${GREEN}MinIO Console: http://localhost:9001 (minioadmin/minioadmin)${NC}"
else
    echo -e "${RED}Some services failed to start. Please check the logs with 'docker-compose logs'.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Installation complete!${NC}"
echo -e "${YELLOW}Thank you for installing EXITLINK OMEGA.${NC}"
echo -e "${YELLOW}For support, please visit https://exitlink.io/support${NC}"