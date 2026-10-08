-- ==============================================================================
-- PHỞ THÌN BỜ HỒ (EST. 1955) - SUPABASE PRODUCTION DATABASE SCHEMA & POLICIES
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DISHES TABLE (Thực đơn món ăn)
CREATE TABLE IF NOT EXISTS public.dishes (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('pho', 'drinks', 'others')),
  name JSONB NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  formatted_price TEXT NOT NULL,
  image TEXT NOT NULL,
  short_description JSONB NOT NULL,
  full_description JSONB NOT NULL,
  ingredients JSONB NOT NULL,
  is_signature BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  preparation_note JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BRANCHES TABLE (Hệ thống 4 cơ sở)
CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name JSONB NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  phone TEXT NOT NULL,
  opening_hours TEXT NOT NULL,
  morning_slot TEXT NOT NULL,
  afternoon_slot TEXT NOT NULL,
  map_embed_url TEXT NOT NULL,
  google_maps_link TEXT NOT NULL,
  highlight JSONB NOT NULL,
  is_original BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ARTICLES TABLE (Tin tức & Di sản)
CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  title JSONB NOT NULL,
  excerpt JSONB NOT NULL,
  content JSONB NOT NULL,
  date TEXT NOT NULL,
  read_time TEXT NOT NULL,
  category JSONB NOT NULL,
  image TEXT NOT NULL,
  author TEXT NOT NULL,
  is_hero_article BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RESERVATIONS TABLE (Đơn đặt bàn trực tuyến & tại quầy)
CREATE TABLE IF NOT EXISTS public.reservations (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TEXT NOT NULL,
  party_size INTEGER NOT NULL DEFAULT 2,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
  branch_name TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  is_walk_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. INQUIRIES & RECRUITMENT TABLE (Liên hệ & Tuyển dụng)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('inquiry', 'recruitment')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  position TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SECURITY LOGS TABLE (Nhật ký bảo mật & truy cập)
CREATE TABLE IF NOT EXISTS public.security_logs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  details TEXT NOT NULL,
  device TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. ADMIN PROFILES TABLE (Phân quyền quản trị viên)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'manager', 'staff')),
  pin_code TEXT DEFAULT '195570',
  session_timeout_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Authenticated user checking against admin_profiles
  IF (auth.uid() IS NOT NULL) THEN
    RETURN EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'manager')
    );
  END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DISHES POLICIES:
DROP POLICY IF EXISTS "Public can view active dishes" ON public.dishes;
CREATE POLICY "Public can view active dishes" ON public.dishes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert dishes" ON public.dishes;
CREATE POLICY "Admins can insert dishes" ON public.dishes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admins can update dishes" ON public.dishes;
CREATE POLICY "Admins can update dishes" ON public.dishes
  FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Admins can delete dishes" ON public.dishes;
CREATE POLICY "Admins can delete dishes" ON public.dishes
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- BRANCHES POLICIES:
DROP POLICY IF EXISTS "Public can view branches" ON public.branches;
CREATE POLICY "Public can view branches" ON public.branches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can modify branches" ON public.branches;
CREATE POLICY "Admins can modify branches" ON public.branches
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ARTICLES POLICIES:
DROP POLICY IF EXISTS "Public can view articles" ON public.articles;
CREATE POLICY "Public can view articles" ON public.articles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can modify articles" ON public.articles;
CREATE POLICY "Admins can modify articles" ON public.articles
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- RESERVATIONS POLICIES:
DROP POLICY IF EXISTS "Anyone can create reservation" ON public.reservations;
CREATE POLICY "Anyone can create reservation" ON public.reservations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view reservations" ON public.reservations;
CREATE POLICY "Admins can view reservations" ON public.reservations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update reservations" ON public.reservations;
CREATE POLICY "Admins can update reservations" ON public.reservations
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can delete reservations" ON public.reservations;
CREATE POLICY "Admins can delete reservations" ON public.reservations
  FOR DELETE USING (true);

-- INQUIRIES POLICIES:
DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit inquiry" ON public.inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view inquiries" ON public.inquiries;
CREATE POLICY "Admins can view inquiries" ON public.inquiries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
CREATE POLICY "Admins can update inquiries" ON public.inquiries
  FOR UPDATE USING (true);

-- SECURITY LOGS POLICIES:
DROP POLICY IF EXISTS "Allow logging and reading logs" ON public.security_logs;
CREATE POLICY "Allow logging and reading logs" ON public.security_logs
  FOR ALL USING (true);

-- ADMIN PROFILES POLICIES:
DROP POLICY IF EXISTS "Admin profile self-access" ON public.admin_profiles;
CREATE POLICY "Admin profile self-access" ON public.admin_profiles
  FOR ALL USING (auth.uid() = id);

-- ==============================================================================
-- STORAGE CONFIGURATION (pho-thin-assets)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pho-thin-assets', 'pho-thin-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view pho-thin-assets" ON storage.objects;
CREATE POLICY "Public can view pho-thin-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'pho-thin-assets');

DROP POLICY IF EXISTS "Anyone can upload to pho-thin-assets" ON storage.objects;
CREATE POLICY "Anyone can upload to pho-thin-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pho-thin-assets');

DROP POLICY IF EXISTS "Anyone can update objects in pho-thin-assets" ON storage.objects;
CREATE POLICY "Anyone can update objects in pho-thin-assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'pho-thin-assets');

DROP POLICY IF EXISTS "Anyone can delete objects in pho-thin-assets" ON storage.objects;
CREATE POLICY "Anyone can delete objects in pho-thin-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'pho-thin-assets');
