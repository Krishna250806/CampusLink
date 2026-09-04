-- ====================================================================
-- CampusLink Production Supabase Database Schema & RLS Policies
-- Execute this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ====================================================================

-- DROP TABLE IF EXISTS FOR CLEAN SCHEMA INITIALIZATION
DROP TABLE IF EXISTS public.event_links CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.committees CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMMITTEES TABLE
CREATE TABLE public.committees (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  handle TEXT NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  description TEXT,
  socials JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EVENTS TABLE
CREATE TABLE public.events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  committee_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  poster_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  address TEXT,
  maps_url TEXT,
  primary_cta_text TEXT DEFAULT 'Register Now',
  primary_cta_url TEXT,
  organizer_contact JSONB DEFAULT '{}'::jsonb,
  theme_id TEXT DEFAULT 'midnight',
  custom_accent_color TEXT DEFAULT '#fafafa',
  custom_theme_config JSONB DEFAULT '{}'::jsonb,
  bg_svg_pattern TEXT,
  links JSONB DEFAULT '[]'::jsonb,
  announcements JSONB DEFAULT '[]'::jsonb,
  schedule JSONB DEFAULT '[]'::jsonb,
  rulebook JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ANNOUNCEMENTS TABLE
CREATE TABLE public.announcements (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENT LINKS TABLE
CREATE TABLE public.event_links (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'Link',
  description TEXT,
  type TEXT DEFAULT 'custom',
  featured BOOLEAN DEFAULT false,
  visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 1,
  click_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — OPEN READ & VERIFIED WRITE
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_links ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public committees viewable" ON public.committees FOR SELECT USING (true);
CREATE POLICY "Committees insert" ON public.committees FOR INSERT WITH CHECK (true);
CREATE POLICY "Committees update" ON public.committees FOR UPDATE USING (true);
CREATE POLICY "Committees delete" ON public.committees FOR DELETE USING (true);

CREATE POLICY "Public events viewable" ON public.events FOR SELECT USING (true);
CREATE POLICY "Events insert" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Events update" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Events delete" ON public.events FOR DELETE USING (true);

CREATE POLICY "Public announcements viewable" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Announcements manage" ON public.announcements FOR ALL USING (true);

CREATE POLICY "Public links viewable" ON public.event_links FOR SELECT USING (true);
CREATE POLICY "Links manage" ON public.event_links FOR ALL USING (true);
