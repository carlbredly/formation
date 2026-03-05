-- ============================================================
-- Mobutu Academy – Script SQL complet (Supabase)
-- Exécuter dans l’ordre dans l’éditeur SQL Supabase (SQL Editor).
-- Pour une base vierge : exécuter ce fichier en entier.
-- ============================================================

-- ---------------------------------------------------------------------------
-- 1) FONCTION : mise à jour automatique de updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 2) TABLE : courses (schéma final : titre, prix, miniature, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  price NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  youtube_video_id TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS courses_created_at_idx ON courses(created_at DESC);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read courses"
  ON courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert courses"
  ON courses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update courses"
  ON courses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete courses"
  ON courses FOR DELETE TO authenticated USING (true);

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 3) ADMIN : comment ajouter un admin
-- ---------------------------------------------------------------------------
-- Méthode recommandée : Authentication > Users > Edit user > User Metadata : {"role": "admin"}
-- Ou en SQL (remplacer l’email) :
-- UPDATE auth.users SET raw_user_meta_data = jsonb_build_object('role', 'admin') WHERE email = 'votre@email.com';

-- ---------------------------------------------------------------------------
-- 4) TABLES : programme d’affiliation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id)
);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliate sees own row"
  ON affiliates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "User can become affiliate"
  ON affiliates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Codes promo
CREATE TABLE IF NOT EXISTS affiliate_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (code)
);

ALTER TABLE affiliate_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliate sees own codes"
  ON affiliate_codes FOR SELECT TO authenticated
  USING (affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid()));
CREATE POLICY "Affiliate can create codes"
  ON affiliate_codes FOR INSERT TO authenticated
  WITH CHECK (affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid()));

-- Ventes affiliation
CREATE TABLE IF NOT EXISTS affiliate_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_code_id UUID NOT NULL REFERENCES affiliate_codes(id) ON DELETE CASCADE,
  buyer_user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  amount NUMERIC(10, 2) NOT NULL,
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.15,
  commission_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE affiliate_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliate sees own sales"
  ON affiliate_sales FOR SELECT TO authenticated
  USING (
    affiliate_code_id IN (
      SELECT ac.id FROM affiliate_codes ac
      JOIN affiliates a ON a.id = ac.affiliate_id
      WHERE a.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 5) TABLE : course_lessons (leçons avec description, YouTube, ressources)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  content_url TEXT,
  youtube_video_id TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS course_lessons_course_id_idx ON course_lessons(course_id);

DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON course_lessons;
CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON course_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read lessons"
  ON course_lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert lessons"
  ON course_lessons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update lessons"
  ON course_lessons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete lessons"
  ON course_lessons FOR DELETE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 6) TABLE : course_enrollments (inscriptions + code d’accès 3 mois)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  access_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS course_enrollments_user_course_idx ON course_enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS course_enrollments_access_code_idx ON course_enrollments(access_code);
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User sees own enrollments"
  ON course_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can insert enrollments"
  ON course_enrollments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update enrollments"
  ON course_enrollments FOR UPDATE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 7) TABLE : course_progress (avancement par leçon)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS course_progress_enrollment_idx ON course_progress(enrollment_id);
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User sees own progress"
  ON course_progress FOR SELECT TO authenticated
  USING (enrollment_id IN (SELECT id FROM course_enrollments WHERE user_id = auth.uid()));
CREATE POLICY "User can insert own progress"
  ON course_progress FOR INSERT TO authenticated
  WITH CHECK (enrollment_id IN (SELECT id FROM course_enrollments WHERE user_id = auth.uid()));
CREATE POLICY "User can update own progress"
  ON course_progress FOR UPDATE TO authenticated
  USING (enrollment_id IN (SELECT id FROM course_enrollments WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 8) TABLE : course_payments (paiements Zelle / MonCash + preuve)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('zelle', 'moncash', 'other')),
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS course_payments_status_idx ON course_payments(status);
ALTER TABLE course_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User sees own payments"
  ON course_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "User can insert own payments"
  ON course_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can update payments"
  ON course_payments FOR UPDATE TO authenticated USING (true);

