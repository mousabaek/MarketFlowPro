/**
 * Seeds the database with initial data
 */
import { db } from './db';
import { users, platforms, platformSettings, subscriptionPlans } from '@shared/schema';
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
  
  // Create platform settings
  console.log('Creating platform settings...');
  const settingsData = [
    {
      key: "admin_email",
      value: "mousa.baek90@gmail.com",
      description: "Email address of the platform administrator"
    },
    {
      key: "default_commission_rate",
      value: "20",
      description: "Default commission rate for the platform (percentage)"
    },
    {
      key: "trial_period_days",
      value: "3",
      description: "Number of days for the free trial period"
    },
    {
      key: "min_withdrawal_amount",
      value: "50",
      description: "Minimum amount required for withdrawal requests (USD)"
    },
    {
      key: "withdrawal_processing_hours",
      value: "24",
      description: "Number of hours to process a withdrawal request"
    }
  ];
  
  for (const setting of settingsData) {
    await db.insert(platformSettings).values(setting);
  }
  
  // Create subscription plans
  console.log('Creating subscription plans...');
  const plansData = [
    {
      name: "monthly_basic",
      displayName: "Monthly Basic",
      description: "Standard monthly subscription with basic features",
      price: "39.99",
      billingCycle: "monthly",
      features: JSON.stringify([
        "Access to all platforms",
        "Up to 5 workflows",
        "Basic AI story generation",
        "Standard support"
      ]),
      maxWorkflows: 5,
      isActive: true
    },
    {
      name: "yearly_basic",
      displayName: "Annual Basic",
      description: "Standard yearly subscription with basic features (save 16%)",
      price: "399.90",
      billingCycle: "yearly",
      features: JSON.stringify([
        "Access to all platforms",
        "Up to 10 workflows",
        "Basic AI story generation",
        "Standard support",
        "Annual billing (save 16%)"
      ]),
      maxWorkflows: 10,
      isActive: true
    },
    {
      name: "premium",
      displayName: "Premium",
      description: "Premium monthly subscription with advanced features",
      price: "75.00",
      billingCycle: "monthly",
      features: JSON.stringify([
        "Access to all platforms",
        "Unlimited workflows",
        "Advanced AI story generation",
        "Priority support",
        "Custom branding options",
        "Access to beta features"
      ]),
      maxWorkflows: 999, // Effectively unlimited
      isActive: true
    }
  ];
  
  for (const plan of plansData) {
    await db.insert(subscriptionPlans).values(plan);
  }
  
  console.log('Seed process completed successfully!');
}

export { seed };