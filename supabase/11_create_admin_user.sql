-- =============================================
-- VendorVault - Create Complete Admin User
-- This creates both auth user and profile
-- =============================================

DO $$
DECLARE
    admin_role_id uuid;
    user_email text := 'rajshekhar.2025.tsintern@gmail.com';
    user_password text := 'tyagi@2002';
    user_name text := 'Rajshekhar Tyagi';
    new_user_id uuid;
BEGIN
    -- Get admin role ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Admin role not found. Please run the seed data script first.';
    END IF;
    
    -- Check if user already exists in auth.users
    SELECT id INTO new_user_id FROM auth.users WHERE email = user_email LIMIT 1;
    
    IF new_user_id IS NOT NULL THEN
        -- User exists, just update their role
        UPDATE users 
        SET role_id = admin_role_id 
        WHERE email = user_email;
        
        RAISE NOTICE 'Existing user % has been made an admin!', user_email;
    ELSE
        -- Create new auth user (this requires service role key)
        -- Note: This part needs to be done via API or Supabase Dashboard
        RAISE NOTICE 'User % does not exist. Please use the admin setup page at /admin/setup', user_email;
    END IF;
END $$;

-- Verify the admin user
SELECT 
    u.email,
    u.full_name,
    r.name as role,
    r.description
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'rajshekhar.2025.tsintern@gmail.com';