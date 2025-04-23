/**
 * Script to apply subscription system migration directly with SQL
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

async function createAdminUser() {
  try {
    // Check if admin user exists
    const result = await pool.query(`
      SELECT * FROM users WHERE email = 'mousa.baek90@gmail.com' LIMIT 1
    `);
    
    if (result.rowCount === 0) {
      console.log('Creating admin user: mousa.baek90@gmail.com');
      
      // Generate a random temporary password (user will change this)
      const tempPassword = `admin${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Insert admin user
      await pool.query(`
        INSERT INTO users (
          username, 
          email, 
          password, 
          role, 
          first_name, 
          last_name, 
          commission_rate,
          subscription_status
        ) VALUES (
          'admin', 
          'mousa.baek90@gmail.com', 
          $1, 
          'admin', 
          'Mousa', 
          'Administrator',
          0,  -- 0% commission rate for admin (keeps 100%)
          'active'
        )
      `, [tempPassword]);
      
      console.log(`Admin user created with temporary password: ${tempPassword}`);
      console.log('Please change this password after first login.');
    } else {
      console.log('Admin user already exists, updating role and permissions');
      
      // Ensure the existing user has admin privileges
      await pool.query(`
        UPDATE users 
        SET role = 'admin', 
            commission_rate = 0,
            subscription_status = 'active'
        WHERE email = 'mousa.baek90@gmail.com'
      `);
    }
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
    throw error;
  }
}

async function applyMigration() {
  try {
    console.log('Starting subscription system migration...');
    const sql = fs.readFileSync('./add-subscription-system.sql', 'utf8');
    
    await pool.query(sql);
    console.log('Subscription system tables and data created');
    
    // Create or update admin user
    await createAdminUser();
    
    console.log('Migration completed successfully');
    await pool.end();
  } catch (error) {
    console.error('Error during migration:', error);
    await pool.end();
    process.exit(1);
  }
}

applyMigration();