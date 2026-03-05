-- Fix: semi-admins were sometimes treated as admin (and saw "Access denied" on Statistics)
-- Now get_my_role checks semi_admin_users BEFORE metadata, so semi-admins always get the lite stats.
-- Run in Supabase SQL Editor.

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
