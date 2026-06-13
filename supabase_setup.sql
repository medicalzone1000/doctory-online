-- ══════════════════════════════════════════════════════════
--  MEDICORE PLATFORM — Supabase Database Setup
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ══════════════════════════════════════════════════════════

-- ─── 1. PROFILES TABLE (extends auth.users) ────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin')),
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. ARTICLES TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  excerpt      TEXT,
  content      TEXT NOT NULL,
  cover_url    TEXT,
  category     TEXT NOT NULL DEFAULT 'general'
               CHECK (category IN ('cardiology','neurology','oncology','pediatrics',
                                   'dermatology','orthopedics','psychiatry','nutrition','general')),
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'published', 'archived')),
  author_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  views        INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. AUTO-CREATE PROFILE ON SIGNUP ─────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 4. AUTO-UPDATE updated_at ─────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS articles_updated_at ON public.articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 5. ROW LEVEL SECURITY ─────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, self-update only
CREATE POLICY "profiles_public_read"  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_update"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('editor','admin')
  );
$$;

-- Articles: anyone reads published, editors/admins manage
CREATE POLICY "articles_public_read"
  ON public.articles FOR SELECT
  USING (status = 'published' OR auth.uid() = author_id OR public.is_admin());

CREATE POLICY "articles_editor_insert"
  ON public.articles FOR INSERT
  WITH CHECK (public.is_editor());

CREATE POLICY "articles_editor_update"
  ON public.articles FOR UPDATE
  USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "articles_admin_delete"
  ON public.articles FOR DELETE
  USING (public.is_admin());

-- Admins can manage all profiles
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- ─── 6. STORAGE BUCKET FOR IMAGES ──────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-covers', 'article-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "article_covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-covers');

CREATE POLICY "article_covers_editor_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'article-covers' AND public.is_editor());

CREATE POLICY "article_covers_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'article-covers' AND public.is_admin());

-- ─── 7. FIRST ADMIN USER (run after signing up) ────────────
-- After you register with your email, run this to make yourself admin:
-- UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();


-- ─── 8. INCREMENT VIEWS RPC ────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_views(article_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.articles SET views = views + 1 WHERE id = article_id;
$$;
