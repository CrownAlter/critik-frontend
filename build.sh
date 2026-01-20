#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Run the Angular build
npm run build

# Inject API_BASE_URL into compiled files
# If API_BASE_URL is not set, use a default value
API_URL=${API_BASE_URL:-https://critik-backend.onrender.com}

echo "Injecting API_BASE_URL: $API_URL"

# Find all JS files in the browser output directory and replace the placeholder
find dist/critik-frontend/browser -name "*.js" -exec sed -i "s|API_BASE_URL_PLACEHOLDER|$API_URL|g" {} +

echo "Build and injection complete!"
