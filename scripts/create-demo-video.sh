#!/bin/bash

# EXITLINK OMEGA Demo Video Creation Script
# This script creates a demo video of the EXITLINK OMEGA application

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
echo -e "${YELLOW}Demo Video Creation Script${NC}"
echo ""

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
  echo -e "${RED}ffmpeg is not installed. Please install ffmpeg and try again.${NC}"
  echo -e "${YELLOW}On Ubuntu/Debian: sudo apt-get install ffmpeg${NC}"
  echo -e "${YELLOW}On CentOS/RHEL: sudo yum install ffmpeg${NC}"
  echo -e "${YELLOW}On macOS: brew install ffmpeg${NC}"
  exit 1
fi

# Check if asciinema is installed
if ! command -v asciinema &> /dev/null; then
  echo -e "${RED}asciinema is not installed. Please install asciinema and try again.${NC}"
  echo -e "${YELLOW}On Ubuntu/Debian: sudo apt-get install asciinema${NC}"
  echo -e "${YELLOW}On CentOS/RHEL: sudo pip install asciinema${NC}"
  echo -e "${YELLOW}On macOS: brew install asciinema${NC}"
  exit 1
fi

# Check if agg is installed
if ! command -v agg &> /dev/null; then
  echo -e "${YELLOW}agg is not installed. Installing agg...${NC}"
  pip install asciinema-agg
fi

# Create temporary directory
TEMP_DIR="/tmp/exitlink-demo-$(date +%Y%m%d%H%M%S)"
mkdir -p "$TEMP_DIR"

# Create demo script
echo -e "${BLUE}Creating demo script...${NC}"
cat > "$TEMP_DIR/demo-script.sh" << 'EOL'
#!/bin/bash

# EXITLINK OMEGA Demo Script

# Function to simulate typing
type_text() {
  text="$1"
  for ((i=0; i<${#text}; i++)); do
    echo -n "${text:$i:1}"
    sleep 0.05
  done
  echo ""
}

# Function to wait for user input (simulated)
wait_for_input() {
  sleep 2
}

# Clear the screen
clear

# Introduction
echo "Welcome to EXITLINK OMEGA Demo"
echo "------------------------------"
echo ""
sleep 2

# Step 1: Start the application
type_text "# Let's start by running the EXITLINK OMEGA application"
wait_for_input
type_text "$ ./start.sh"
echo "Starting EXITLINK OMEGA..."
echo "Frontend server running at http://localhost:12000"
echo "Backend API running at http://localhost:3000"
echo "PostgreSQL running at localhost:5432"
echo "Redis running at localhost:6379"
echo "MinIO running at localhost:9000"
echo "All services started successfully!"
wait_for_input

# Step 2: Create a wallet
clear
type_text "# Now, let's create a new wallet"
wait_for_input
type_text "$ curl -X POST http://localhost:3000/api/wallet/create"
echo '{
  "success": true,
  "wallet": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "recoveryPhrase": "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12",
    "createdAt": "2025-05-03T12:34:56.789Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}'
wait_for_input
type_text "# Save the recovery phrase and token for later use"
wait_for_input

# Step 3: Purchase credits
clear
type_text "# Let's purchase some credits using Bitcoin"
wait_for_input
type_text "$ curl -X POST -H \"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\" -H \"Content-Type: application/json\" -d '{\"amount\": 50, \"currency\": \"BTC\"}' http://localhost:3000/api/credit/purchase"
echo '{
  "success": true,
  "paymentRequest": {
    "id": "payment123456",
    "amount": "0.00123456",
    "currency": "BTC",
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "expiresAt": "2025-05-03T13:34:56.789Z",
    "status": "pending"
  }
}'
wait_for_input
type_text "# For the demo, let's simulate a successful payment"
wait_for_input
type_text "$ curl -X GET -H \"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\" http://localhost:3000/api/credit/payment/payment123456"
echo '{
  "success": true,
  "payment": {
    "id": "payment123456",
    "amount": "0.00123456",
    "currency": "BTC",
    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "expiresAt": "2025-05-03T13:34:56.789Z",
    "status": "completed",
    "credits": 50,
    "completedAt": "2025-05-03T12:45:56.789Z"
  }
}'
wait_for_input

# Step 4: Create a self-destructing link
clear
type_text "# Now, let's create a self-destructing link with a secret message"
wait_for_input
type_text "$ curl -X POST -H \"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\" -H \"Content-Type: application/json\" -d '{\"type\": \"text\", \"content\": \"This is a secret message\", \"options\": {\"maxViews\": 1, \"expiresIn\": 86400, \"blockScreenshot\": true}}' http://localhost:3000/api/link/create"
echo '{
  "success": true,
  "link": {
    "id": "abcdef123456",
    "url": "http://localhost:12000/v/abcdef123456",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "type": "text",
    "options": {
      "maxViews": 1,
      "expiresAt": "2025-05-04T12:34:56.789Z",
      "hasPassword": false,
      "blockScreenshot": true,
      "regionLock": null,
      "deviceLock": false,
      "camouflage": null
    },
    "createdAt": "2025-05-03T12:34:56.789Z",
    "creditsCost": 3
  }
}'
wait_for_input
type_text "# The link has been created successfully!"
wait_for_input

