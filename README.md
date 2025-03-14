# CodeLearn Backend

Backend server for the CodeLearn application, built with Node.js, Express, and PostgreSQL.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgres://your-neon-connection-string
   PORT=5000
   ```

3. Initialize the database, run migrations, and fix any data issues:
   ```
   npm run setup-db
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Database Schema

The database consists of the following tables:

### Users
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Assignments
```sql
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
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Progress
```sql
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'not_started',
  code TEXT,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, assignment_id)
);
```

### Admin Roles
```sql
CREATE TABLE IF NOT EXISTS admin_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role)
);
```

## API Endpoints

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get assignment by ID
- `POST /api/assignments` - Create a new assignment (admin only)
- `PUT /api/assignments/:id` - Update an assignment (admin only)
- `DELETE /api/assignments/:id` - Delete an assignment (admin only)

### User Progress
- `GET /api/progress` - Get progress for current user
- `GET /api/progress/:assignmentId` - Get progress for a specific assignment
- `POST /api/progress` - Update progress for an assignment

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id/role` - Update user role (admin only)

## Troubleshooting

If you encounter issues with the database, you can run the following commands:

- Initialize the database: `npm run init-db`
- Migrate the schema: `npm run migrate`
- Fix data issues: `npm run fix-data`
- Complete setup: `npm run setup-db`

## Migrating from Old Schema

If you're migrating from the old schema to the new one, the migration script will:

1. Add the `role` column to the `users` table
2. Update the `assignments` table with new columns:
   - `language` (derived from `category`)
   - `time_estimate`
   - `points`
   - `requirements`
   - `default_code`
   - `tags`
   - `hints`
   - `created_by`
3. Add the `score` column to the `user_progress` table
4. Update the `admin_roles` table with a `role` column
5. Create new indexes for performance

The migration preserves all existing data while adding the new structure.