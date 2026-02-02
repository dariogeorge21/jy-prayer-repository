-- =====================================================
-- VITANOVA PRAYER REPOSITORY - INITIAL SCHEMA
-- Version: 1.0
-- Description: Core tables for prayer tracking system
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: programs
-- Purpose: Support multiple prayer programs/events
-- =====================================================
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Only one active program at a time
CREATE UNIQUE INDEX idx_programs_single_active 
  ON programs (is_active) 
  WHERE is_active = true;

CREATE INDEX idx_programs_created ON programs(created_at DESC);

-- =====================================================
-- TABLE: prayer_types
-- Purpose: Define available prayer types for a program
-- =====================================================
CREATE TABLE prayer_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('count', 'time')),
  
  -- For count-based prayers (e.g., Rosary, Hail Mary)
  increment_value INTEGER DEFAULT 1 CHECK (increment_value > 0),
  
  -- For time-based prayers (e.g., Adoration)
  time_increment_minutes INTEGER CHECK (time_increment_minutes > 0),
  
  -- Visibility and state
  is_visible BOOLEAN DEFAULT true,
  is_enabled BOOLEAN DEFAULT true,
  
  -- Display ordering
  display_order INTEGER DEFAULT 0,
  
  -- Icon/emoji for UI (optional)
  icon TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure time prayers have time increment
  CONSTRAINT time_prayer_has_increment CHECK (
    type != 'time' OR time_increment_minutes IS NOT NULL
  )
);

CREATE INDEX idx_prayer_types_program ON prayer_types(program_id);
CREATE INDEX idx_prayer_types_visible ON prayer_types(is_visible, is_enabled) 
  WHERE is_visible = true AND is_enabled = true;
CREATE INDEX idx_prayer_types_order ON prayer_types(display_order);

-- =====================================================
-- TABLE: prayer_actions
-- Purpose: Audit trail of every prayer submission
-- =====================================================
CREATE TABLE prayer_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_type_id UUID NOT NULL REFERENCES prayer_types(id) ON DELETE CASCADE,
  
  -- User identification (anonymous)
  user_identifier TEXT NOT NULL CHECK (char_length(user_identifier) > 0),
  
  -- Network information
  ip_address INET,
  user_agent TEXT,
  
  -- Action details
  increment_amount INTEGER NOT NULL DEFAULT 1 CHECK (increment_amount > 0),
  action_type TEXT NOT NULL DEFAULT 'increment' 
    CHECK (action_type IN ('increment', 'admin_edit', 'admin_reset')),
  
  -- For admin actions
  admin_id UUID REFERENCES auth.users(id),
  admin_note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Admin actions must have admin_id
  CONSTRAINT admin_action_has_id CHECK (
    action_type = 'increment' OR admin_id IS NOT NULL
  )
);

-- Critical indexes for performance
CREATE INDEX idx_prayer_actions_prayer_type ON prayer_actions(prayer_type_id);
CREATE INDEX idx_prayer_actions_user ON prayer_actions(user_identifier);
CREATE INDEX idx_prayer_actions_created ON prayer_actions(created_at DESC);
CREATE INDEX idx_prayer_actions_ip ON prayer_actions(ip_address);

-- Composite index for rate limiting queries
CREATE INDEX idx_prayer_actions_rate_limit 
  ON prayer_actions(prayer_type_id, user_identifier, created_at DESC)
  WHERE action_type = 'increment';

-- =====================================================
-- TABLE: prayer_counters
-- Purpose: Aggregated view of prayer totals
-- =====================================================
CREATE TABLE prayer_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_type_id UUID UNIQUE NOT NULL REFERENCES prayer_types(id) ON DELETE CASCADE,
  
  -- Aggregated totals
  total_count BIGINT DEFAULT 0 CHECK (total_count >= 0),
  total_time_minutes BIGINT DEFAULT 0 CHECK (total_time_minutes >= 0),
  
  -- Metadata
  unique_contributors INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  last_action_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prayer_counters_prayer_type ON prayer_counters(prayer_type_id);
CREATE INDEX idx_prayer_counters_updated ON prayer_counters(last_updated DESC);

-- =====================================================
-- TABLE: admin_users
-- Purpose: Authorized administrators
-- =====================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

-- =====================================================
-- TABLE: admin_logs
-- Purpose: Audit trail for all admin actions
-- =====================================================
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id),
  action TEXT NOT NULL,
  entity_type TEXT, -- 'program', 'prayer_type', 'counter', etc.
  entity_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_entity ON admin_logs(entity_type, entity_id);

-- =====================================================
-- TRIGGER FUNCTION: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER trigger_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_prayer_types_updated_at
  BEFORE UPDATE ON prayer_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER FUNCTION: Auto-update prayer counters
-- =====================================================
CREATE OR REPLACE FUNCTION update_prayer_counter()
RETURNS TRIGGER AS $$
DECLARE
  prayer_type_row RECORD;
