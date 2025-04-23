-- Add social login fields to users table if they don't exist
DO $$
BEGIN
    -- Check if columns exist before adding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='google_id') THEN
        ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='github_id') THEN
        ALTER TABLE users ADD COLUMN github_id TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='apple_id') THEN
        ALTER TABLE users ADD COLUMN apple_id TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='provider') THEN
        ALTER TABLE users ADD COLUMN provider TEXT;
    END IF;
    
    -- Make password field nullable for social logins
    ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
END $$;