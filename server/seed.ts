/**
 * Seeds the database with initial data
 */
import { db } from './db';
import { users, platforms } from '@shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { sql } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function seed() {
  console.log('Starting seed process...');
  
  // Check if there are any users in the database
  const userCount = await db.select({ count: sql`count(*)` }).from(users);
  if (parseInt(userCount[0].count.toString()) > 0) {
    console.log('Database already contains users, skipping seed');
    return;
  }
  
  console.log('Creating admin user...');
  
  // Create admin user
  await db.insert(users).values({
    username: 'admin',
    email: 'mousa.baek90@gmail.com',
    password: await hashPassword('admin123'), // In production, use a more secure password
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    balance: '0',
    pendingBalance: '0'
  });
  
  console.log('Creating demo platforms...');
  
  // Create demo platforms
  const platformsData = [
    {
      name: 'Clickbank',
      type: 'affiliate',
      apiKey: 'demo_clickbank_key',
      apiSecret: 'demo_clickbank_secret',
      status: 'connected',
      healthStatus: 'healthy',
      lastSynced: new Date(),
      settings: {}
    },
    {
      name: 'Fiverr',
      type: 'freelance',
      apiKey: 'demo_fiverr_key',
      status: 'connected',
      healthStatus: 'healthy',
      lastSynced: new Date(),
      settings: {}
    },
    {
      name: 'Upwork',
      type: 'freelance',
      apiKey: 'demo_upwork_key',
      status: 'connected',
      healthStatus: 'warning',
      lastSynced: new Date(Date.now() - 3600000),
      settings: {}
    },
    {
      name: 'Amazon Associates',
      type: 'affiliate',
      apiKey: 'demo_amazon_key',
      apiSecret: 'demo_amazon_secret',
      status: 'connected',
      healthStatus: 'healthy',
      lastSynced: new Date(),
      settings: {
        associateTag: 'wolfauto-20',
        marketplace: 'US'
      }
    },
    {
      name: 'Etsy',
      type: 'affiliate',
      apiKey: 'demo_etsy_key',
      status: 'connected',
      healthStatus: 'healthy',
      lastSynced: new Date(),
      settings: {
        partnerId: 'etsy123'
      }
    }
  ];
  
  // Insert each platform individually
  for (const platform of platformsData) {
    await db.insert(platforms).values(platform);
  }
  
  console.log('Seed process completed successfully!');
}

export { seed };