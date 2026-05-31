#!/bin/bash
set -e

echo "Building MDNotes with Vite..."

# Use node directly instead of npx to avoid permission issues
node ./node_modules/vite/bin/vite.js build

echo "Build completed successfully!"