-- ---------------------------------------------------------------------------
-- 9) STORAGE : buckets (preuves de paiement + miniatures des cours)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket public pour les miniatures de cours (images affichées sur les cartes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read course thumbnails"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'course-thumbnails');
CREATE POLICY "Authenticated can upload course thumbnails"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-thumbnails');

CREATE POLICY "Users can upload own payment proof"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can read own payment proof"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Authenticated read payment proofs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs');

-- ---------------------------------------------------------------------------
-- 10) FONCTIONS : code d’accès et inscription
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
  SELECT upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION create_enrollment_with_code(p_user_id UUID, p_course_id UUID)
RETURNS TABLE(enrollment_id UUID, access_code TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_code TEXT;
  v_expires TIMESTAMPTZ;
  v_id UUID;
BEGIN
  v_code := generate_access_code();
  v_expires := timezone('utc'::text, now()) + interval '3 months';
  INSERT INTO course_enrollments (user_id, course_id, access_code, expires_at, status)
  VALUES (p_user_id, p_course_id, v_code, v_expires, 'active')
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    access_code = EXCLUDED.access_code,
    expires_at = EXCLUDED.expires_at,
    status = 'active'
  RETURNING course_enrollments.id, course_enrollments.access_code, course_enrollments.expires_at INTO v_id, v_code, v_expires;
  enrollment_id := v_id;
  access_code := v_code;
  expires_at := v_expires;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_enrollment_with_code(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_enrollment_with_code(UUID, UUID) TO service_role;

-- ---------------------------------------------------------------------------
-- 11) ADMIN : table admin_users + RPC paiements
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
-- Ajouter un admin (remplacer par votre email) :
-- INSERT INTO admin_users (user_id) SELECT id FROM auth.users WHERE email = 'votre@email.com' LIMIT 1 ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION get_pending_payments()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  course_id UUID,
  course_title TEXT,
  amount NUMERIC,
  payment_method TEXT,
  proof_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()) THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT cp.id, cp.user_id, cp.course_id, c.title AS course_title,
         cp.amount, cp.payment_method, cp.proof_url, cp.created_at
  FROM course_payments cp
  JOIN courses c ON c.id = cp.course_id
  WHERE cp.status = 'pending'
  ORDER BY cp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_pending_payments() TO authenticated;

CREATE OR REPLACE FUNCTION approve_payment(p_payment_id UUID)
RETURNS TABLE(access_code TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
  v_code TEXT;
  v_expires TIMESTAMPTZ;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()) THEN
    RETURN;
  END IF;
  SELECT cp.user_id, cp.course_id INTO v_user_id, v_course_id
  FROM course_payments cp WHERE cp.id = p_payment_id AND cp.status = 'pending';
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  UPDATE course_payments SET status = 'approved', processed_at = timezone('utc'::text, now()) WHERE id = p_payment_id;
  SELECT row.access_code, row.expires_at INTO v_code, v_expires
  FROM create_enrollment_with_code(v_user_id, v_course_id) AS row;
  access_code := v_code;
  expires_at := v_expires;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION approve_payment(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 12) RPC : statistiques dashboard admin
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
  total_courses_sold bigint,
  total_revenue numeric,
  total_commission numeric,
  net_revenue numeric,
  sales_by_course jsonb,
  promo_codes jsonb
) AS $$
DECLARE
  v_sold bigint;
  v_revenue numeric;
  v_commission numeric;
  v_sales jsonb;
  v_codes jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()) THEN
    RETURN;
  END IF;

  SELECT count(*)::bigint INTO v_sold FROM course_payments WHERE status = 'approved';
  SELECT coalesce(sum(amount), 0) INTO v_revenue FROM course_payments WHERE status = 'approved';
  SELECT coalesce(sum(commission_amount), 0) INTO v_commission FROM affiliate_sales;

  SELECT coalesce(jsonb_agg(obj), '[]'::jsonb) INTO v_sales
  FROM (
    SELECT jsonb_build_object(
      'course_id', c.id,
      'course_title', c.title,
      'count', count(cp.id)::int
    ) AS obj
    FROM course_payments cp
    JOIN courses c ON c.id = cp.course_id
    WHERE cp.status = 'approved'
    GROUP BY c.id, c.title
  ) sub;

  SELECT coalesce(jsonb_agg(obj), '[]'::jsonb) INTO v_codes
  FROM (
    SELECT jsonb_build_object(
      'code', ac.code,
      'affiliate_email', (SELECT email FROM auth.users WHERE id = a.user_id LIMIT 1),
      'uses', count(af.id)::int,
      'earned', coalesce(sum(af.commission_amount), 0)::numeric
    ) AS obj
    FROM affiliate_codes ac
    JOIN affiliates a ON a.id = ac.affiliate_id
    LEFT JOIN affiliate_sales af ON af.affiliate_code_id = ac.id
    GROUP BY ac.id, ac.code, a.user_id
  ) sub;

  total_courses_sold := v_sold;
  total_revenue := v_revenue;
  total_commission := v_commission;
  net_revenue := v_revenue - v_commission;
  sales_by_course := v_sales;
  promo_codes := v_codes;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;

