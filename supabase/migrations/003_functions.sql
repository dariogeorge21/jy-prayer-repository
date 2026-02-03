-- =====================================================
-- VITANOVA PRAYER REPOSITORY - BUSINESS LOGIC FUNCTIONS
-- Version: 1.0
-- =====================================================

-- =====================================================
-- FUNCTION: Check rate limit for prayer submission
-- =====================================================
CREATE OR REPLACE FUNCTION check_prayer_rate_limit(
  p_prayer_type_id UUID,
  p_user_identifier TEXT,
  p_rate_limit_seconds INTEGER DEFAULT 30
)
RETURNS TABLE (
  is_allowed BOOLEAN,
  seconds_remaining INTEGER,
  last_action_time TIMESTAMPTZ
) AS $$
DECLARE
  v_last_action TIMESTAMPTZ;
  v_seconds_elapsed INTEGER;
BEGIN
  -- Get the most recent action timestamp
  SELECT MAX(created_at) INTO v_last_action
  FROM prayer_actions
  WHERE prayer_type_id = p_prayer_type_id
    AND user_identifier = p_user_identifier
    AND action_type = 'increment';
  
  -- If no previous action, allow immediately
  IF v_last_action IS NULL THEN
    RETURN QUERY SELECT true, 0, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  -- Calculate elapsed time
  v_seconds_elapsed := EXTRACT(EPOCH FROM (NOW() - v_last_action))::INTEGER;
  
  -- Check if rate limit has passed
  IF v_seconds_elapsed >= p_rate_limit_seconds THEN
    RETURN QUERY SELECT true, 0, v_last_action;
  ELSE
    RETURN QUERY SELECT 
      false, 
      p_rate_limit_seconds - v_seconds_elapsed,
      v_last_action;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Submit prayer action (with rate limiting)
-- =====================================================
CREATE OR REPLACE FUNCTION submit_prayer_action(
  p_prayer_type_id UUID,
  p_user_identifier TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  new_total BIGINT,
  seconds_to_wait INTEGER
) AS $$
DECLARE
  v_rate_limit_check RECORD;
  v_prayer_type RECORD;
  v_increment_amount INTEGER;
  v_new_total BIGINT;
BEGIN
  -- Get prayer type details
  SELECT * INTO v_prayer_type
  FROM prayer_types
  WHERE id = p_prayer_type_id
    AND is_visible = true
    AND is_enabled = true;
  
  -- Check if prayer type exists and is enabled
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false, 
      'Prayer type not found or disabled'::TEXT,
      0::BIGINT,
      0;
    RETURN;
  END IF;
  
  -- Check rate limit
  SELECT * INTO v_rate_limit_check
  FROM check_prayer_rate_limit(p_prayer_type_id, p_user_identifier);
  
  IF NOT v_rate_limit_check.is_allowed THEN
    RETURN QUERY SELECT 
      false,
      'Rate limit exceeded'::TEXT,
      0::BIGINT,
      v_rate_limit_check.seconds_remaining;
    RETURN;
  END IF;
  
  -- Determine increment amount
  IF v_prayer_type.type = 'count' THEN
    v_increment_amount := v_prayer_type.increment_value;
  ELSE
    v_increment_amount := v_prayer_type.time_increment_minutes;
  END IF;
  
  -- Insert prayer action
  INSERT INTO prayer_actions (
    prayer_type_id,
    user_identifier,
    ip_address,
    user_agent,
    increment_amount,
    action_type
  ) VALUES (
    p_prayer_type_id,
    p_user_identifier,
    p_ip_address,
    p_user_agent,
    v_increment_amount,
    'increment'
  );
  
  -- Get new total
  SELECT 
    CASE 
      WHEN v_prayer_type.type = 'count' THEN total_count
      ELSE total_time_minutes
    END INTO v_new_total
  FROM prayer_counters
  WHERE prayer_type_id = p_prayer_type_id;
  
  RETURN QUERY SELECT 
    true,
    'Prayer recorded successfully'::TEXT,
    v_new_total,
    0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon users
