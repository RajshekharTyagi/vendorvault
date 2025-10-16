-- =============================================
-- VendorVault Database Fix - Role-Aware User Registration Trigger
-- This trigger will create user profiles with the correct role from metadata
-- =============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function that respects role selection
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    selected_role_name text;
    role_id uuid;
    vendor_role_id uuid;
BEGIN
    -- Only process if email was just confirmed (not on every update)
    IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
        
        -- Get the selected role from user metadata
        selected_role_name := COALESCE(NEW.raw_user_meta_data->>'selected_role', 'vendor');
        
        -- Get the role ID for the selected role
        SELECT id INTO role_id FROM roles WHERE name = selected_role_name LIMIT 1;
        
        -- If selected role doesn't exist, fallback to vendor
        IF role_id IS NULL THEN
            SELECT id INTO vendor_role_id FROM roles WHERE name = 'vendor' LIMIT 1;
            role_id := vendor_role_id;
            selected_role_name := 'vendor';
        END IF;
        
        -- Check if user profile already exists
        IF NOT EXISTS (SELECT 1 FROM users WHERE id = NEW.id) THEN
            -- Insert the new user with correct role
            INSERT INTO users (id, email, full_name, role_id)
            VALUES (
                NEW.id,
                NEW.email,
                COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
                role_id
            );
            
            RAISE LOG 'Created user profile for % with role %', NEW.email, selected_role_name;
        END IF;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE LOG 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create the trigger for email confirmation
CREATE TRIGGER on_auth_user_confirmed
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also create a trigger for immediate user creation (for admin-created users)
CREATE OR REPLACE FUNCTION handle_immediate_user()
RETURNS TRIGGER AS $$
DECLARE
    selected_role_name text;
    role_id uuid;
    vendor_role_id uuid;
BEGIN
    -- Only process if email is already confirmed (admin-created users)
    IF NEW.email_confirmed_at IS NOT NULL THEN
        
        -- Get the selected role from user metadata
        selected_role_name := COALESCE(NEW.raw_user_meta_data->>'selected_role', 'vendor');
        
        -- Get the role ID for the selected role
        SELECT id INTO role_id FROM roles WHERE name = selected_role_name LIMIT 1;
        
        -- If selected role doesn't exist, fallback to vendor
        IF role_id IS NULL THEN
            SELECT id INTO vendor_role_id FROM roles WHERE name = 'vendor' LIMIT 1;
            role_id := vendor_role_id;
            selected_role_name := 'vendor';
        END IF;
        
        -- Insert the new user with correct role
        INSERT INTO users (id, email, full_name, role_id)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
            role_id
        );
        
        RAISE LOG 'Created immediate user profile for % with role %', NEW.email, selected_role_name;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE LOG 'Error in handle_immediate_user for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for immediate user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_immediate_user();

-- Test the setup
DO $$
DECLARE
    role_count integer;
BEGIN
    SELECT COUNT(*) INTO role_count FROM roles;
    IF role_count = 0 THEN
        RAISE NOTICE 'WARNING: No roles found. Please run the seed data script first.';
    ELSE
        RAISE NOTICE 'SUCCESS: Found % roles in the database. Triggers are ready.', role_count;
    END IF;
END $$;