/*
  # Sample Data for Development

  1. Sample Data
    - Insert sample posts (news and events)
    - Insert sample products with different categories
    - Insert sample banners with different placements
    - Note: Users will be created automatically when they sign up

  2. Purpose
    - Provide realistic data for development and testing
    - Demonstrate different content types and statuses
    - Show various product categories and banner placements
*/

-- Insert sample posts
INSERT INTO posts (title, content, type, status, author, views, featured_image, excerpt, tags, event_date, event_location) VALUES
(
  'New Product Launch Event',
  'We are excited to announce the launch of our latest product line. Join us for an exclusive preview and networking event.',
  'event',
  'published',
  'John Smith',
  1250,
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
  'Join us for an exclusive product launch event with networking opportunities.',
  ARRAY['product', 'launch', 'event', 'networking'],
  '2024-02-15 18:00:00+00',
  'Convention Center, Downtown'
),
(
  'Company Quarterly Results',
  'Our Q4 results show significant growth across all business segments. Revenue increased by 25% compared to the previous quarter.',
  'news',
  'published',
  'Sarah Wilson',
  890,
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
  'Q4 results demonstrate strong performance with 25% revenue growth.',
  ARRAY['quarterly', 'results', 'growth', 'revenue'],
  NULL,
  NULL
),
(
  'Annual Conference 2024',
  'Save the date for our annual conference featuring industry leaders, workshops, and networking opportunities.',
  'event',
  'draft',
  'Mike Johnson',
  0,
  'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg',
  'Annual conference with industry leaders and workshops.',
  ARRAY['conference', 'annual', 'workshops', 'networking'],
  '2024-06-20 09:00:00+00',
  'Grand Hotel Conference Center'
),
(
  'Industry Partnership Announcement',
  'We are pleased to announce a strategic partnership that will enhance our service offerings and expand our market reach.',
  'news',
  'published',
  'Emma Davis',
  2100,
  'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg',
  'Strategic partnership announcement to enhance services and market reach.',
  ARRAY['partnership', 'strategic', 'expansion', 'services'],
  NULL,
  NULL
);

-- Insert sample products
INSERT INTO products (name, description, price, stock, sku, category, status, featured_image, images, weight, dimensions) VALUES
(
  'Premium Wireless Headphones',
  'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
  299.99,
  45,
  'PWH-001',
  'Electronics',
  'active',
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
  ARRAY['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'],
  0.35,
  '20cm x 18cm x 8cm'
),
(
  'Smart Fitness Watch',
  'Advanced fitness tracking with heart rate monitoring, GPS, and smartphone connectivity. Track your health and fitness goals.',
  199.99,
  0,
  'SFW-002',
  'Wearables',
  'out-of-stock',
  'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
  ARRAY['https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg'],
  0.08,
  '4.5cm x 4cm x 1.2cm'
),
(
  'Ergonomic Office Chair',
  'Comfortable ergonomic office chair with lumbar support, adjustable height, and premium materials for long work sessions.',
  449.99,
  12,
  'EOC-003',
  'Furniture',
  'active',
  'https://images.pexels.com/photos/586996/pexels-photo-586996.jpeg',
  ARRAY['https://images.pexels.com/photos/586996/pexels-photo-586996.jpeg'],
  15.5,
  '65cm x 65cm x 120cm'
),
(
  'Professional Camera Lens',
  'High-performance camera lens for professional photography with superior optics and build quality.',
  899.99,
  8,
  'PCL-004',
  'Photography',
  'inactive',
  'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  ARRAY['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'],
  0.75,
  '8cm x 8cm x 12cm'
);

-- Insert sample banners
INSERT INTO banners (title, description, image_url, link_url, placement, status, start_date, end_date, clicks, impressions, priority) VALUES
(
  'Summer Sale Campaign',
  'Limited time summer sale with up to 50% off on selected items. Don''t miss out on these amazing deals!',
  'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg',
  'https://example.com/summer-sale',
  'header',
  'active',
  '2024-01-10 00:00:00+00',
  '2024-02-10 23:59:59+00',
  1250,
  15400,
  10
),
(
  'New Product Launch',
  'Be the first to experience our revolutionary new product. Pre-order now and get exclusive early access.',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
  'https://example.com/new-product',
  'popup',
  'scheduled',
  '2024-01-20 00:00:00+00',
  '2024-01-30 23:59:59+00',
  0,
  0,
  8
),
(
  'Holiday Special Offer',
  'Celebrate the holidays with our special offers and gift packages. Perfect for your loved ones.',
  'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg',
  'https://example.com/holiday-offers',
  'sidebar',
  'inactive',
  '2023-12-01 00:00:00+00',
  '2023-12-31 23:59:59+00',
  890,
  12000,
  5
),
(
  'Newsletter Signup',
  'Stay updated with our latest news, products, and exclusive offers. Subscribe to our newsletter today!',
  'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
  'https://example.com/newsletter',
  'footer',
  'active',
  '2024-01-01 00:00:00+00',
  '2024-12-31 23:59:59+00',
  567,
  8900,
  3
);