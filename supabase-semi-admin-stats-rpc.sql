-- Limited statistics for semi-admin (run in Supabase SQL Editor if you already have is_admin_or_semi_admin)
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
