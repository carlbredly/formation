-- RPC : promouvoir / retirer admin depuis la liste des étudiants (exécuter si déjà installé sans ces fonctions)
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
