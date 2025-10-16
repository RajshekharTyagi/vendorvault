-- =============================================
-- VendorVault - Disable Email Confirmation
-- Run this to completely disable email confirmation
-- =============================================

-- Update auth configuration to disable email confirmation
-- Note: This should also be done in Supabase Dashboard → Authentication → Settings
UPDATE auth.config 
SET email_confirm_required = false 
WHERE true;

-- Confirm all existing unconfirmed users (optional)
-- Uncomment the line below if you want to confirm all existing users
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- Display current email confirmation setting
SELECT 
  CASE 
    WHEN email_confirm_required THEN 'Email confirmation is ENABLED' 
    ELSE 'Email confirmation is DISABLED' 
  END as status
FROM auth.config;