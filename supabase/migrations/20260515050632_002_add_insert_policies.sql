/*
  # Add INSERT policies for voters and admins tables

  1. Security Changes
    - Add INSERT policy on `voters` table: authenticated users can insert a row where their auth.uid() matches the id column
    - Add INSERT policy on `admins` table: authenticated users can insert a row where their auth.uid() matches the id column

  2. Important Notes
    1. These policies are required for the signup flow — when a new admin or voter registers, they need to insert their own profile row
    2. The WITH CHECK clause ensures users can only insert rows where the id matches their own auth.uid(), preventing impersonation
*/

-- Allow voters to insert their own profile during signup
CREATE POLICY "Voters can insert own data"
  ON voters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow admins to insert their own profile during signup
CREATE POLICY "Admins can insert own data"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
