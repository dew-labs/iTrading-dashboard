/*
  # Simplified Realistic Seed Data for iTrading Dashboard

  This file contains realistic seed data that works with hosted Supabase.
  Uses the existing admin user for relationships and provides comprehensive
  sample data for all resources (without images for cleaner setup).
*/

-- ===============================================
-- CLEAN EXISTING SEED DATA
-- ===============================================

DELETE FROM images;
DELETE FROM banners;
DELETE FROM products;
DELETE FROM posts WHERE author_id = (SELECT id FROM users WHERE email = 'admin@admin.com');
DELETE FROM brokers;
DELETE FROM role_permissions;

-- ===============================================
-- DEFAULT ROLE PERMISSIONS
-- ===============================================

-- Insert default permissions for different roles
INSERT INTO role_permissions (role, resource, action) VALUES
-- User role permissions (read-only access to most content - users sign up themselves)
('user', 'posts', 'read'),
('user', 'products', 'read'),
('user', 'brokers', 'read'),
('user', 'banners', 'read'),

-- Moderator role permissions (CRUD on posts, banners, brokers + view users - can be invited)
('moderator', 'posts', 'read'),
('moderator', 'posts', 'create'),
('moderator', 'posts', 'update'),
('moderator', 'posts', 'delete'),
('moderator', 'banners', 'read'),
('moderator', 'banners', 'create'),
('moderator', 'banners', 'update'),
('moderator', 'banners', 'delete'),
('moderator', 'brokers', 'read'),
('moderator', 'brokers', 'create'),
('moderator', 'brokers', 'update'),
('moderator', 'brokers', 'delete'),
('moderator', 'users', 'read'),
('moderator', 'products', 'read'),
('moderator', 'images', 'read'),
('moderator', 'images', 'create'),
('moderator', 'images', 'update'),
('moderator', 'images', 'delete'),

-- Admin role permissions (full access to everything - can be invited)
('admin', 'posts', 'read'),
('admin', 'posts', 'create'),
('admin', 'posts', 'update'),
('admin', 'posts', 'delete'),
('admin', 'products', 'read'),
('admin', 'products', 'create'),
('admin', 'products', 'update'),
('admin', 'products', 'delete'),
('admin', 'brokers', 'read'),
('admin', 'brokers', 'create'),
('admin', 'brokers', 'update'),
('admin', 'brokers', 'delete'),
('admin', 'banners', 'read'),
('admin', 'banners', 'create'),
('admin', 'banners', 'update'),
('admin', 'banners', 'delete'),
('admin', 'users', 'read'),
('admin', 'users', 'create'),
('admin', 'users', 'update'),
('admin', 'users', 'delete'),
('admin', 'user_permissions', 'read'),
('admin', 'user_permissions', 'create'),
('admin', 'user_permissions', 'update'),
('admin', 'user_permissions', 'delete'),
('admin', 'role_permissions', 'read'),
('admin', 'role_permissions', 'create'),
('admin', 'role_permissions', 'update'),
('admin', 'role_permissions', 'delete'),
('admin', 'images', 'read'),
('admin', 'images', 'create'),
('admin', 'images', 'update'),
('admin', 'images', 'delete'),
('admin', 'audit_logs', 'read'),
('admin', 'audit_logs', 'delete')
ON CONFLICT (role, resource, action) DO NOTHING;

-- ===============================================
-- BROKER CATEGORIES (Available categories for brokers)
-- ===============================================

INSERT INTO broker_categories (name) VALUES
('FX/CFD'),
('Crypto'),
('Cards')
ON CONFLICT (name) DO NOTHING;



-- ===============================================
-- SEED DATA SUMMARY REPORT
-- ===============================================

DO $$
DECLARE
    total_users int;
    total_broker_categories int;
    admin_user_exists boolean;
BEGIN
    -- Count all seeded data
    SELECT count(*) INTO total_users FROM users;
    SELECT count(*) INTO total_broker_categories FROM broker_categories;
    SELECT exists(SELECT 1 FROM users WHERE email = 'admin@admin.com') INTO admin_user_exists;

    -- Generate report
    RAISE NOTICE '';
    RAISE NOTICE '🎉 =======================================';
    RAISE NOTICE '🎉 SEED DATA COMPLETE!';
    RAISE NOTICE '🎉 =======================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SEEDED DATA SUMMARY:';
    RAISE NOTICE '👥 Users: % (admin only)', total_users;
    RAISE NOTICE '📂 Broker Categories: % (FX/CFD, Crypto, Cards)', total_broker_categories;
    RAISE NOTICE '';

    IF admin_user_exists THEN
        RAISE NOTICE '✅ Admin account ready:';
        RAISE NOTICE '   📧 admin@admin.com - password: 123123123';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '📝 NOTE: Additional users should be created through:';
    RAISE NOTICE '   1. Your application''s signup process';
    RAISE NOTICE '   2. Supabase Auth dashboard';
    RAISE NOTICE '   3. Auth API calls';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your application is ready with minimal seed data!';
    RAISE NOTICE '';
END $$;
