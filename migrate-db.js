#!/usr/bin/env node

/**
 * Database Migration Script for Wolf Auto Marketer
 * This script will initialize the database schema and add required tables
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Display banner
console.log('┌────────────────────────────────────────────────┐');
console.log('│ Wolf Auto Marketer - Database Migration Script │');
console.log('└────────────────────────────────────────────────┘');
console.log('');

// Check environment variables
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set.');
  console.error('Please set up a PostgreSQL database connection string in the DATABASE_URL environment variable.');
  process.exit(1);
}

// Validate drizzle config exists
const drizzleConfigPath = resolve('./drizzle.config.ts');
if (!existsSync(drizzleConfigPath)) {
  console.error('ERROR: drizzle.config.ts not found. Please ensure the file exists in the project root.');
  process.exit(1);
}

// Run the database migration
try {
  console.log('Beginning database schema migration...');
  
  console.log('Executing drizzle-kit push...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  
  console.log('');
  console.log('✅ Database migration completed successfully!');
  console.log('All tables have been created or updated according to the schema definition.');
} catch (error) {
  console.error('❌ Database migration failed with error:');
  console.error(error.message);
  process.exit(1);
}