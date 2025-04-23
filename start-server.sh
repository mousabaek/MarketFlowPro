#!/bin/bash
export PORT=5001
export NODE_ENV=development
echo "Starting server with debugging..."
echo "OPENAI_API_KEY is ${OPENAI_API_KEY:0:3}... (key exists)"
node --trace-warnings start.js