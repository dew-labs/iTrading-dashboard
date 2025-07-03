/*
  # Audit Logs Migration

  This migration establishes the audit logging system including:
  - Audit logs table for tracking admin/super admin activities
  - Audit trigger functions
  - Audit triggers for all major tables
  - Audit statistics function
  - Proper permissions and RLS
*/

-- ===============================================
-- AUDIT LOGS TABLE
-- ===============================================

-- Create audit_logs table
CREATE TABLE audit_logs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

  -- Who performed the action
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_email text,
  user_role user_role,

  -- What was changed
  table_name text NOT NULL,
  record_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),

  -- Change details
  old_values jsonb,
  new_values jsonb,
  changed_fields text[], -- Array of field names that changed

  -- Context
  ip_address text,
  user_agent text,
  session_id text,

  -- Metadata
  created_at timestamptz DEFAULT now()
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_user_role ON audit_logs(user_role);

-- ===============================================
-- ROW LEVEL SECURITY
-- ===============================================

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Admins can manage audit logs (delete old ones, etc.)
CREATE POLICY "Admins can manage audit logs"
  ON audit_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ===============================================
-- AUDIT TRIGGER FUNCTION
-- ===============================================

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
DECLARE
  current_user_record users%ROWTYPE;
  old_values jsonb := '{}';
  new_values jsonb := '{}';
  changed_fields text[] := ARRAY[]::text[];
  excluded_columns text[] := ARRAY['updated_at', 'last_login']; -- Fields to exclude from auditing
  record_id_value text;
BEGIN
  -- Get current user details
  SELECT * INTO current_user_record
  FROM users
  WHERE id = auth.uid();

  -- Only audit if user is admin or moderator
  IF current_user_record.role NOT IN ('admin', 'moderator') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get record ID (handle different ID types)
  IF TG_OP = 'DELETE' THEN
    record_id_value := OLD.id::text;
  ELSE
    record_id_value := NEW.id::text;
  END IF;

  -- Prepare values based on operation
  IF TG_OP = 'DELETE' THEN
    old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);

    -- Determine changed fields
    SELECT array_agg(key) INTO changed_fields
    FROM (
      SELECT key
      FROM jsonb_each(to_jsonb(NEW))
      WHERE NOT (key = ANY(excluded_columns))
      AND to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
    ) AS changes;

    -- Skip if no meaningful fields changed
    IF array_length(changed_fields, 1) IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    user_id,
    user_email,
    user_role,
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    changed_fields,
    session_id
  ) VALUES (
    current_user_record.id,
    current_user_record.email,
    current_user_record.role,
    TG_TABLE_NAME,
    record_id_value,
    TG_OP,
    old_values,
    new_values,
    changed_fields,
    current_setting('audit.session_id', true)
  );

  RETURN COALESCE(NEW, OLD);

EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if audit fails
    RAISE WARNING 'Audit logging failed for table % operation %: % - %',
      TG_TABLE_NAME, TG_OP, SQLSTATE, SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- AUDIT TRIGGERS FOR TABLES
-- ===============================================

-- Users table
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Posts table
CREATE TRIGGER audit_posts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Products table
CREATE TRIGGER audit_products_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Brokers table
CREATE TRIGGER audit_brokers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON brokers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Banners table
CREATE TRIGGER audit_banners_trigger
  AFTER INSERT OR UPDATE OR DELETE ON banners
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- User permissions table
CREATE TRIGGER audit_user_permissions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_permissions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Role permissions table
CREATE TRIGGER audit_role_permissions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON role_permissions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ===============================================
-- AUDIT STATISTICS FUNCTION
-- ===============================================

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_stats()
RETURNS jsonb AS $$
DECLARE
  total_count integer;
  today_count integer;
  week_count integer;
  most_active jsonb;
  activity_by_table jsonb;
  activity_by_action jsonb;
  recent_activity jsonb;
