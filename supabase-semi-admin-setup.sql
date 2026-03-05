-- Semi-admin : table + RPCs (exécuter si la base existe déjà)
CREATE TABLE IF NOT EXISTS semi_admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text AS $$
DECLARE v_meta jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  IF EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()) THEN RETURN 'admin'; END IF;
  SELECT raw_user_meta_data INTO v_meta FROM auth.users WHERE id = auth.uid() LIMIT 1;
  IF v_meta->>'role' = 'admin' THEN RETURN 'admin'; END IF;
  IF EXISTS (SELECT 1 FROM semi_admin_users WHERE semi_admin_users.user_id = auth.uid()) THEN RETURN 'semi_admin'; END IF;
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

-- Autoriser semi-admin pour paiements et inscriptions
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

-- Limited statistics for semi-admin (no revenue, no commission, no promo codes)
CREATE OR REPLACE FUNCTION get_semi_admin_dashboard_stats()
RETURNS TABLE (
  total_active_enrollments bigint,
  total_pending_payments bigint,
  enrollments_by_course jsonb
) AS $$
DECLARE
  v_enrollments bigint;
  v_pending bigint;
  v_by_course jsonb;
BEGIN
  IF NOT is_admin_or_semi_admin() THEN RETURN; END IF;

  SELECT count(*)::bigint INTO v_enrollments
  FROM course_enrollments
  WHERE status = 'active' AND expires_at > timezone('utc'::text, now());

  SELECT count(*)::bigint INTO v_pending
  FROM course_payments WHERE status = 'pending';

  SELECT coalesce(jsonb_agg(obj), '[]'::jsonb) INTO v_by_course
  FROM (
    SELECT jsonb_build_object('course_id', c.id, 'course_title', c.title, 'count', count(e.id)::int) AS obj
    FROM course_enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE e.status = 'active' AND e.expires_at > timezone('utc'::text, now())
    GROUP BY c.id, c.title
  ) sub;

  total_active_enrollments := v_enrollments;
  total_pending_payments := v_pending;
  enrollments_by_course := v_by_course;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_semi_admin_dashboard_stats() TO authenticated;
