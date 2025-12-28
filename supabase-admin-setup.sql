-- Script pour créer un utilisateur admin dans Supabase
-- 
-- MÉTHODE 1 : Via l'interface Supabase (Recommandé)
-- 1. Allez dans Authentication > Users
-- 2. Créez un nouvel utilisateur ou sélectionnez un utilisateur existant
-- 3. Cliquez sur "Edit" (ou les trois points)
-- 4. Dans "User Metadata", ajoutez : {"role": "admin"}
-- 5. Sauvegardez
--
-- MÉTHODE 2 : Via SQL (si vous avez accès à l'admin)
-- Exécutez cette requête en remplaçant 'user_id_here' par l'ID de l'utilisateur
-- et 'user_email@example.com' par l'email de l'utilisateur

-- Exemple pour mettre à jour les metadata d'un utilisateur existant :
-- UPDATE auth.users 
-- SET raw_user_meta_data = jsonb_build_object('role', 'admin')
-- WHERE email = 'user_email@example.com';

-- Note: Cette méthode nécessite des privilèges admin sur Supabase
-- La méthode 1 via l'interface est plus simple et recommandée