-- ---------------------------------------------------------------------------
-- 13) RPC : promouvoir / retirer admin (depuis la liste des étudiants)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION add_user_as_admin(p_user_id UUID)
RETURNS TABLE(success boolean, message text) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()) THEN
    RETURN QUERY SELECT false, 'Non autorisé.'::text;
    RETURN;
  END IF;
  INSERT INTO admin_users (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  RETURN QUERY SELECT true, 'Utilisateur promu administrateur.'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_user_as_admin(p_user_id UUID)
RETURNS TABLE(success boolean, message text) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()) THEN
    RETURN QUERY SELECT false, 'Non autorisé.'::text;
    RETURN;
  END IF;
  DELETE FROM admin_users WHERE user_id = p_user_id;
  RETURN QUERY SELECT true, 'Droits admin retirés.'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_admin_user_ids()
RETURNS TABLE(user_id uuid) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()) THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT admin_users.user_id FROM admin_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION add_user_as_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_user_as_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user_ids() TO authenticated;

-- ---------------------------------------------------------------------------
-- 14) Semi-admin : accès limité (équipe interne)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS semi_admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text AS $$
DECLARE v_meta jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  IF EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()) THEN RETURN 'admin'; END IF;
  -- Check semi_admin before metadata so semi-admins always get semi_admin (and see lite stats)
  IF EXISTS (SELECT 1 FROM semi_admin_users WHERE semi_admin_users.user_id = auth.uid()) THEN RETURN 'semi_admin'; END IF;
  SELECT raw_user_meta_data INTO v_meta FROM auth.users WHERE id = auth.uid() LIMIT 1;
  IF v_meta->>'role' = 'admin' THEN RETURN 'admin'; END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_or_semi_admin()
