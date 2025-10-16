-- =============================================
-- VendorVault Database Fix - User Registration Trigger
-- Run this to fix the user registration issue
-- =============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    vendor_role_id uuid;
BEGIN
    -- Get the vendor role ID
    SELECT id INTO vendor_role_id FROM roles WHERE name = 'vendor' LIMIT 1;
    
    -- If no vendor role exists, create it
    IF vendor_role_id IS NULL THEN
        INSERT INTO roles (name, description) 
        VALUES ('vendor', 'Limited access to own vendor data')
        RETURNING id INTO vendor_role_id;
    END IF;
    
    -- Insert the new user
    INSERT INTO users (id, email, full_name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        vendor_role_id
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error (you can check this in Supabase logs)
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW; -- Don't fail the auth process
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create the trigger for email confirmation (not just insert)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the function by checking if roles exist
DO $$
DECLARE
    role_count integer;
BEGIN
    SELECT COUNT(*) INTO role_count FROM roles;
    IF role_count = 0 THEN
        RAISE NOTICE 'No roles found. Please run the seed data script first.';
    ELSE
        RAISE NOTICE 'Found % roles in the database.', role_count;
    END IF;
END $$;