GRANT EXECUTE ON FUNCTION submit_prayer_action TO anon;
GRANT EXECUTE ON FUNCTION check_prayer_rate_limit TO anon;

-- =====================================================
-- FUNCTION: Reset prayer counter (Admin only)
-- =====================================================
CREATE OR REPLACE FUNCTION admin_reset_prayer_counter(
  p_prayer_type_id UUID,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  old_total BIGINT
) AS $$
DECLARE
  v_old_total BIGINT;
  v_prayer_type RECORD;
BEGIN
  -- Verify admin
  IF NOT is_admin() THEN
    RETURN QUERY SELECT false, 'Unauthorized'::TEXT, 0::BIGINT;
    RETURN;
  END IF;
  
  -- Get current total
  SELECT total_count INTO v_old_total
  FROM prayer_counters
  WHERE prayer_type_id = p_prayer_type_id;
  
  IF NOT FOUND THEN
    v_old_total := 0;
  END IF;
  
  -- Reset counter
  UPDATE prayer_counters
  SET 
    total_count = 0,
    total_time_minutes = 0,
    unique_contributors = 0,
    last_updated = NOW()
  WHERE prayer_type_id = p_prayer_type_id;
  
  -- Log action
  INSERT INTO prayer_actions (
    prayer_type_id,
    user_identifier,
    increment_amount,
    action_type,
    admin_id,
    admin_note
  ) VALUES (
    p_prayer_type_id,
    'ADMIN_RESET',
    -v_old_total,
    'admin_reset',
    auth.uid(),
    p_admin_note
  );
  
  -- Log to admin_logs
  INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    'reset_counter',
    'prayer_counter',
    p_prayer_type_id,
    jsonb_build_object(
      'old_total', v_old_total,
      'note', p_admin_note
    )
  );
  
  RETURN QUERY SELECT true, 'Counter reset successfully'::TEXT, v_old_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Edit prayer counter (Admin only)
-- =====================================================
CREATE OR REPLACE FUNCTION admin_edit_prayer_counter(
  p_prayer_type_id UUID,
  p_new_value BIGINT,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  old_value BIGINT,
  new_value BIGINT
) AS $$
DECLARE
  v_old_value BIGINT;
  v_prayer_type RECORD;
  v_difference BIGINT;
BEGIN
  -- Verify admin
  IF NOT is_admin() THEN
    RETURN QUERY SELECT false, 'Unauthorized'::TEXT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;
  
  -- Validate new value
  IF p_new_value < 0 THEN
    RETURN QUERY SELECT false, 'Value cannot be negative'::TEXT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;
  
  -- Get prayer type
  SELECT * INTO v_prayer_type
  FROM prayer_types
  WHERE id = p_prayer_type_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Prayer type not found'::TEXT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;
  
  -- Get current value
  IF v_prayer_type.type = 'count' THEN
    SELECT total_count INTO v_old_value
    FROM prayer_counters
    WHERE prayer_type_id = p_prayer_type_id;
  ELSE
    SELECT total_time_minutes INTO v_old_value
    FROM prayer_counters
    WHERE prayer_type_id = p_prayer_type_id;
  END IF;
  
  IF NOT FOUND THEN
    v_old_value := 0;
  END IF;
  
  v_difference := p_new_value - v_old_value;
  
  -- Update counter
  IF v_prayer_type.type = 'count' THEN
    UPDATE prayer_counters
    SET total_count = p_new_value, last_updated = NOW()
    WHERE prayer_type_id = p_prayer_type_id;
  ELSE
    UPDATE prayer_counters
    SET total_time_minutes = p_new_value, last_updated = NOW()
    WHERE prayer_type_id = p_prayer_type_id;
  END IF;
  
  -- Log action
  INSERT INTO prayer_actions (
    prayer_type_id,
    user_identifier,
    increment_amount,
    action_type,
    admin_id,
    admin_note
  ) VALUES (
    p_prayer_type_id,
    'ADMIN_EDIT',
    ABS(v_difference),
    'admin_edit',
    auth.uid(),
    p_admin_note
  );
  
  -- Log to admin_logs
  INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    'edit_counter',
    'prayer_counter',
    p_prayer_type_id,
    jsonb_build_object(
      'old_value', v_old_value,
      'new_value', p_new_value,
      'difference', v_difference,
      'note', p_admin_note
    )
  );
  
  RETURN QUERY SELECT true, 'Counter updated successfully'::TEXT, v_old_value, p_new_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Rollback specific prayer action (Admin)
