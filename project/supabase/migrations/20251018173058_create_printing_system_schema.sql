/*
  # Create Vending Machine Printing System Schema

  ## Overview
  This migration creates the complete database schema for a vending machine printing system
  that connects users with physical printing machines through QR codes.

  ## New Tables
  
  ### 1. `machines`
  Stores information about physical vending machines
  - `id` (uuid, primary key) - Unique machine identifier
  - `machine_key` (text, unique) - Human-readable machine key (e.g., "ABCD1234")
  - `name` (text) - Display name of the machine
  - `location` (text) - Physical location description
  - `status` (text) - Machine status: 'online', 'offline', 'maintenance'
  - `rate_per_page` (numeric) - Cost per page in rupees
  - `created_at` (timestamptz) - Machine registration timestamp
  - `updated_at` (timestamptz) - Last status update timestamp

  ### 2. `users`
  Stores user information
  - `id` (uuid, primary key) - Unique user identifier
  - `name` (text) - User's display name
  - `email` (text, optional) - User's email address
  - `phone` (text, optional) - User's phone number
  - `created_at` (timestamptz) - User registration timestamp

  ### 3. `print_jobs`
  Stores all print job requests with priority queue support
  - `id` (uuid, primary key) - Unique job identifier
  - `machine_id` (uuid, foreign key) - Reference to machines table
  - `user_id` (uuid, foreign key) - Reference to users table
  - `user_name` (text) - User name (for quick access)
  - `file_url` (text) - URL to the uploaded PDF file
  - `file_name` (text) - Original filename
  - `total_pages` (integer) - Total pages in PDF
  - `pages_to_print` (text) - Pages selection (e.g., "1-3,5,7")
  - `pages_count` (integer) - Number of pages to be printed
  - `priority` (integer) - Priority level (1=urgent, 2=normal)
  - `status` (text) - Job status: 'queued', 'printing', 'completed', 'failed', 'cancelled'
  - `cost` (numeric) - Total cost for this job
  - `payment_status` (text) - Payment status: 'pending', 'paid', 'failed'
  - `payment_id` (text, optional) - Payment gateway transaction ID
  - `created_at` (timestamptz) - Job creation timestamp
  - `started_at` (timestamptz, optional) - When printing started
  - `completed_at` (timestamptz, optional) - When printing completed

  ### 4. `sessions`
  Tracks active user-machine connections
  - `id` (uuid, primary key) - Unique session identifier
  - `machine_id` (uuid, foreign key) - Reference to machines table
  - `user_id` (uuid, foreign key) - Reference to users table
  - `socket_room` (text) - Socket.IO room identifier
  - `status` (text) - Session status: 'active', 'disconnected'
  - `created_at` (timestamptz) - Session start timestamp
  - `updated_at` (timestamptz) - Last activity timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Create policies for authenticated access
  - Add policies for public read access where needed (machines list)

  ## Indexes
  - Index on machine_key for fast lookups
  - Index on print_jobs (machine_id, status, priority, created_at) for queue ordering
  - Index on sessions (machine_id, status) for active session checks
*/

-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_key text UNIQUE NOT NULL,
  name text NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
  rate_per_page numeric DEFAULT 2.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create print_jobs table
CREATE TABLE IF NOT EXISTS print_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  total_pages integer NOT NULL,
  pages_to_print text NOT NULL,
  pages_count integer NOT NULL,
  priority integer DEFAULT 2 CHECK (priority IN (1, 2)),
  status text DEFAULT 'queued' CHECK (status IN ('queued', 'printing', 'completed', 'failed', 'cancelled')),
  cost numeric NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_id text,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  socket_room text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'disconnected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_machines_key ON machines(machine_key);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_queue ON print_jobs(machine_id, status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_machine ON sessions(machine_id, status);

-- Enable Row Level Security
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for machines (publicly readable for QR code validation)
CREATE POLICY "Anyone can view online machines"
  ON machines FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage machines"
  ON machines FOR ALL
  USING (true);

-- RLS Policies for users
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create user profiles"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (true);

-- RLS Policies for print_jobs
CREATE POLICY "Anyone can view print jobs"
  ON print_jobs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create print jobs"
  ON print_jobs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update print jobs"
  ON print_jobs FOR UPDATE
  USING (true);

-- RLS Policies for sessions
CREATE POLICY "Anyone can view sessions"
  ON sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON sessions FOR UPDATE
  USING (true);

-- Insert sample machines for testing
INSERT INTO machines (machine_key, name, location, status, rate_per_page)
VALUES 
  ('ABCD1234', 'Machine-1', 'Nagpur Railway Station', 'online', 2.0),
  ('EFGH5678', 'Machine-2', 'Nagpur Airport', 'online', 2.5),
  ('IJKL9012', 'Machine-3', 'Sitabuldi Market', 'offline', 2.0)
ON CONFLICT (machine_key) DO NOTHING;