#!/usr/bin/env node

/**
 * Enhanced startup script for Wolf Auto Marketer in Replit environment
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables
process.env.PORT = process.env.PORT || '5001';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log('┌───────────────────────────────────────────┐');
console.log('│ Wolf Auto Marketer - Application Launcher │');
console.log('└───────────────────────────────────────────┘');
console.log('');

console.log('Starting Wolf Auto Marketer application...');
console.log(`Server will be available on port ${process.env.PORT}`);
console.log(`NODE_ENV is set to: ${process.env.NODE_ENV}`);

// Check for database connection
if (!process.env.DATABASE_URL) {
  console.warn('Warning: DATABASE_URL is not set. Database functionality may not work properly.');
} else {
  console.log('Database connection string is configured properly.');
}

// Check for OpenAI API key
if (process.env.OPENAI_API_KEY) {
  const maskedKey = process.env.OPENAI_API_KEY.substring(0, 3) + '...' + 
                   process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4);
  console.log(`OPENAI_API_KEY is set: ${maskedKey}`);
} else {
  console.warn('Warning: OPENAI_API_KEY is not set. AI features will not work.');
}

// Use npx tsx to run the server
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const serverProcess = spawn(npx, ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server process:', err);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code}`);
    process.exit(code);
  }
});

// Handle signals to gracefully shut down
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    serverProcess.kill(signal);
  });
});

console.log('Server process started.');