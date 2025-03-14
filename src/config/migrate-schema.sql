-- Migration script to update the database schema while preserving existing data

-- 1. Add role column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    END IF;
END $$;

-- 2. Update the assignments table with new columns
-- First, create a backup of the existing assignments table
CREATE TABLE IF NOT EXISTS assignments_backup AS SELECT * FROM assignments;

-- Add new columns to assignments table
ALTER TABLE assignments 
    ADD COLUMN IF NOT EXISTS language VARCHAR(50),
    ADD COLUMN IF NOT EXISTS time_estimate VARCHAR(50),
    ADD COLUMN IF NOT EXISTS points INTEGER,
    ADD COLUMN IF NOT EXISTS requirements TEXT[],
    ADD COLUMN IF NOT EXISTS default_code TEXT,
    ADD COLUMN IF NOT EXISTS tags TEXT[],
    ADD COLUMN IF NOT EXISTS hints TEXT,
    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

-- Set default values for new columns
UPDATE assignments SET 
    language = COALESCE(category, 'javascript'),
    time_estimate = '30 minutes',
    points = 50,
    requirements = '{}',
    default_code = '',
    tags = ARRAY[COALESCE(category, 'javascript')],
    hints = '';

-- Make sure description is not null
UPDATE assignments SET description = content WHERE description IS NULL OR description = '';

-- Make difficulty consistent
UPDATE assignments SET difficulty = 'Medium' WHERE difficulty IS NULL OR difficulty = '';

-- 3. Update the user_progress table with new columns
ALTER TABLE user_progress 
    ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

-- 4. Update the admin_roles table
-- First, create a backup of the existing admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles_backup AS SELECT * FROM admin_roles;

-- Add role column to admin_roles if it doesn't exist
ALTER TABLE admin_roles 
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';

-- Update the unique constraint
ALTER TABLE admin_roles DROP CONSTRAINT IF EXISTS admin_roles_user_id_key;
ALTER TABLE admin_roles ADD CONSTRAINT admin_roles_user_id_role_key UNIQUE (user_id, role);

-- 5. Create new indexes
DROP INDEX IF EXISTS idx_assignments_created_by;
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);

-- 6. Make columns NOT NULL where required
ALTER TABLE assignments 
    ALTER COLUMN description SET NOT NULL,
    ALTER COLUMN difficulty SET NOT NULL,
    ALTER COLUMN language SET NOT NULL,
    ALTER COLUMN time_estimate SET NOT NULL,
    ALTER COLUMN points SET NOT NULL;

-- 7. Log the migration results
SELECT 'Migration completed successfully' AS status;
SELECT COUNT(*) AS assignments_count FROM assignments;
SELECT COUNT(*) AS users_count FROM users;
SELECT COUNT(*) AS user_progress_count FROM user_progress;
SELECT COUNT(*) AS admin_roles_count FROM admin_roles; 