RETURNS boolean AS $$
BEGIN RETURN get_my_role() IN ('admin', 'semi_admin'); END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION add_user_as_semi_admin(p_user_id UUID)
RETURNS TABLE(success boolean, message text) AS $$
BEGIN
  IF get_my_role() != 'admin' THEN RETURN QUERY SELECT false, 'Réservé aux administrateurs.'::text; RETURN; END IF;
  INSERT INTO semi_admin_users (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  RETURN QUERY SELECT true, 'Utilisateur promu semi-admin.'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_user_as_semi_admin(p_user_id UUID)
RETURNS TABLE(success boolean, message text) AS $$
BEGIN
  IF get_my_role() != 'admin' THEN RETURN QUERY SELECT false, 'Réservé aux administrateurs.'::text; RETURN; END IF;
  DELETE FROM semi_admin_users WHERE user_id = p_user_id;
  RETURN QUERY SELECT true, 'Droits semi-admin retirés.'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_semi_admin_user_ids()
RETURNS TABLE(user_id uuid) AS $$
BEGIN
  IF get_my_role() IS NULL THEN RETURN; END IF;
  RETURN QUERY SELECT semi_admin_users.user_id FROM semi_admin_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_as_semi_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_user_as_semi_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_semi_admin_user_ids() TO authenticated;

CREATE OR REPLACE FUNCTION get_pending_payments()
RETURNS TABLE (id UUID, user_id UUID, course_id UUID, course_title TEXT, amount NUMERIC, payment_method TEXT, proof_url TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  IF NOT is_admin_or_semi_admin() THEN RETURN; END IF;
  RETURN QUERY
  SELECT cp.id, cp.user_id, cp.course_id, c.title, cp.amount, cp.payment_method, cp.proof_url, cp.created_at
  FROM course_payments cp JOIN courses c ON c.id = cp.course_id
  WHERE cp.status = 'pending' ORDER BY cp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_payment(p_payment_id UUID)
RETURNS TABLE(access_code TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE v_user_id UUID; v_course_id UUID; v_code TEXT; v_expires TIMESTAMPTZ;
BEGIN
  IF NOT is_admin_or_semi_admin() THEN RETURN; END IF;
  SELECT cp.user_id, cp.course_id INTO v_user_id, v_course_id FROM course_payments cp WHERE cp.id = p_payment_id AND cp.status = 'pending';
  IF v_user_id IS NULL THEN RETURN; END IF;
  UPDATE course_payments SET status = 'approved', processed_at = timezone('utc'::text, now()) WHERE id = p_payment_id;
  SELECT row.access_code, row.expires_at INTO v_code, v_expires FROM create_enrollment_with_code(v_user_id, v_course_id) AS row;
  access_code := v_code; expires_at := v_expires; RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_enrollment_with_code(p_user_id UUID, p_course_id UUID)
RETURNS TABLE(enrollment_id UUID, access_code TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE v_code TEXT; v_expires TIMESTAMPTZ; v_id UUID;
BEGIN
  IF NOT is_admin_or_semi_admin() THEN RETURN; END IF;
  v_code := generate_access_code();
  v_expires := timezone('utc'::text, now()) + interval '3 months';
  INSERT INTO course_enrollments (user_id, course_id, access_code, expires_at, status)
  VALUES (p_user_id, p_course_id, v_code, v_expires, 'active')
  ON CONFLICT (user_id, course_id) DO UPDATE SET access_code = EXCLUDED.access_code, expires_at = EXCLUDED.expires_at, status = 'active'
  RETURNING course_enrollments.id, course_enrollments.access_code, course_enrollments.expires_at INTO v_id, v_code, v_expires;
  enrollment_id := v_id; access_code := v_code; expires_at := v_expires; RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- List all access codes for admin/semi-admin (copy & share with students)
CREATE OR REPLACE FUNCTION get_enrollment_access_codes()
RETURNS TABLE (enrollment_id UUID, user_email TEXT, course_title TEXT, access_code TEXT, expires_at TIMESTAMPTZ, status TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  IF NOT is_admin_or_semi_admin() THEN RETURN; END IF;
  RETURN QUERY
  SELECT e.id, u.email::TEXT, c.title::TEXT, e.access_code, e.expires_at, e.status, e.created_at
  FROM course_enrollments e
  JOIN courses c ON c.id = e.course_id
  JOIN auth.users u ON u.id = e.user_id
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_enrollment_access_codes() TO authenticated;

-- Limited statistics for semi-admin (no revenue, commission, or promo codes)
CREATE OR REPLACE FUNCTION get_semi_admin_dashboard_stats()
RETURNS TABLE (total_active_enrollments bigint, total_pending_payments bigint, enrollments_by_course jsonb) AS $$
DECLARE v_enrollments bigint; v_pending bigint; v_by_course jsonb;
BEGIN
  IF NOT is_admin_or_semi_admin() THEN RETURN; END IF;
  SELECT count(*)::bigint INTO v_enrollments FROM course_enrollments WHERE status = 'active' AND expires_at > timezone('utc'::text, now());
  SELECT count(*)::bigint INTO v_pending FROM course_payments WHERE status = 'pending';
  SELECT coalesce(jsonb_agg(obj), '[]'::jsonb) INTO v_by_course
  FROM (SELECT jsonb_build_object('course_id', c.id, 'course_title', c.title, 'count', count(e.id)::int) AS obj
    FROM course_enrollments e JOIN courses c ON c.id = e.course_id
    WHERE e.status = 'active' AND e.expires_at > timezone('utc'::text, now()) GROUP BY c.id, c.title) sub;
  total_active_enrollments := v_enrollments; total_pending_payments := v_pending; enrollments_by_course := v_by_course;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_semi_admin_dashboard_stats() TO authenticated;

-- ============================================================
-- Fin du script – Mobutu Academy
-- ============================================================
