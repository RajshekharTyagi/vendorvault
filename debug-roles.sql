-- Debug script to check user roles
-- Run this in Supabase SQL Editor

-- Check all users and their roles
SELECT 
    u.email,
    u.full_name,
    r.name as role_name,
    r.description,
    u.created_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.created_at DESC;

-- Check all available roles
SELECT * FROM roles ORDER BY name;

-- Check if there are any users without roles
SELECT 
    u.email,
    u.full_name,
    u.role_id,
    'NO ROLE ASSIGNED' as issue
FROM users u
WHERE u.role_id IS NULL;

-- Check for duplicate role assignments
SELECT 
    role_id,
    COUNT(*) as user_count
FROM users 
GROUP BY role_id
ORDER BY user_count DESC;