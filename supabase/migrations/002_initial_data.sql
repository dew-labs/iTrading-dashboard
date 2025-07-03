/*
  # 002 Initial Data & Configuration Migration (Merged)

  This migration sets up default role permissions and initial configuration logic for iTrading Dashboard.
  Includes:
  - Default role permissions
  - Post authorship setup (assign default author to posts)
  - Banner naming setup (assign names to banners if missing)
  - Final verification/reporting
*/

-- ===============================================
-- DEFAULT ROLE PERMISSIONS
-- ===============================================

INSERT INTO role_permissions (role, resource, action) VALUES
('user', 'posts', 'read'),
('user', 'products', 'read'),
('user', 'brokers', 'read'),
('user', 'banners', 'read'),
('user', 'notifications', 'read'),
('user', 'user_notifications', 'read'),
('user', 'user_notifications', 'create'),
('user', 'user_notifications', 'update'),
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
('moderator', 'notifications', 'read'),
('moderator', 'user_notifications', 'read'),
('moderator', 'user_notifications', 'create'),
('moderator', 'user_notifications', 'update'),
('moderator', 'images', 'read'),
('moderator', 'images', 'create'),
('moderator', 'images', 'update'),
('moderator', 'images', 'delete'),
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
('admin', 'role_permissions', 'read'),
('admin', 'role_permissions', 'create'),
('admin', 'role_permissions', 'update'),
('admin', 'role_permissions', 'delete'),
('admin', 'notifications', 'read'),
('admin', 'notifications', 'create'),
('admin', 'notifications', 'update'),
('admin', 'notifications', 'delete'),
('admin', 'user_notifications', 'read'),
('admin', 'user_notifications', 'create'),
('admin', 'user_notifications', 'update'),
('admin', 'user_notifications', 'delete'),
('admin', 'images', 'read'),
('admin', 'images', 'create'),
('admin', 'images', 'update'),
('admin', 'images', 'delete')
ON CONFLICT (role, resource, action) DO NOTHING;

-- ===============================================
-- POST AUTHORSHIP SETUP
-- ===============================================

DO $$
DECLARE
  admin_user_id uuid;
  posts_updated int;
BEGIN
  SELECT id INTO admin_user_id FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1;
  IF admin_user_id IS NOT NULL THEN
    UPDATE posts SET author_id = admin_user_id WHERE author_id IS NULL;
    GET DIAGNOSTICS posts_updated = ROW_COUNT;
    IF posts_updated > 0 THEN
      RAISE NOTICE 'Updated % existing posts with default author (%)', posts_updated, admin_user_id;
    END IF;
  END IF;
END;
$$;

-- ===============================================
-- BANNER NAMING SETUP
-- ===============================================

DO $$
DECLARE
  banners_updated int;
BEGIN
  UPDATE banners
  SET name = CASE
    WHEN target_url IS NOT NULL AND target_url != '' THEN
      CONCAT('Banner for ', COALESCE(NULLIF(REGEXP_REPLACE(target_url, '^https?://(www\.)?([^/]+).*', '\2'), ''), 'Website'))
    ELSE CONCAT('Banner #', LEFT(id::text, 8))
  END
  WHERE name IS NULL OR name = '';
  GET DIAGNOSTICS banners_updated = ROW_COUNT;
  IF banners_updated > 0 THEN
    RAISE NOTICE 'Updated % banners with proper names', banners_updated;
  END IF;
END;
$$;

-- ===============================================
-- FINAL VERIFICATION & REPORTING
-- ===============================================

DO $$
DECLARE
  total_users int;
  total_posts int;
  total_products int;
  total_brokers int;
  total_banners int;
  total_permissions int;
  admin_users int;
BEGIN
  SELECT count(*) INTO total_users FROM users;
  SELECT count(*) INTO total_posts FROM posts;
  SELECT count(*) INTO total_products FROM products;
  SELECT count(*) INTO total_brokers FROM brokers;
  SELECT count(*) INTO total_banners FROM banners;
  SELECT count(*) INTO total_permissions FROM role_permissions;
  SELECT count(*) INTO admin_users FROM users WHERE role = 'admin';
  RAISE NOTICE 'DATABASE SETUP COMPLETE!';
  RAISE NOTICE 'Users: % (% admins)', total_users, admin_users;
  RAISE NOTICE 'Posts: %', total_posts;
  RAISE NOTICE 'Products: %', total_products;
  RAISE NOTICE 'Brokers: %', total_brokers;
  RAISE NOTICE 'Banners: %', total_banners;
  RAISE NOTICE 'Role Permissions: %', total_permissions;
END;
$$;
