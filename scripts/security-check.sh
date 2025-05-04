#!/bin/bash

# EXITLINK OMEGA Security Check Script
# This script checks for security vulnerabilities in the EXITLINK OMEGA application

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
echo -e "${YELLOW}Security Check Script${NC}"
echo ""

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo -e "${RED}npm is not installed. Please install npm and try again.${NC}"
  exit 1
fi

# Check for npm audit
echo -e "${BLUE}Checking for npm vulnerabilities in backend...${NC}"
cd "$PROJECT_DIR/backend"
npm audit --production || echo -e "${YELLOW}Vulnerabilities found in backend dependencies.${NC}"

echo -e "${BLUE}Checking for npm vulnerabilities in frontend...${NC}"
cd "$PROJECT_DIR/frontend"
npm audit --production || echo -e "${YELLOW}Vulnerabilities found in frontend dependencies.${NC}"

# Check for Docker security
if command -v docker &> /dev/null; then
  echo -e "${BLUE}Checking Docker configuration...${NC}"
  
  # Check if Docker Compose file exists
  if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    echo -e "${GREEN}Docker Compose file found.${NC}"
    
    # Check for privileged containers
    if grep -q "privileged: true" "$PROJECT_DIR/docker-compose.yml"; then
      echo -e "${RED}Warning: Privileged containers found in docker-compose.yml${NC}"
    else
      echo -e "${GREEN}No privileged containers found.${NC}"
    fi
    
    # Check for exposed ports
    echo -e "${BLUE}Checking for exposed ports...${NC}"
    EXPOSED_PORTS=$(grep -E "ports:" -A 5 "$PROJECT_DIR/docker-compose.yml" | grep -E "\"[0-9]+:[0-9]+\"" || echo "None")
    echo -e "${YELLOW}Exposed ports:${NC}"
    echo "$EXPOSED_PORTS"
  else
    echo -e "${YELLOW}Docker Compose file not found.${NC}"
  fi
else
  echo -e "${YELLOW}Docker not installed. Skipping Docker security checks.${NC}"
fi

# Check for sensitive files
echo -e "${BLUE}Checking for sensitive files...${NC}"
SENSITIVE_FILES=$(find "$PROJECT_DIR" -name ".env" -o -name "*.pem" -o -name "*.key" -o -name "*.p12" -o -name "*.pfx" -o -name "*.jks" -o -name "*.keystore" -o -name "*.cer" -o -name "*.crt" -o -name "*.der" -o -name "*.p7b" -o -name "*.p7c" -o -name "*.p7r" -o -name "*.spc" -o -name "*.p12" -o -name "*.pfx" -o -name "*.p8" -o -name "*.p8e" -o -name "*.p8p" -o -name "*.p8s" -o -name "*.p8z" -o -name "*.p8c" -o -name "*.p8d" -o -name "*.p8e" -o -name "*.p8f" -o -name "*.p8g" -o -name "*.p8h" -o -name "*.p8i" -o -name "*.p8j" -o -name "*.p8k" -o -name "*.p8l" -o -name "*.p8m" -o -name "*.p8n" -o -name "*.p8o" -o -name "*.p8p" -o -name "*.p8q" -o -name "*.p8r" -o -name "*.p8s" -o -name "*.p8t" -o -name "*.p8u" -o -name "*.p8v" -o -name "*.p8w" -o -name "*.p8x" -o -name "*.p8y" -o -name "*.p8z" | grep -v "\.env\.example" | grep -v "node_modules")

if [ -z "$SENSITIVE_FILES" ]; then
  echo -e "${GREEN}No sensitive files found.${NC}"
else
  echo -e "${RED}Sensitive files found:${NC}"
  echo "$SENSITIVE_FILES"
  echo -e "${YELLOW}Please ensure these files are not committed to version control.${NC}"
fi