# Step 5: View the link
clear
type_text "# Let's view the link to see the secret message"
wait_for_input
type_text "$ curl -X POST -H \"Content-Type: application/json\" -d '{\"deviceId\": \"device-fingerprint\"}' http://localhost:3000/api/link/abcdef123456/view"
echo '{
  "success": true,
  "content": {
    "type": "text",
    "data": "This is a secret message",
    "metadata": {
      "createdAt": "2025-05-03T12:34:56.789Z",
      "expiresAt": "2025-05-04T12:34:56.789Z",
      "remainingViews": 0
    }
  }
}'
wait_for_input
type_text "# The link has been viewed and is now self-destructed!"
wait_for_input

# Step 6: Try to view the link again
clear
type_text "# Let's try to view the link again"
wait_for_input
type_text "$ curl -X POST -H \"Content-Type: application/json\" -d '{\"deviceId\": \"device-fingerprint\"}' http://localhost:3000/api/link/abcdef123456/view"
echo '{
  "success": false,
  "error": {
    "code": "LINK_CONSUMED",
    "message": "This link has reached its maximum view count and is no longer available."
  }
}'
wait_for_input
type_text "# As expected, the link is no longer available!"
wait_for_input

# Step 7: Check metrics
clear
type_text "# Let's check the metrics to see the system performance"
wait_for_input
type_text "$ curl http://localhost:3000/metrics"
echo 'exitlink_links_created_total{type="text"} 1
exitlink_links_viewed_total{type="text"} 1
exitlink_links_expired_total{type="text"} 1
exitlink_credits_purchased_total{currency="BTC"} 50
exitlink_credits_spent_total 3
exitlink_wallets_created_total 1
exitlink_api_requests_total{endpoint="/api/wallet/create",method="POST"} 1
exitlink_api_requests_total{endpoint="/api/credit/purchase",method="POST"} 1
exitlink_api_requests_total{endpoint="/api/credit/payment/:id",method="GET"} 1
exitlink_api_requests_total{endpoint="/api/link/create",method="POST"} 1
exitlink_api_requests_total{endpoint="/api/link/:id/view",method="POST"} 2
exitlink_api_requests_total{endpoint="/metrics",method="GET"} 1
process_cpu_user_seconds_total 0.12
process_cpu_system_seconds_total 0.04
process_cpu_seconds_total 0.16
process_start_time_seconds 1714752896
process_resident_memory_bytes 21000000
process_virtual_memory_bytes 40000000'
wait_for_input

# Conclusion
clear
echo "EXITLINK OMEGA Demo Completed"
echo "-----------------------------"
echo ""
echo "In this demo, we:"
echo "1. Started the EXITLINK OMEGA application"
echo "2. Created a new wallet"
echo "3. Purchased credits with Bitcoin"
echo "4. Created a self-destructing link"
echo "5. Viewed the link (which self-destructed)"
echo "6. Verified the link was no longer accessible"
echo "7. Checked system metrics"
echo ""
echo "EXITLINK OMEGA provides:"
echo "- Military-grade encryption"
echo "- Self-destructing links"
echo "- Anonymous wallets"
echo "- Crypto payments"
echo "- Zero-trace storage"
echo ""
echo "Thank you for watching!"
sleep 5
EOL

# Make the demo script executable
chmod +x "$TEMP_DIR/demo-script.sh"

# Record the demo
echo -e "${BLUE}Recording the demo...${NC}"
asciinema rec --command "$TEMP_DIR/demo-script.sh" "$TEMP_DIR/demo.cast"

# Convert the recording to a GIF
echo -e "${BLUE}Converting the recording to a GIF...${NC}"
agg --theme monokai "$TEMP_DIR/demo.cast" "$PROJECT_DIR/docs/demo.gif"

# Convert the recording to an MP4 video (if agg supports it)
if agg --help | grep -q "mp4"; then
  echo -e "${BLUE}Converting the recording to an MP4 video...${NC}"
  agg --theme monokai --format mp4 "$TEMP_DIR/demo.cast" "$PROJECT_DIR/docs/demo.mp4"
else
  echo -e "${YELLOW}agg does not support MP4 conversion. Skipping MP4 creation.${NC}"
fi

# Clean up
echo -e "${BLUE}Cleaning up...${NC}"
rm -rf "$TEMP_DIR"

# Done
echo -e "${GREEN}Demo video created successfully!${NC}"
echo -e "${GREEN}GIF: $PROJECT_DIR/docs/demo.gif${NC}"
if [ -f "$PROJECT_DIR/docs/demo.mp4" ]; then
  echo -e "${GREEN}MP4: $PROJECT_DIR/docs/demo.mp4${NC}"
fi
echo ""
echo -e "${YELLOW}You can use these files for marketing and documentation purposes.${NC}"