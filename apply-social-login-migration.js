/**
 * Script to apply social login migration directly with SQL
 * This avoids the interactive prompts from Drizzle
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';

// Configure Neon to use the WebSocket constructor
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Create a database pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function applyMigration() {
  try {
    console.log('Starting social login migration...');
    const sql = fs.readFileSync('./add-social-login-fields.sql', 'utf8');
    
    await pool.query(sql);
    
    console.log('Migration completed successfully');
    await pool.end();
  } catch (error) {
    console.error('Error during migration:', error);
    await pool.end();
    process.exit(1);
  }
}

applyMigration();