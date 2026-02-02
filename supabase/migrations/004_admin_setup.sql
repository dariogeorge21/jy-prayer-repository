-- =====================================================
-- ADMIN USER SETUP
-- =====================================================

-- This script should be run manually after deployment
-- Replace email and password with actual credentials

-- Create admin user (via Supabase Auth)
-- This must be done via Supabase Dashboard or API first
-- Then run the following:

-- Example: Insert admin record (after user is created in auth.users)
-- INSERT INTO admin_users (id, email, full_name, role)
-- SELECT 
--   id,
--   email,
--   'System Administrator',
--   'super_admin'
-- FROM auth.users
-- WHERE email = 'admin@vitanova.com';

-- For development, you can use this helper function:
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT DEFAULT 'Administrator'
)
RETURNS TEXT AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- This is a simplified version
  -- In production, use Supabase Auth API
  
  -- Check if user exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF FOUND THEN
    -- Add to admin_users if not already there
    INSERT INTO admin_users (id, email, full_name, role)
    VALUES (v_user_id, p_email, p_full_name, 'admin')
    ON CONFLICT (id) DO NOTHING;
    
    RETURN 'Admin user created/updated: ' || p_email;
  ELSE
    RETURN 'User not found in auth.users. Please create via Supabase Dashboard first.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;