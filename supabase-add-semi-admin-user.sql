-- Add a user as SEMI-ADMIN (dashboard + statistics access, but NOT full admin)
-- Semi-admins can: Statistics (lite), Students, Enrollments, Access codes, Payments.
-- They cannot: add/edit/delete courses, promote to admin, or see full revenue/commission stats.
--
-- 1. Replace YOUR_EMAIL@example.com with the person's login email
-- 2. Run in Supabase: Dashboard → SQL Editor → New query → paste → Run

INSERT INTO semi_admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@example.com' LIMIT 1
ON CONFLICT (user_id) DO NOTHING;