BEGIN
  -- Get prayer type details
  SELECT type INTO prayer_type_row FROM prayer_types WHERE id = NEW.prayer_type_id;
  
  -- Insert or update counter
  INSERT INTO prayer_counters (
    prayer_type_id, 
    total_count, 
    total_time_minutes,
    last_updated,
    last_action_at
  )
  VALUES (
    NEW.prayer_type_id,
    CASE WHEN prayer_type_row.type = 'count' THEN NEW.increment_amount ELSE 0 END,
    CASE WHEN prayer_type_row.type = 'time' THEN NEW.increment_amount ELSE 0 END,
    NOW(),
    NOW()
  )
  ON CONFLICT (prayer_type_id) DO UPDATE SET
    total_count = prayer_counters.total_count + 
      CASE WHEN prayer_type_row.type = 'count' THEN NEW.increment_amount ELSE 0 END,
    total_time_minutes = prayer_counters.total_time_minutes + 
      CASE WHEN prayer_type_row.type = 'time' THEN NEW.increment_amount ELSE 0 END,
    last_updated = NOW(),
    last_action_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prayer_counter
  AFTER INSERT ON prayer_actions
  FOR EACH ROW 
  EXECUTE FUNCTION update_prayer_counter();

-- =====================================================
-- TRIGGER: Update unique contributors count
-- =====================================================
CREATE OR REPLACE FUNCTION update_unique_contributors()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prayer_counters
  SET unique_contributors = (
    SELECT COUNT(DISTINCT user_identifier)
    FROM prayer_actions
    WHERE prayer_type_id = NEW.prayer_type_id
      AND action_type = 'increment'
  )
  WHERE prayer_type_id = NEW.prayer_type_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_unique_contributors
  AFTER INSERT ON prayer_actions
  FOR EACH ROW
  WHEN (NEW.action_type = 'increment')
  EXECUTE FUNCTION update_unique_contributors();

-- =====================================================
-- INITIAL DATA SEED
-- =====================================================

-- Create default program
INSERT INTO programs (name, description, is_active)
VALUES (
  'Vitanova 2026',
  'Three-day spiritual retreat program organized by Jesus Youth SJCET',
  true
);

-- Insert default prayer types
WITH default_program AS (
  SELECT id FROM programs WHERE name = 'Vitanova 2026' LIMIT 1
)
INSERT INTO prayer_types (program_id, name, type, increment_value, time_increment_minutes, display_order, icon)
SELECT 
  id,
  prayer_name,
  prayer_type,
  increment_val,
  time_increment,
  display_ord,
  prayer_icon
FROM default_program,
(VALUES
  ('Holy Mass', 'count', 1, NULL, 1, '⛪'),
  ('Rosary', 'count', 1, NULL, 2, '📿'),
  ('Adoration (Online)', 'time', NULL, 5, 3, '🕯️'),
  ('Adoration (Offline)', 'time', NULL, 5, 4, '⛪'),
  ('Word of God Reading', 'time', NULL, 5, 5, '📖'),
  ('Memorare', 'count', 1, NULL, 6, '🙏'),
  ('Creed', 'count', 1, NULL, 7, '✝️'),
  ('Hail Mary', 'count', 1, NULL, 8, '👼'),
  ('Way of the Cross', 'count', 1, NULL, 9, '✝️'),
  ('Novena of St. Joseph', 'count', 1, NULL, 10, '🛠️')
) AS prayers(prayer_name, prayer_type, increment_val, time_increment, display_ord, prayer_icon);

-- =====================================================
-- VIEWS FOR CONVENIENCE
-- =====================================================

-- Active prayer types with current counts
CREATE OR REPLACE VIEW v_active_prayers AS
SELECT 
  pt.id,
  pt.name,
  pt.description,
  pt.type,
  pt.increment_value,
  pt.time_increment_minutes,
  pt.display_order,
  pt.icon,
  COALESCE(pc.total_count, 0) AS total_count,
  COALESCE(pc.total_time_minutes, 0) AS total_time_minutes,
  COALESCE(pc.unique_contributors, 0) AS unique_contributors,
  pc.last_action_at
FROM prayer_types pt
LEFT JOIN prayer_counters pc ON pt.id = pc.prayer_type_id
WHERE pt.is_visible = true AND pt.is_enabled = true
ORDER BY pt.display_order;

-- Recent prayer activity
CREATE OR REPLACE VIEW v_recent_actions AS
SELECT 
  pa.id,
  pt.name AS prayer_name,
  pa.user_identifier,
  pa.increment_amount,
  pa.action_type,
  pa.created_at,
  au.email AS admin_email
FROM prayer_actions pa
JOIN prayer_types pt ON pa.prayer_type_id = pt.id
LEFT JOIN admin_users au ON pa.admin_id = au.id
ORDER BY pa.created_at DESC
LIMIT 100;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE programs IS 'Stores different prayer programs/events (e.g., Vitanova 2026, Vitanova 2027)';
COMMENT ON TABLE prayer_types IS 'Defines types of prayers available for each program';
COMMENT ON TABLE prayer_actions IS 'Complete audit trail of every prayer submission';
COMMENT ON TABLE prayer_counters IS 'Aggregated totals for each prayer type';
COMMENT ON TABLE admin_users IS 'Authorized administrators who can manage the system';
COMMENT ON TABLE admin_logs IS 'Audit trail of all administrative actions';

COMMENT ON COLUMN prayer_types.type IS 'Either "count" (e.g., number of Rosaries) or "time" (e.g., minutes of Adoration)';
COMMENT ON COLUMN prayer_actions.user_identifier IS 'Anonymous UUID stored in browser localStorage';
COMMENT ON COLUMN prayer_actions.action_type IS 'Type of action: increment (user), admin_edit, or admin_reset';