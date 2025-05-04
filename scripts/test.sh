#!/bin/bash

# EXITLINK OMEGA Test Script
# This script runs tests for EXITLINK OMEGA

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
echo -e "${YELLOW}Test Suite${NC}"
echo ""

# Check if services are running
echo -e "${BLUE}Checking if services are running...${NC}"
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}EXITLINK OMEGA is not running. Please start it with 'docker-compose up -d'.${NC}"
    exit 1
fi

# Run backend tests
echo -e "${BLUE}Running backend tests...${NC}"
docker-compose exec backend npm test

# Run frontend tests
echo -e "${BLUE}Running frontend tests...${NC}"
docker-compose exec frontend npm test

# Run integration tests
echo -e "${BLUE}Running integration tests...${NC}"

# Test 1: Create wallet
echo -e "${BLUE}Test 1: Create wallet${NC}"
WALLET_RESPONSE=$(curl -s -X POST http://localhost:3000/api/wallet/create)
WALLET_ID=$(echo $WALLET_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$WALLET_ID" ]; then
    echo -e "${GREEN}Test 1: Create wallet - Passed ✓${NC}"
else
    echo -e "${RED}Test 1: Create wallet - Failed ✗${NC}"
    exit 1
fi

# Test 2: Get wallet info
echo -e "${BLUE}Test 2: Get wallet info${NC}"
WALLET_INFO=$(curl -s -X GET http://localhost:3000/api/wallet/$WALLET_ID)
WALLET_CREDITS=$(echo $WALLET_INFO | grep -o '"credits":[0-9]*' | cut -d':' -f2)

if [ "$WALLET_CREDITS" == "1" ]; then
    echo -e "${GREEN}Test 2: Get wallet info - Passed ✓${NC}"
else
    echo -e "${RED}Test 2: Get wallet info - Failed ✗${NC}"
    exit 1
fi

# Test 3: Create link
echo -e "${BLUE}Test 3: Create link${NC}"
LINK_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"walletId\":\"$WALLET_ID\",\"content\":\"Test content\",\"type\":\"text\",\"options\":{\"maxViews\":1}}" \
    http://localhost:3000/api/link/create)
LINK_ID=$(echo $LINK_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$LINK_ID" ]; then
    echo -e "${GREEN}Test 3: Create link - Passed ✓${NC}"
else
    echo -e "${RED}Test 3: Create link - Failed ✗${NC}"
    exit 1
fi

# Test 4: View link
echo -e "${BLUE}Test 4: View link${NC}"
LINK_VIEW=$(curl -s -X GET http://localhost:3000/api/link/$LINK_ID)
LINK_CONTENT=$(echo $LINK_VIEW | grep -o '"content":"[^"]*' | cut -d'"' -f4)

if [ "$LINK_CONTENT" == "Test content" ]; then
    echo -e "${GREEN}Test 4: View link - Passed ✓${NC}"
else
    echo -e "${RED}Test 4: View link - Failed ✗${NC}"
    exit 1
fi

# Test 5: View link again (should be destroyed)
echo -e "${BLUE}Test 5: View link again (should be destroyed)${NC}"
LINK_VIEW_AGAIN=$(curl -s -X GET http://localhost:3000/api/link/$LINK_ID)
LINK_ERROR=$(echo $LINK_VIEW_AGAIN | grep -o '"error":"[^"]*' | cut -d'"' -f4)

if [ "$LINK_ERROR" == "Link has been destroyed" ]; then
    echo -e "${GREEN}Test 5: View link again - Passed ✓${NC}"
else
    echo -e "${RED}Test 5: View link again - Failed ✗${NC}"
    exit 1
fi

# Summary
echo ""
echo -e "${BLUE}Test Summary:${NC}"
echo -e "${GREEN}All tests passed!${NC}"
echo -e "${GREEN}EXITLINK OMEGA is working correctly.${NC}"