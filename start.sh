#!/bin/bash

# EXITLINK OMEGA Start Script
# This script starts the EXITLINK OMEGA application

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
echo ""

# Check if running in development mode
if [ "$1" == "dev" ]; then
  echo -e "${BLUE}Starting EXITLINK OMEGA in development mode...${NC}"
  
  # Start backend
  echo -e "${BLUE}Starting backend...${NC}"
  cd backend
  npm run dev &
  BACKEND_PID=$!
  cd ..
  
  # Start frontend
  echo -e "${BLUE}Starting frontend...${NC}"
  cd frontend
  npm run dev &
  FRONTEND_PID=$!
  cd ..
  
  # Wait for both processes
  wait $BACKEND_PID $FRONTEND_PID
else
  # Start in production mode using Docker Compose
  echo -e "${BLUE}Starting EXITLINK OMEGA in production mode...${NC}"
  
  # Check if Docker is running
  if ! docker info &> /dev/null; then
    echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
  fi
  
  # Start services
  docker-compose up -d
  
  # Check if services are running
  echo -e "${BLUE}Checking if services are running...${NC}"
  sleep 5
  
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
fi