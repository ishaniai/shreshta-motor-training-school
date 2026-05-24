-- Shreshta Motor Training School — users table
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- Extensions (usually enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Training interest enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'training_interest_type') THEN
    CREATE TYPE public.training_interest_type AS ENUM (
      '2 Wheeler',
      '4 Wheeler',
      'Both'
    );
  END IF;
END$$;

-- Users table (custom registration; password_hash set by backend in step 2)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  has_driving_license BOOLEAN NOT NULL DEFAULT FALSE,
  driving_license_number TEXT,
  driving_license_country TEXT,
  training_interest public.training_interest_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_username_unique UNIQUE (username),
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_license_fields_consistency CHECK (
    (has_driving_license = FALSE AND driving_license_number IS NULL AND driving_license_country IS NULL)
    OR
    (has_driving_license = TRUE AND driving_license_number IS NOT NULL AND driving_license_country IS NOT NULL)
  ),
  CONSTRAINT users_minimum_age CHECK (
    date_of_birth <= (CURRENT_DATE - INTERVAL '18 years')
  )
);

-- Indexes for login and username lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users (created_at DESC);

COMMENT ON TABLE public.users IS 'Registered trainees — Shreshta Motor Training School';
COMMENT ON COLUMN public.users.password_hash IS 'bcrypt hash; never expose to client';

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 2+: tighten policies; backend uses service_role for insert/login.
-- Anonymous clients must not read password_hash.

-- Allow checking username availability (returns only whether taken — via RPC in step 2)
CREATE OR REPLACE FUNCTION public.is_username_taken(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE lower(u.username) = lower(trim(p_username))
  );
$$;

REVOKE ALL ON FUNCTION public.is_username_taken(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_username_taken(TEXT) TO anon, authenticated, service_role;

-- Deny direct table access from anon/authenticated by default (no policies = deny)
-- Service role (Express backend) bypasses RLS for registration and login.

-- Optional: read-only view without password for admin dashboards (future)
CREATE OR REPLACE VIEW public.users_public AS
SELECT
  id,
  full_name,
  username,
  contact_number,
  email,
  address_line_1,
  address_line_2,
  city,
  state,
  date_of_birth,
  has_driving_license,
  driving_license_number,
  driving_license_country,
  training_interest,
  created_at
FROM public.users;

COMMENT ON VIEW public.users_public IS 'No password_hash — use for safe reporting only';
