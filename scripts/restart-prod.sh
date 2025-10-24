#!/bin/bash

# Script to kill any running server, rebuild, and start production server
# Usage: pnpm restart:prod

echo "🔍 Checking for processes on port 3000..."

# Find and kill any process running on port 3000
PORT_PID=$(lsof -ti:3000)

if [ -n "$PORT_PID" ]; then
  echo "⚠️  Found process $PORT_PID running on port 3000"
  echo "🔪 Killing process..."
  kill -9 $PORT_PID
  echo "✅ Process killed"
  # Give it a moment to fully terminate
  sleep 1
else
  echo "✅ No process found on port 3000"
fi

echo "🏗️  Building production bundle..."
pnpm build

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
  echo "🚀 Starting production server..."
  pnpm start
else
  echo "❌ Build failed. Server not started."
  exit 1
fi
