/*
  # Create Indexes Migration

  This migration creates all database indexes for better performance.
*/

-- Create indexes for better performance
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_status_type ON posts(status, type);
CREATE INDEX idx_posts_published_at ON posts(published_at);

CREATE INDEX idx_products_subscription ON products(subscription);

CREATE INDEX idx_banners_active ON banners(is_active);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);

CREATE INDEX idx_role_permissions_role ON role_permissions(role);

CREATE INDEX idx_images_table_record ON images(table_name, record_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(is_read);
