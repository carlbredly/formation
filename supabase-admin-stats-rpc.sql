-- RPC Statistiques dashboard admin (exécuter si déjà installé supabase-full-setup sans cette fonction)
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
