-- Seed data for development and testing

-- Insert default role permissions
INSERT INTO role_permissions (role, resource, action) VALUES
-- User permissions
('user', 'profile', 'read'),
('user', 'profile', 'update'),
('user', 'posts', 'read'),
('user', 'products', 'read'),
('user', 'banners', 'read'),

-- Admin permissions
('admin', 'profile', 'read'),
('admin', 'profile', 'update'),
('admin', 'posts', 'read'),
('admin', 'posts', 'create'),
('admin', 'posts', 'update'),
('admin', 'posts', 'delete'),
('admin', 'products', 'read'),
('admin', 'products', 'create'),
('admin', 'products', 'update'),
('admin', 'products', 'delete'),
('admin', 'banners', 'read'),
('admin', 'banners', 'create'),
('admin', 'banners', 'update'),
('admin', 'banners', 'delete'),
('admin', 'users', 'read'),
('admin', 'users', 'create'),
('admin', 'users', 'update'),

-- Super admin permissions (all permissions)
('super_admin', 'profile', 'read'),
('super_admin', 'profile', 'update'),
('super_admin', 'posts', 'read'),
('super_admin', 'posts', 'create'),
('super_admin', 'posts', 'update'),
('super_admin', 'posts', 'delete'),
('super_admin', 'products', 'read'),
('super_admin', 'products', 'create'),
('super_admin', 'products', 'update'),
('super_admin', 'products', 'delete'),
('super_admin', 'banners', 'read'),
('super_admin', 'banners', 'create'),
('super_admin', 'banners', 'update'),
('super_admin', 'banners', 'delete'),
('super_admin', 'users', 'read'),
('super_admin', 'users', 'create'),
('super_admin', 'users', 'update'),
('super_admin', 'users', 'delete'),
('super_admin', 'permissions', 'read'),
('super_admin', 'permissions', 'create'),
('super_admin', 'permissions', 'update'),
('super_admin', 'permissions', 'delete');

-- ============================================================================
-- ADMIN USER SETUP
-- ============================================================================
-- Admin user is created in the migration file 20250622070403_create_admin_user.sql

-- ============================================================================

-- Sample posts
INSERT INTO posts (title, content, type) VALUES
('Welcome to Our Platform', 'We are excited to announce the launch of our new platform. This marks a significant milestone in our journey to provide better services to our users.', 'news'),
('Upcoming Maintenance Window', 'We will be performing scheduled maintenance on our systems this weekend. Please expect brief service interruptions.', 'news'),
('Annual Conference 2024', 'Join us for our annual conference featuring industry leaders, workshops, and networking opportunities. Registration is now open.', 'event'),
('Product Launch Event', 'We are hosting an exclusive product launch event next month. Limited seats available for this special occasion.', 'event'),
('Terms of Use', 'By using our platform, you agree to comply with and be bound by the following terms and conditions of use. These terms govern your access to and use of our services.', 'terms_of_use'),
('Privacy Policy', 'This Privacy Policy describes how we collect, use, and protect your personal information when you use our services. We are committed to protecting your privacy.', 'privacy_policy');

-- Sample products
INSERT INTO products (name, price, description, subscription) VALUES
('Premium Plan', 29.99, 'Access to all premium features including advanced analytics, priority support, and unlimited storage.', true),
('Professional Tools', 99.99, 'Complete set of professional tools for advanced users. One-time purchase with lifetime updates.', false),
('Enterprise Solution', 199.99, 'Comprehensive enterprise solution with dedicated support, custom integrations, and advanced security.', true),
('Starter Package', 9.99, 'Perfect for beginners. Includes basic features and email support.', true),
('Custom Development', 499.99, 'Custom development services tailored to your specific needs. Includes consultation and implementation.', false),
('Analytics Dashboard', 49.99, 'Advanced analytics and reporting dashboard with real-time insights and custom metrics.', true);

-- Sample banners
INSERT INTO banners (target_url, is_active) VALUES
('https://example.com/welcome', true),
('https://example.com/promotion', true),
('https://example.com/new-features', true),
('https://example.com/maintenance', false);

-- Sample notifications (system-wide)
INSERT INTO notifications (title, description, user_id) VALUES
('Welcome to the Platform', 'Thank you for joining our platform. We are excited to have you on board and look forward to helping you achieve your goals!', NULL),
('System Maintenance Scheduled', 'We will be performing system maintenance this weekend from 2:00 AM to 6:00 AM UTC. Please save your work and expect brief service interruptions.', NULL),
('New Features Available', 'Check out our latest features including improved dashboard, enhanced security, and better performance monitoring tools.', NULL),
('Security Update', 'We have implemented additional security measures to protect your data. Please review your account settings and update your password if needed.', NULL);

-- Sample images (demonstrating the centralized image system)
-- Using text values for record_id to handle both bigint and uuid references
INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type) VALUES
('products', '1', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'Premium Plan illustration', 'image/jpeg'),
('products', '2', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg', 'Professional Tools showcase', 'image/jpeg'),
('products', '3', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', 'Enterprise Solution overview', 'image/jpeg'),
('posts', '1', 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg', 'Welcome announcement image', 'image/jpeg'),
('posts', '3', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg', 'Conference event image', 'image/jpeg');

-- Add banner images after banners are created
DO $$
DECLARE
    banner_id_1 uuid;
    banner_id_2 uuid;
BEGIN
    -- Get banner IDs
    SELECT id INTO banner_id_1 FROM banners WHERE target_url = 'https://example.com/welcome' LIMIT 1;
    SELECT id INTO banner_id_2 FROM banners WHERE target_url = 'https://example.com/promotion' LIMIT 1;

    -- Insert banner images
    IF banner_id_1 IS NOT NULL THEN
        INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type)
        VALUES ('banners', banner_id_1::text, 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg', 'Welcome banner image', 'image/jpeg');
    END IF;

    IF banner_id_2 IS NOT NULL THEN
        INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type)
        VALUES ('banners', banner_id_2::text, 'https://images.pexels.com/photos/586996/pexels-photo-586996.jpeg', 'Promotion banner image', 'image/jpeg');
    END IF;
END $$;
