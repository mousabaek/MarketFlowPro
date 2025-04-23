import crypto from 'crypto';
import { promisify } from 'util';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

async function updateUserPassword() {
  const email = 'mousa.baek90@gmail.com';
  const newPassword = 'MousaBaek90Wolf';
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log(`Updating password for user with email: ${email}`);
    
    // Hash the password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the password in the database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, username, email',
      [hashedPassword, email]
    );
    
    if (result.rowCount > 0) {
      console.log('Password updated successfully for user:', result.rows[0]);
    } else {
      console.log('No user found with email:', email);
    }
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await pool.end();
  }
}

updateUserPassword().catch(console.error);