-- =====================================================
-- VITANOVA PRAYER REPOSITORY - RLS POLICIES
-- Version: 1.0
-- Description: Comprehensive Row Level Security
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Public can view active programs
CREATE POLICY "public_view_active_programs"
  ON programs FOR SELECT
  USING (is_active = true);

-- Admins can view all programs
CREATE POLICY "admin_view_all_programs"
  ON programs FOR SELECT
  USING (is_admin());

-- Admins can insert programs
CREATE POLICY "admin_insert_programs"
  ON programs FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update programs
CREATE POLICY "admin_update_programs"
  ON programs FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete programs (soft delete recommended)
CREATE POLICY "admin_delete_programs"
  ON programs FOR DELETE
  USING (is_admin());

-- =====================================================
-- PRAYER_TYPES TABLE POLICIES
-- =====================================================

-- Public can view visible and enabled prayer types
CREATE POLICY "public_view_active_prayer_types"
  ON prayer_types FOR SELECT
  USING (
    is_visible = true 
    AND is_enabled = true
    AND program_id IN (SELECT id FROM programs WHERE is_active = true)
  );

-- Admins can view all prayer types
CREATE POLICY "admin_view_all_prayer_types"
  ON prayer_types FOR SELECT
  USING (is_admin());

-- Admins can insert prayer types
CREATE POLICY "admin_insert_prayer_types"
  ON prayer_types FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update prayer types
CREATE POLICY "admin_update_prayer_types"
  ON prayer_types FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete prayer types
CREATE POLICY "admin_delete_prayer_types"
  ON prayer_types FOR DELETE
  USING (is_admin());

-- =====================================================
-- PRAYER_ACTIONS TABLE POLICIES
-- =====================================================

-- Public can insert prayer actions (for their own submissions)
CREATE POLICY "public_insert_prayer_actions"
  ON prayer_actions FOR INSERT
  WITH CHECK (
    action_type = 'increment'
    AND admin_id IS NULL
    AND prayer_type_id IN (
      SELECT id FROM prayer_types 
      WHERE is_visible = true 
      AND is_enabled = true
      AND program_id IN (SELECT id FROM programs WHERE is_active = true)
    )
  );

-- Admins can view all prayer actions
CREATE POLICY "admin_view_all_actions"
  ON prayer_actions FOR SELECT
  USING (is_admin());

-- Admins can insert actions (for edits/resets)
CREATE POLICY "admin_insert_actions"
  ON prayer_actions FOR INSERT
  WITH CHECK (
    is_admin()
    AND admin_id = auth.uid()
  );

-- Admins can delete actions (for rollback)
CREATE POLICY "admin_delete_actions"
  ON prayer_actions FOR DELETE
  USING (is_admin());

-- =====================================================
-- PRAYER_COUNTERS TABLE POLICIES
-- =====================================================

-- Public can view all counters (for active prayers)
CREATE POLICY "public_view_counters"
  ON prayer_counters FOR SELECT
  USING (
    prayer_type_id IN (
      SELECT id FROM prayer_types 
      WHERE is_visible = true 
      AND is_enabled = true
      AND program_id IN (SELECT id FROM programs WHERE is_active = true)
    )
  );

-- Admins can view all counters
CREATE POLICY "admin_view_all_counters"
  ON prayer_counters FOR SELECT
  USING (is_admin());

-- Admins can update counters
CREATE POLICY "admin_update_counters"
  ON prayer_counters FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- System can insert/update counters (via triggers)
-- This is handled by SECURITY DEFINER functions

-- =====================================================
-- ADMIN_USERS TABLE POLICIES
-- =====================================================

-- Admins can view all admin users
CREATE POLICY "admin_view_admin_users"
  ON admin_users FOR SELECT
  USING (is_admin());

-- Super admins can insert new admins
CREATE POLICY "super_admin_insert_admin_users"
  ON admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
  );

-- Admins can update their own profile
CREATE POLICY "admin_update_own_profile"
  ON admin_users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM admin_users WHERE id = auth.uid()) -- Can't change own role
  );

-- Super admins can update other admins
CREATE POLICY "super_admin_update_admins"
  ON admin_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
    )
  );

-- =====================================================
-- ADMIN_LOGS TABLE POLICIES
-- =====================================================

-- Admins can view all logs
CREATE POLICY "admin_view_logs"
  ON admin_logs FOR SELECT
  USING (is_admin());

-- Admins can insert their own logs
CREATE POLICY "admin_insert_logs"
  ON admin_logs FOR INSERT
  WITH CHECK (
    is_admin() AND admin_id = auth.uid()
  );

-- Logs are immutable (no update or delete)

-- =====================================================
-- SECURITY DEFINER FUNCTIONS
-- (These bypass RLS for specific operations)
-- =====================================================

-- These will be created in the next migration file