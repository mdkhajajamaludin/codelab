-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  
-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  language VARCHAR(50) NOT NULL,
  time_estimate VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  default_code TEXT,
  tags TEXT[] DEFAULT '{}',
  hints TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  assignment_id INTEGER,
  status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed
  code TEXT,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, assignment_id)
);

-- Create admin_roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_assignment_id ON user_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Add foreign keys
ALTER TABLE assignments 
  DROP CONSTRAINT IF EXISTS fk_assignments_created_by,
  ADD CONSTRAINT fk_assignments_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_progress 
  DROP CONSTRAINT IF EXISTS fk_user_progress_user_id,
  ADD CONSTRAINT fk_user_progress_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_progress 
  DROP CONSTRAINT IF EXISTS fk_user_progress_assignment_id,
  ADD CONSTRAINT fk_user_progress_assignment_id 
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE;

ALTER TABLE admin_roles 
  DROP CONSTRAINT IF EXISTS fk_admin_roles_user_id,
  ADD CONSTRAINT fk_admin_roles_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE; 