-- =====================================================
CREATE OR REPLACE FUNCTION admin_rollback_prayer_action(
  p_action_id UUID,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_action RECORD;
  v_prayer_type RECORD;
BEGIN
  -- Verify admin
  IF NOT is_admin() THEN
    RETURN QUERY SELECT false, 'Unauthorized'::TEXT;
    RETURN;
  END IF;
  
  -- Get action details
  SELECT * INTO v_action
  FROM prayer_actions
  WHERE id = p_action_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Action not found'::TEXT;
    RETURN;
  END IF;
  
  -- Get prayer type
  SELECT * INTO v_prayer_type
  FROM prayer_types
  WHERE id = v_action.prayer_type_id;
  
  -- Reverse the counter
  IF v_prayer_type.type = 'count' THEN
    UPDATE prayer_counters
    SET 
      total_count = GREATEST(0, total_count - v_action.increment_amount),
      last_updated = NOW()
    WHERE prayer_type_id = v_action.prayer_type_id;
  ELSE
    UPDATE prayer_counters
    SET 
      total_time_minutes = GREATEST(0, total_time_minutes - v_action.increment_amount),
      last_updated = NOW()
    WHERE prayer_type_id = v_action.prayer_type_id;
  END IF;
  
  -- Delete the action
  DELETE FROM prayer_actions WHERE id = p_action_id;
  
  -- Log rollback
  INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    'rollback_action',
    'prayer_action',
    p_action_id,
    jsonb_build_object(
      'prayer_type_id', v_action.prayer_type_id,
      'increment_amount', v_action.increment_amount,
      'original_user', v_action.user_identifier,
      'note', p_admin_note
    )
  );
  
  RETURN QUERY SELECT true, 'Action rolled back successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get prayer statistics
-- =====================================================
CREATE OR REPLACE FUNCTION get_prayer_statistics(
  p_prayer_type_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  prayer_type_id UUID,
  prayer_name TEXT,
  total_actions BIGINT,
  unique_users BIGINT,
  total_value BIGINT,
  first_action TIMESTAMPTZ,
  last_action TIMESTAMPTZ,
  peak_hour INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id,
    pt.name,
    COUNT(pa.id)::BIGINT AS total_actions,
    COUNT(DISTINCT pa.user_identifier)::BIGINT AS unique_users,
    SUM(pa.increment_amount)::BIGINT AS total_value,
    MIN(pa.created_at) AS first_action,
    MAX(pa.created_at) AS last_action,
    MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM pa.created_at))::INTEGER AS peak_hour
  FROM prayer_types pt
  LEFT JOIN prayer_actions pa ON pt.id = pa.prayer_type_id
    AND (p_start_date IS NULL OR pa.created_at >= p_start_date)
    AND (p_end_date IS NULL OR pa.created_at <= p_end_date)
    AND pa.action_type = 'increment'
  WHERE p_prayer_type_id IS NULL OR pt.id = p_prayer_type_id
  GROUP BY pt.id, pt.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_prayer_statistics TO authenticated;

CREATE OR REPLACE FUNCTION count_unique_contributors()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_identifier)
    FROM prayer_actions
    WHERE action_type = 'increment'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION count_unique_contributors TO authenticated;
