-- =============================================
-- Fix RLS Policies for User Role Queries
-- =============================================

-- Allow users to read roles (needed for joins)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Everyone can read roles (they're not sensitive data)
CREATE POLICY "Everyone can read roles" ON roles
    FOR SELECT USING (true);

-- Allow users to read permissions (needed for role-based access)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read permissions" ON permissions
    FOR SELECT USING (true);

-- Allow users to read role_permissions (needed for role-based access)
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read role permissions" ON role_permissions
    FOR SELECT USING (true);

-- Update the users policy to allow reading with role joins
DROP POLICY IF EXISTS "Users can view own profile" ON users;

CREATE POLICY "Users can view own profile with role" ON users
    FOR SELECT USING (auth.uid() = id);

-- Test the policy by running a sample query
-- This should work now:
-- SELECT u.*, r.name as role_name 
-- FROM users u 
-- JOIN roles r ON u.role_id = r.id 
-- WHERE u.id = auth.uid();