#!/bin/bash

# Run tests for EXITLINK OMEGA
# This script runs all tests for both backend and frontend

set -e

# Print header
echo "====================================="
echo "EXITLINK OMEGA Test Runner"
echo "====================================="
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: This script must be run from the project root directory"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "$1" == "--install" ]; then
  echo "Installing dependencies..."
  npm run install:all
fi

# Run backend tests
echo
echo "====================================="
echo "Running Backend Tests"
echo "====================================="
echo
cd backend
npm test

# Run frontend tests
echo
echo "====================================="
echo "Running Frontend Tests"
echo "====================================="
echo
cd ../frontend
npm test

# Return to root directory
cd ..

echo
echo "====================================="
echo "All tests completed!"
echo "====================================="