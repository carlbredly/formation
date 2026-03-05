-- ============================================================
-- Courses, lessons, enrollments, progress, payments (Supabase)
-- Run this in Supabase SQL Editor after supabase-setup.sql
-- ============================================================

-- 1) Add price to courses (if column does not exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'price'
  ) THEN
    ALTER TABLE courses ADD COLUMN price NUMERIC(10, 2) DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- 2) course_lessons: lessons belong to a course
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  content_url TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS course_lessons_course_id_idx ON course_lessons(course_id);

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

-- 3) course_enrollments: student assigned to course with unique access code (3 months)
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

-- Student sees only their enrollments
CREATE POLICY "User sees own enrollments"
  ON course_enrollments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Only service role / backend creates enrollments (admin or after payment). For simplicity we allow authenticated insert so admin (authenticated) can create via app; restrict in app to admin only.
CREATE POLICY "Authenticated can insert enrollments"
  ON course_enrollments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update enrollments"
  ON course_enrollments FOR UPDATE TO authenticated USING (true);

-- 4) course_progress: per enrollment, per lesson
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

-- User sees progress only for their enrollments
CREATE POLICY "User sees own progress"
  ON course_progress FOR SELECT TO authenticated
  USING (
    enrollment_id IN (
      SELECT id FROM course_enrollments WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "User can insert own progress"
  ON course_progress FOR INSERT TO authenticated
  WITH CHECK (
    enrollment_id IN (
      SELECT id FROM course_enrollments WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "User can update own progress"
  ON course_progress FOR UPDATE TO authenticated
  USING (
    enrollment_id IN (
      SELECT id FROM course_enrollments WHERE user_id = auth.uid()
    )
  );

-- 5) course_payments: manual payment (Zelle, MonCash) + proof
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

-- 6) Storage bucket for payment proofs (run in SQL or create via Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own payment proof"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can read own payment proof"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
-- Allow any authenticated user to read payment proofs (for admin viewing). In production use Edge Function + service role.
CREATE POLICY "Authenticated read payment proofs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs');

-- 7) Function: generate random access code
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
  SELECT upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
$$ LANGUAGE sql;

-- 8) Function: create enrollment with code valid 3 months
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

-- 9) Admin: allow only certain users to list/approve payments
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
-- Add your admin user (run once; replace with your auth user id or use email from auth.users in Dashboard):
-- INSERT INTO admin_users (user_id) SELECT id FROM auth.users WHERE email = 'your-admin@example.com' LIMIT 1 ON CONFLICT DO NOTHING;

-- RPC: get pending payments (only for admin_users)
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
  SELECT
    cp.id,
    cp.user_id,
    cp.course_id,
    c.title AS course_title,
    cp.amount,
    cp.payment_method,
    cp.proof_url,
    cp.created_at
  FROM course_payments cp
  JOIN courses c ON c.id = cp.course_id
  WHERE cp.status = 'pending'
  ORDER BY cp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_pending_payments() TO authenticated;

-- RPC: approve payment and create enrollment (3 months access)
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
