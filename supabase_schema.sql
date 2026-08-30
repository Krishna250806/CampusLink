-- ====================================================================
-- CampusLink Production Supabase Database Schema & RLS Policies
-- Execute this SQL script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ====================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMMITTEES TABLE
CREATE TABLE IF NOT EXISTS public.committees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  handle TEXT NOT NULL UNIQUE,
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
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  committee_id UUID REFERENCES public.committees(id) ON DELETE CASCADE NOT NULL,
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
  bg_svg_pattern TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(committee_id, slug)
);

-- 4. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENT LINKS TABLE
CREATE TABLE IF NOT EXISTS public.event_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
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
-- ROW LEVEL SECURITY (RLS) POLICIES — ISOLATED USER WORKSPACES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_links ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- COMMITTEES POLICIES
CREATE POLICY "Public committees are viewable by everyone" ON public.committees FOR SELECT USING (true);
CREATE POLICY "Users can insert own committee" ON public.committees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own committee" ON public.committees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own committee" ON public.committees FOR DELETE USING (auth.uid() = user_id);

-- EVENTS POLICIES
CREATE POLICY "Published events viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- ANNOUNCEMENTS POLICIES
CREATE POLICY "Announcements viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Users can manage announcements for own events" ON public.announcements 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = announcements.event_id AND events.user_id = auth.uid()));

-- EVENT LINKS POLICIES
CREATE POLICY "Event links viewable by everyone" ON public.event_links FOR SELECT USING (true);
CREATE POLICY "Users can manage links for own events" ON public.event_links 
  FOR ALL USING (EXISTS (SELECT 1 FROM public.events WHERE events.id = event_links.event_id AND events.user_id = auth.uid()));

-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
