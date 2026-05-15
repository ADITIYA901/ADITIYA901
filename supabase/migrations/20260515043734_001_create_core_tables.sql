/*
  # Create Core Tables for BlockVote System

  1. New Tables
    - `admins` - Admin user profiles with role-based access
      - `id` (uuid, PK, references auth.users)
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `role` (text, default 'admin')
      - `created_at` (timestamptz, default now())
    - `voters` - Voter user profiles with identity verification
      - `id` (uuid, PK, references auth.users)
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `aadhaar_id` (text, unique)
      - `wallet_address` (text, nullable)
      - `is_verified` (boolean, default false)
      - `is_approved` (boolean, default false)
      - `created_at` (timestamptz, default now())
    - `elections` - Election records with scheduling
      - `id` (uuid, PK)
      - `title` (text, not null)
      - `description` (text)
      - `start_date` (timestamptz, not null)
      - `end_date` (timestamptz, not null)
      - `status` (text, default 'upcoming')
      - `created_by` (uuid, references admins)
      - `created_at` (timestamptz, default now())
    - `candidates` - Candidate profiles per election
      - `id` (uuid, PK)
      - `election_id` (uuid, references elections)
      - `name` (text, not null)
      - `party` (text)
      - `symbol_url` (text)
      - `photo_url` (text)
      - `description` (text)
      - `created_at` (timestamptz, default now())
    - `votes` - Immutable vote records with blockchain data
      - `id` (uuid, PK)
      - `election_id` (uuid, references elections)
      - `candidate_id` (uuid, references candidates)
      - `voter_id` (uuid, references voters)
      - `tx_hash` (text, not null)
      - `block_number` (bigint)
      - `timestamp` (timestamptz, default now())
    - `announcements` - System announcements
      - `id` (uuid, PK)
      - `election_id` (uuid, nullable, references elections)
      - `title` (text, not null)
      - `message` (text, not null)
      - `created_by` (uuid, references admins)
      - `created_at` (timestamptz, default now())
    - `audit_logs` - System audit trail
      - `id` (uuid, PK)
      - `user_id` (uuid)
      - `user_type` (text)
      - `action` (text, not null)
      - `details` (text)
      - `timestamp` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Admins can manage all data
    - Voters can read elections/candidates, insert votes, read own data
    - Unique constraint on votes: one vote per voter per election

  3. Important Notes
    1. The `votes` table has a unique constraint on (election_id, voter_id) to prevent duplicate voting
    2. All tables use gen_random_uuid() for primary keys
    3. RLS policies are restrictive by default - no access until explicitly granted
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Create voters table
CREATE TABLE IF NOT EXISTS voters (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  aadhaar_id text UNIQUE,
  wallet_address text,
  is_verified boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create elections table
CREATE TABLE IF NOT EXISTS elections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name text NOT NULL,
  party text DEFAULT '',
  symbol_url text DEFAULT '',
  photo_url text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create votes table with duplicate vote prevention
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES elections(id),
  candidate_id uuid NOT NULL REFERENCES candidates(id),
  voter_id uuid NOT NULL REFERENCES voters(id),
  tx_hash text NOT NULL,
  block_number bigint DEFAULT 0,
  timestamp timestamptz DEFAULT now(),
  UNIQUE(election_id, voter_id)
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid REFERENCES elections(id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  created_by uuid REFERENCES admins(id),
  created_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_type text NOT NULL DEFAULT 'admin',
  action text NOT NULL,
  details text DEFAULT '',
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_election ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_announcements_election ON announcements(election_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can read own data"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update own data"
  ON admins FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Voter policies
CREATE POLICY "Voters can read own data"
  ON voters FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Voters can update own data"
  ON voters FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Elections: anyone authenticated can read
CREATE POLICY "Authenticated users can read elections"
  ON elections FOR SELECT
  TO authenticated
  USING (true);

-- Candidates: anyone authenticated can read
CREATE POLICY "Authenticated users can read candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (true);

-- Votes: voters can read own votes, insert own votes
CREATE POLICY "Voters can read own votes"
  ON votes FOR SELECT
  TO authenticated
  USING (auth.uid() = voter_id);

CREATE POLICY "Voters can insert own vote"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

-- Announcements: anyone authenticated can read
CREATE POLICY "Authenticated users can read announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

-- Audit logs: anyone authenticated can read
CREATE POLICY "Authenticated users can read audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Admin-only policies for write operations
CREATE POLICY "Admins can manage elections"
  ON elections FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update elections"
  ON elections FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage candidates"
  ON candidates FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update candidates"
  ON candidates FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete candidates"
  ON candidates FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can read all voters
CREATE POLICY "Admins can read all voters"
  ON voters FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update voters"
  ON voters FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can read all votes
CREATE POLICY "Admins can read all votes"
  ON votes FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can read all admins
CREATE POLICY "Admins can read all admins"
  ON admins FOR SELECT
  TO authenticated
  USING (is_admin());
