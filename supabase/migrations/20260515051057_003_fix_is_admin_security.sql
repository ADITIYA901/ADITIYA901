/*
  # Fix security issues with is_admin() function

  1. Security Changes
    - Fix mutable search_path: Set search_path = '' to prevent search path injection attacks
    - Fix SECURITY DEFINER exposure: Switch to SECURITY INVOKER — safe because RLS policies run with table owner privileges, so the function can still read the admins table
    - Revoke EXECUTE from anon and authenticated roles to prevent direct REST API access via /rest/v1/rpc/is_admin

  2. Important Notes
    1. Using CREATE OR REPLACE to preserve the function signature so dependent RLS policies are not broken
    2. SECURITY INVOKER is safe here because RLS policy evaluation runs with the table owner's privileges, not the caller's
    3. Revoking EXECUTE prevents the function from being called directly via the Supabase REST API, which could leak admin status
*/

-- Replace the function with secure version (same signature, no DROP needed)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid());
$$;

-- Revoke execute from anon and authenticated to prevent REST API access
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated;
