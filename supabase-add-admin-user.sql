-- Add a user as FULL ADMIN (all dashboard tabs, full statistics, can manage courses and promote users)
-- For dashboard + statistics access WITHOUT full admin rights, use supabase-add-semi-admin-user.sql instead.
--
-- 1. Replace YOUR_EMAIL@example.com with the email they use to log in
-- 2. Run in Supabase: Dashboard → SQL Editor → New query → paste → Run

INSERT INTO admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@example.com' LIMIT 1
ON CONFLICT (user_id) DO NOTHING;
