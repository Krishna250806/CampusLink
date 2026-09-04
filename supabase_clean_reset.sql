-- ====================================================================
-- CampusLink Complete Database & Authentication Reset Script
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ====================================================================

-- 1. CLEAR ALL APPLICATION TABLES (CASCADE CLEANS FOREIGN KEYS)
TRUNCATE TABLE public.event_links CASCADE;
TRUNCATE TABLE public.announcements CASCADE;
TRUNCATE TABLE public.events CASCADE;
TRUNCATE TABLE public.committees CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 2. CLEAR ALL AUTH USERS (REMOVES ALL LOGGED-IN GMAIL / EMAIL ACCOUNTS)
-- This removes all testing identities, sessions, and OAuth records
DELETE FROM auth.users;

-- 3. VERIFY CLEAN STATE
SELECT 
  (SELECT count(*) FROM public.events) AS total_events,
  (SELECT count(*) FROM public.committees) AS total_committees,
  (SELECT count(*) FROM public.profiles) AS total_profiles,
  (SELECT count(*) FROM auth.users) AS total_auth_users;