# Check for hardcoded secrets
echo -e "${BLUE}Checking for hardcoded secrets...${NC}"
HARDCODED_SECRETS=$(grep -r -E "(password|secret|key|token|credential).*['\"][a-zA-Z0-9]{8,}['\"]" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.yml" --include="*.yaml" "$PROJECT_DIR" | grep -v "node_modules" | grep -v "package-lock.json" | grep -v "yarn.lock" | grep -v "test" | grep -v "example" | grep -v "\.env\.example")

if [ -z "$HARDCODED_SECRETS" ]; then
  echo -e "${GREEN}No hardcoded secrets found.${NC}"
else
  echo -e "${RED}Potential hardcoded secrets found:${NC}"
  echo "$HARDCODED_SECRETS"
  echo -e "${YELLOW}Please ensure these are not actual secrets or move them to environment variables.${NC}"
fi

# Check for security headers in Nginx config
if [ -f "$PROJECT_DIR/nginx/nginx.conf" ]; then
  echo -e "${BLUE}Checking Nginx configuration for security headers...${NC}"
  
  # Check for common security headers
  MISSING_HEADERS=""
  
  if ! grep -q "X-Content-Type-Options" "$PROJECT_DIR/nginx/nginx.conf"; then
    MISSING_HEADERS="$MISSING_HEADERS\n- X-Content-Type-Options"
  fi
  
  if ! grep -q "X-Frame-Options" "$PROJECT_DIR/nginx/nginx.conf"; then
    MISSING_HEADERS="$MISSING_HEADERS\n- X-Frame-Options"
  fi
  
  if ! grep -q "X-XSS-Protection" "$PROJECT_DIR/nginx/nginx.conf"; then
    MISSING_HEADERS="$MISSING_HEADERS\n- X-XSS-Protection"
  fi
  
  if ! grep -q "Content-Security-Policy" "$PROJECT_DIR/nginx/nginx.conf"; then
    MISSING_HEADERS="$MISSING_HEADERS\n- Content-Security-Policy"
  fi
  
  if ! grep -q "Strict-Transport-Security" "$PROJECT_DIR/nginx/nginx.conf"; then
    MISSING_HEADERS="$MISSING_HEADERS\n- Strict-Transport-Security"
  fi
  
  if [ -n "$MISSING_HEADERS" ]; then
    echo -e "${YELLOW}Missing security headers in Nginx configuration:${NC}$MISSING_HEADERS"
  else
    echo -e "${GREEN}All recommended security headers found in Nginx configuration.${NC}"
  fi
else
  echo -e "${YELLOW}Nginx configuration not found. Skipping Nginx security checks.${NC}"
fi

# Check for CORS configuration
echo -e "${BLUE}Checking CORS configuration...${NC}"
if grep -q "cors" "$PROJECT_DIR/backend/src/index.js" || grep -q "cors" "$PROJECT_DIR/backend/src/app.js"; then
  echo -e "${GREEN}CORS configuration found.${NC}"
  
  # Check for wildcard origin
  if grep -q "origin: '\*'" "$PROJECT_DIR/backend/src/index.js" || grep -q "origin: '\*'" "$PROJECT_DIR/backend/src/app.js"; then
    echo -e "${YELLOW}Warning: CORS allows all origins ('*'). Consider restricting to specific domains in production.${NC}"
  else
    echo -e "${GREEN}CORS configuration appears to be restricted.${NC}"
  fi
else
  echo -e "${YELLOW}CORS configuration not found. This may be a security issue.${NC}"
fi

# Check for JWT configuration
echo -e "${BLUE}Checking JWT configuration...${NC}"
if grep -q "jwt" "$PROJECT_DIR/backend/src/index.js" || grep -q "jwt" "$PROJECT_DIR/backend/src/app.js"; then
  echo -e "${GREEN}JWT configuration found.${NC}"
  
  # Check for hardcoded JWT secret
  if grep -q "secret: 'supersecretkey'" "$PROJECT_DIR/backend/src/index.js" || grep -q "secret: 'supersecretkey'" "$PROJECT_DIR/backend/src/app.js"; then
    echo -e "${RED}Warning: Hardcoded JWT secret found. Use environment variables instead.${NC}"
  else
    echo -e "${GREEN}JWT secret appears to be configured properly.${NC}"
  fi
else
  echo -e "${YELLOW}JWT configuration not found. This may be a security issue if authentication is required.${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}Security Check Summary${NC}"
echo -e "${YELLOW}Please review the findings above and address any security issues.${NC}"
echo -e "${YELLOW}For a more comprehensive security audit, consider using specialized tools or hiring a security professional.${NC}"
echo ""
echo -e "${GREEN}Security check completed.${NC}"