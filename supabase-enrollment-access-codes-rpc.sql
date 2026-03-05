-- RPC: list all enrollment access codes for admin/semi-admin (to copy and share with students)
-- Run in Supabase SQL Editor if you already have is_admin_or_semi_admin().

CREATE OR REPLACE FUNCTION get_enrollment_access_codes()
RETURNS TABLE (
  enrollment_id UUID,
  user_email TEXT,
  course_title TEXT,
  access_code TEXT,
  expires_at TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT is_admin_or_semi_admin() THEN RETURN; END IF;
  RETURN QUERY
  SELECT
    e.id AS enrollment_id,
    u.email::TEXT AS user_email,
    c.title::TEXT AS course_title,
    e.access_code,
    e.expires_at,
    e.status,
    e.created_at
  FROM course_enrollments e
  JOIN courses c ON c.id = e.course_id
  JOIN auth.users u ON u.id = e.user_id
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_enrollment_access_codes() TO authenticated;
