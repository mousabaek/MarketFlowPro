-- Add subscription-related fields to users table
ALTER TABLE users 
ADD COLUMN subscription_status TEXT DEFAULT 'none', -- 'none', 'trial', 'active', 'cancelled', 'expired'
ADD COLUMN subscription_plan TEXT, -- 'monthly', 'yearly', 'premium'
ADD COLUMN subscription_start_date TIMESTAMP,
ADD COLUMN subscription_end_date TIMESTAMP,
ADD COLUMN trial_used BOOLEAN DEFAULT FALSE,
ADD COLUMN commission_rate DECIMAL(5, 2) DEFAULT 80.00, -- User keeps 80% by default, platform takes 20%
ADD COLUMN max_workflows INTEGER; -- Limit based on subscription plan

-- Create subscriptions table to track subscription history
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'trial', 'active', 'cancelled', 'expired'
  plan TEXT NOT NULL, -- 'monthly', 'yearly', 'premium'
  amount DECIMAL(10, 2) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  stripe_subscription_id TEXT,
  payment_method_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create table for subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL, -- 'monthly', 'yearly'
  features JSONB NOT NULL DEFAULT '{}',
  max_workflows INTEGER NOT NULL,
  max_platforms INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, price, billing_cycle, features, max_workflows, max_platforms)
VALUES 
('monthly_basic', 'Monthly Basic', 39.99, 'monthly', 
  '{"description": "Basic access to platform features", "prioritySupport": false, "aiContentGeneration": true, "advancedAnalytics": false}', 
  5, 3),
('yearly_basic', 'Annual Basic', 399.90, 'yearly', 
  '{"description": "Basic access to platform features with 16% discount", "prioritySupport": false, "aiContentGeneration": true, "advancedAnalytics": false}', 
  5, 3),
('monthly_premium', 'Monthly Premium', 75.00, 'monthly', 
  '{"description": "Premium access with advanced features", "prioritySupport": true, "aiContentGeneration": true, "advancedAnalytics": true, "priorityMatching": true}', 
  15, 10);

-- Create settings table for global platform settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert platform settings
INSERT INTO platform_settings (key, value, description)
VALUES 
('default_commission_rate', '20', 'Default platform commission rate (%)'),
('trial_period_days', '3', 'Free trial period in days'),
('admin_email', 'mousa.baek90@gmail.com', 'Administrator email address');