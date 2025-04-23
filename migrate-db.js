/**
 * Database Migration Script for Wolf Auto Marketer
 * This script will initialize the database schema and add required tables
 */

import { execSync } from 'child_process';
import fs from 'fs';

// Drizzle configuration
const drizzleConfig = {
  out: './drizzle',
  schema: './shared/schema.ts',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
};

console.log('Starting database migration...');

try {
  // Create a temporary migration file that answers 'y' to all prompts
  console.log('Running force migration to handle social login fields...');
  execSync('echo "y" | npx drizzle-kit push', { stdio: 'inherit' });
  
  console.log('Migration completed successfully');
} catch (error) {
  console.error('Error during migration:', error);
  process.exit(1);
}