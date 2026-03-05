-- Fix: "column reference 'access_code' is ambiguous" when creating enrollments
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- Version with semi-admin check (use this if you have semi_admin_users / is_admin_or_semi_admin)
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
