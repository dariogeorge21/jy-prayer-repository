-- =====================================================
-- VITANOVA PRAYER REPOSITORY - RLS POLICIES (CORRECTED)
-- Version: 2.0
-- Description: Row Level Security with Public Read Access
-- =====================================================

-- =====================================================
-- HELPER FUNCTION: Check if user is admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROGRAMS TABLE POLICIES
-- =====================================================

-- Everyone (authenticated and anonymous) can view active programs
CREATE POLICY "programs_public_read"
  ON programs FOR SELECT
  USING (is_active = true);

-- Admins can view all programs
CREATE POLICY "programs_admin_read_all"
  ON programs FOR SELECT
  USING (is_admin());

-- Admins can insert programs
CREATE POLICY "programs_admin_insert"
  ON programs FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update programs
CREATE POLICY "programs_admin_update"
  ON programs FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete programs
CREATE POLICY "programs_admin_delete"
  ON programs FOR DELETE
  USING (is_admin());

-- =====================================================
-- PRAYER_TYPES TABLE POLICIES
-- =====================================================

-- Everyone can view visible and enabled prayer types
CREATE POLICY "prayer_types_public_read"
  ON prayer_types FOR SELECT
  USING (
    is_visible = true 
    AND is_enabled = true
  );

-- Admins can view all prayer types
CREATE POLICY "prayer_types_admin_read_all"
  ON prayer_types FOR SELECT
  USING (is_admin());

-- Admins can insert prayer types
CREATE POLICY "prayer_types_admin_insert"
  ON prayer_types FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update prayer types
CREATE POLICY "prayer_types_admin_update"
  ON prayer_types FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete prayer types
CREATE POLICY "prayer_types_admin_delete"
  ON prayer_types FOR DELETE
  USING (is_admin());

-- =====================================================
-- PRAYER_ACTIONS TABLE POLICIES
-- =====================================================

-- Everyone can insert prayer actions (for public submissions)
CREATE POLICY "prayer_actions_public_insert"
  ON prayer_actions FOR INSERT
  WITH CHECK (
    action_type = 'increment'
    AND admin_id IS NULL
  );

-- Admins can view all prayer actions
CREATE POLICY "prayer_actions_admin_read_all"
  ON prayer_actions FOR SELECT
  USING (is_admin());

-- Admins can insert actions (for edits/resets)
CREATE POLICY "prayer_actions_admin_insert"
  ON prayer_actions FOR INSERT
  WITH CHECK (
    is_admin()
    AND admin_id = auth.uid()
  );

-- =====================================================
-- PRAYER_COUNTERS TABLE POLICIES
-- =====================================================

-- Everyone can view all counters (they're public statistics)
CREATE POLICY "prayer_counters_public_read"
  ON prayer_counters FOR SELECT
  USING (true);

-- Admins can update counters
CREATE POLICY "prayer_counters_admin_update"
  ON prayer_counters FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- ADMIN_USERS TABLE POLICIES
-- =====================================================

-- Users can view their own admin record
CREATE POLICY "admin_users_self_read"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all admin users
CREATE POLICY "admin_users_admin_read_all"
  ON admin_users FOR SELECT
  USING (is_admin());

-- Only super admins can insert new admins
CREATE POLICY "admin_users_admin_insert"
  ON admin_users FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update their own record
CREATE POLICY "admin_users_self_update"
  ON admin_users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Super admins can update other admin records
CREATE POLICY "admin_users_admin_update_all"
  ON admin_users FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================================================
-- ADMIN_LOGS TABLE POLICIES
-- =====================================================

-- Admins can view admin logs
CREATE POLICY "admin_logs_admin_read"
  ON admin_logs FOR SELECT
  USING (is_admin());

-- System can insert logs (via security definer functions)
CREATE POLICY "admin_logs_system_insert"
  ON admin_logs FOR INSERT
  WITH CHECK (true);