BEGIN
  -- Total activities
  SELECT COUNT(*) INTO total_count FROM audit_logs;

  -- Activities today
  SELECT COUNT(*) INTO today_count
  FROM audit_logs
  WHERE created_at >= CURRENT_DATE;

  -- Activities this week
  SELECT COUNT(*) INTO week_count
  FROM audit_logs
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Most active user
  SELECT jsonb_build_object(
    'user_email', COALESCE(user_email, 'Unknown'),
    'activity_count', activity_count
  ) INTO most_active
  FROM (
    SELECT user_email, COUNT(*) as activity_count
    FROM audit_logs
    WHERE user_email IS NOT NULL
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_email
    ORDER BY activity_count DESC
    LIMIT 1
  ) most_active_query;

  -- Activity by table
  SELECT jsonb_object_agg(table_name, activity_count) INTO activity_by_table
  FROM (
    SELECT table_name, COUNT(*) as activity_count
    FROM audit_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY table_name
    ORDER BY activity_count DESC
  ) table_stats;

  -- Activity by action
  SELECT jsonb_object_agg(action, activity_count) INTO activity_by_action
  FROM (
    SELECT action, COUNT(*) as activity_count
    FROM audit_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY action
    ORDER BY activity_count DESC
  ) action_stats;

  -- Recent activity (last 10)
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_email', user_email,
      'table_name', table_name,
      'action', action,
      'created_at', created_at
    )
  ) INTO recent_activity
  FROM (
    SELECT user_email, table_name, action, created_at
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT 10
  ) recent_query;

  RETURN jsonb_build_object(
    'total_activities', total_count,
    'activities_today', today_count,
    'activities_week', week_count,
    'most_active_user', COALESCE(most_active, '{}'),
    'activity_by_table', COALESCE(activity_by_table, '{}'),
    'activity_by_action', COALESCE(activity_by_action, '{}'),
    'recent_activity', COALESCE(recent_activity, '[]')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_audit_stats() TO authenticated;

-- ===============================================
-- ADD AUDIT PERMISSIONS TO ROLES
-- ===============================================

-- Add audit permissions to role_permissions table
INSERT INTO role_permissions (role, resource, action) VALUES
-- Admin can view and manage audit logs
('admin', 'audit_logs', 'read'),
('admin', 'audit_logs', 'delete')
ON CONFLICT (role, resource, action) DO NOTHING;

-- ===============================================
-- TABLE COMMENTS
-- ===============================================

COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for admin and moderator activities';
COMMENT ON COLUMN audit_logs.user_id IS 'User who performed the action';
COMMENT ON COLUMN audit_logs.user_email IS 'Email of user who performed the action (for historical record)';
COMMENT ON COLUMN audit_logs.user_role IS 'Role of user at time of action';
COMMENT ON COLUMN audit_logs.table_name IS 'Database table that was affected';
COMMENT ON COLUMN audit_logs.record_id IS 'ID of the affected record';
COMMENT ON COLUMN audit_logs.action IS 'Type of operation: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values before change (for UPDATE and DELETE)';
COMMENT ON COLUMN audit_logs.new_values IS 'New values after change (for INSERT and UPDATE)';
COMMENT ON COLUMN audit_logs.changed_fields IS 'Array of field names that were modified';
COMMENT ON COLUMN audit_logs.session_id IS 'Session identifier for tracking user sessions';

-- ===============================================
-- COMPLETION MESSAGE
-- ===============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 ================================';
  RAISE NOTICE '🔍 AUDIT SYSTEM INSTALLED!';
  RAISE NOTICE '🔍 ================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Audit logs table created';
  RAISE NOTICE '✅ Audit triggers installed on all major tables';
  RAISE NOTICE '✅ Audit statistics function available';
  RAISE NOTICE '✅ Proper permissions and RLS configured';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Features:';
  RAISE NOTICE '  • Tracks admin/moderator activities';
  RAISE NOTICE '  • Records before/after values';
  RAISE NOTICE '  • Identifies changed fields';
  RAISE NOTICE '  • Provides detailed statistics';
  RAISE NOTICE '  • Secure with Row Level Security';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to track admin activities!';
  RAISE NOTICE '';
END;
$$;
