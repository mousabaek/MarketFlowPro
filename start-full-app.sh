#!/bin/bash

# Kill any existing node processes (in Replit this should be safe)
echo "Stopping any existing node processes..."
pkill -9 node 2>/dev/null || true
sleep 1

# Start the application with proper port
echo "Starting Wolf Auto Marketer application on port 5001..."
echo "OPENAI_API_KEY is ${OPENAI_API_KEY:0:3}... (key exists)"
PORT=5001 NODE_ENV=development node start.js