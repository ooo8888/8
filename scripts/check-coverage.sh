#!/bin/bash

# Check test coverage for EXITLINK OMEGA
# This script runs tests with coverage and checks if coverage meets the threshold

set -e

# Print header
echo "====================================="
echo "EXITLINK OMEGA Coverage Checker"
echo "====================================="
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "Error: This script must be run from the project root directory"
  exit 1
fi

# Define thresholds
BACKEND_THRESHOLD=80
FRONTEND_THRESHOLD=80

# Run backend tests with coverage
echo "Running backend tests with coverage..."
cd backend
npm run test:coverage

# Extract backend coverage percentage
BACKEND_COVERAGE=$(grep -A 4 "All files" coverage/coverage-summary.json | grep "lines" | grep -o '"pct":[0-9]*\.[0-9]*' | cut -d':' -f2)
echo "Backend coverage: $BACKEND_COVERAGE%"

# Run frontend tests with coverage
echo
echo "Running frontend tests with coverage..."
cd ../frontend
npm run test:coverage

# Extract frontend coverage percentage
FRONTEND_COVERAGE=$(grep -A 4 "All files" coverage/coverage-summary.json | grep "lines" | grep -o '"pct":[0-9]*\.[0-9]*' | cut -d':' -f2)
echo "Frontend coverage: $FRONTEND_COVERAGE%"

# Return to root directory
cd ..

echo
echo "====================================="
echo "Coverage Summary"
echo "====================================="
echo "Backend: $BACKEND_COVERAGE% (threshold: $BACKEND_THRESHOLD%)"
echo "Frontend: $FRONTEND_COVERAGE% (threshold: $FRONTEND_THRESHOLD%)"
echo

# Check if coverage meets thresholds
if (( $(echo "$BACKEND_COVERAGE < $BACKEND_THRESHOLD" | bc -l) )); then
  echo "Error: Backend coverage is below the threshold"
  exit 1
fi

if (( $(echo "$FRONTEND_COVERAGE < $FRONTEND_THRESHOLD" | bc -l) )); then
  echo "Error: Frontend coverage is below the threshold"
  exit 1
fi

echo "Success: Coverage meets or exceeds thresholds"
exit 0