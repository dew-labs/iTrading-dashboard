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
-- BROKERS (Realistic Trading Brokers)
-- ===============================================

DO $$
DECLARE
    broker_id uuid;
BEGIN
    -- Charles Schwab
    INSERT INTO brokers (name, established_in, headquarter) VALUES
    (
      'Charles Schwab',
      1971,
      'Westlake, Texas, USA'
    ) RETURNING id INTO broker_id;
    INSERT INTO images (table_name, record_id, type, path) VALUES ('brokers', broker_id, 'logo', 'logos/charles_schwab.png');

    -- Interactive Brokers
    INSERT INTO brokers (name, established_in, headquarter) VALUES
    (
      'Interactive Brokers',
      1978,
      'Greenwich, Connecticut, USA'
    ) RETURNING id INTO broker_id;
    INSERT INTO images (table_name, record_id, type, path) VALUES ('brokers', broker_id, 'logo', 'logos/interactive_brokers.png');

    -- TD Ameritrade
    INSERT INTO brokers (name, established_in, headquarter) VALUES
    (
      'TD Ameritrade',
      1975,
      'Omaha, Nebraska, USA'
    ) RETURNING id INTO broker_id;
    INSERT INTO images (table_name, record_id, type, path) VALUES ('brokers', broker_id, 'logo', 'logos/td_ameritrade.png');

    -- E*TRADE
    INSERT INTO brokers (name, established_in, headquarter) VALUES
    (
      'E*TRADE',
      1991,
      'Arlington, Virginia, USA'
    ) RETURNING id INTO broker_id;
    INSERT INTO images (table_name, record_id, type, path) VALUES ('brokers', broker_id, 'logo', 'logos/e_trade.png');

    -- Robinhood
    INSERT INTO brokers (name, established_in, headquarter) VALUES
    (
      'Robinhood',
      2013,
      'Menlo Park, California, USA'
    ) RETURNING id INTO broker_id;
    INSERT INTO images (table_name, record_id, type, path) VALUES ('brokers', broker_id, 'logo', 'logos/robinhood.png');

    -- Fidelity Investments
    INSERT INTO brokers (name, established_in, headquarter) VALUES
    (
      'Fidelity Investments',
      1946,
      'Boston, Massachusetts, USA'
    ) RETURNING id INTO broker_id;
    INSERT INTO images (table_name, record_id, type, path) VALUES ('brokers', broker_id, 'logo', 'logos/fidelity_investments.png');

    -- Vanguard
    INSERT INTO brokers (name, established_in, headquarter) VALUES
    (
      'Vanguard',
      1975,
      'Malvern, Pennsylvania, USA'
    ) RETURNING id INTO broker_id;
    INSERT INTO images (table_name, record_id, type, path) VALUES ('brokers', broker_id, 'logo', 'logos/vanguard.png');

    -- Merrill Lynch
    INSERT INTO brokers (name, established_in, headquarter) VALUES
    (
      'Merrill Lynch',
      1914,
      'New York City, New York, USA'
    ) RETURNING id INTO broker_id;
    INSERT INTO images (table_name, record_id, type, path) VALUES ('brokers', broker_id, 'logo', 'logos/merrill_lynch.png');
END $$;

-- ===============================================
-- PRODUCTS (Trading & Investment Products)
-- ===============================================

DO $$
DECLARE
    prod_id uuid;
BEGIN
    -- Premium Trading Platform
    INSERT INTO products (price, affiliate_link) VALUES
      (49.99, 'https://affiliate.example.com/premium-trading-platform') RETURNING id INTO prod_id;
    INSERT INTO products_translations (product_id, language_code, name, description) VALUES
      (prod_id, 'en', 'Premium Trading Platform', 'Advanced trading platform with real-time market data, advanced charting tools, portfolio analytics, and priority customer support. Perfect for active traders who need professional-grade tools.');

    -- Market Research Pro
    INSERT INTO products (price, affiliate_link) VALUES
      (29.99, 'https://affiliate.example.com/market-research-pro') RETURNING id INTO prod_id;
    INSERT INTO products_translations (product_id, language_code, name, description) VALUES
      (prod_id, 'en', 'Market Research Pro', 'Comprehensive market research and analysis tools including sector analysis, earnings forecasts, technical indicators, and expert market insights updated daily.');

    -- Algorithmic Trading Suite
    INSERT INTO products (price, affiliate_link) VALUES
      (199.99, 'https://affiliate.example.com/algorithmic-trading-suite') RETURNING id INTO prod_id;
    INSERT INTO products_translations (product_id, language_code, name, description) VALUES
      (prod_id, 'en', 'Algorithmic Trading Suite', 'Complete algorithmic trading solution with backtesting capabilities, strategy development tools, and automated execution. Includes popular trading algorithms and custom strategy builder.');

    -- Risk Management Dashboard
    INSERT INTO products (price, affiliate_link) VALUES
      (79.99, 'https://affiliate.example.com/risk-management-dashboard') RETURNING id INTO prod_id;
    INSERT INTO products_translations (product_id, language_code, name, description) VALUES
      (prod_id, 'en', 'Risk Management Dashboard', 'Professional risk management tools with portfolio risk assessment, Value at Risk (VaR) calculations, stress testing, and real-time risk monitoring for your investments.');

    -- Mobile Trading App Pro
    INSERT INTO products (price, affiliate_link) VALUES
      (19.99, 'https://affiliate.example.com/mobile-trading-app-pro') RETURNING id INTO prod_id;
    INSERT INTO products_translations (product_id, language_code, name, description) VALUES
      (prod_id, 'en', 'Mobile Trading App Pro', 'Enhanced mobile trading experience with advanced order types, real-time alerts, mobile charts, and seamless synchronization across all your devices.');

    -- Educational Trading Course
    INSERT INTO products (price, affiliate_link) VALUES
      (149.99, 'https://affiliate.example.com/educational-trading-course') RETURNING id INTO prod_id;
    INSERT INTO products_translations (product_id, language_code, name, description) VALUES
      (prod_id, 'en', 'Educational Trading Course', 'Comprehensive online trading course covering fundamentals, technical analysis, risk management, and advanced trading strategies. Includes video lessons, quizzes, and certification.');

    -- Portfolio Analytics Pro
    INSERT INTO products (price, affiliate_link) VALUES
      (39.99, 'https://affiliate.example.com/portfolio-analytics-pro') RETURNING id INTO prod_id;
    INSERT INTO products_translations (product_id, language_code, name, description) VALUES
      (prod_id, 'en', 'Portfolio Analytics Pro', 'Advanced portfolio analysis with performance attribution, benchmark comparison, asset allocation tracking, and detailed reporting tools for serious investors.');

    -- Options Trading Tools
    INSERT INTO products (price, affiliate_link) VALUES
      (89.99, 'https://affiliate.example.com/options-trading-tools') RETURNING id INTO prod_id;
    INSERT INTO products_translations (product_id, language_code, name, description) VALUES
      (prod_id, 'en', 'Options Trading Tools', 'Specialized options trading platform with options chain analysis, volatility modeling, Greeks calculator, and strategy analyzer for options traders.');
END $$;

-- ===============================================
-- POSTS (Trading News & Content) - Using Admin as Author
-- ===============================================

-- First insert posts without translatable fields
DO $$
DECLARE
    post1_id uuid;
    post2_id uuid;
    post3_id uuid;
    post4_id uuid;
    post5_id uuid;
    post6_id uuid;
    post7_id uuid;
    post8_id uuid;
BEGIN
    -- Insert posts and capture their IDs
    INSERT INTO posts (type, status, author_id, views) VALUES
    ('news', 'published', (SELECT id FROM users WHERE email = 'admin@admin.com'), 2847)
    RETURNING id INTO post1_id;

    INSERT INTO posts (type, status, author_id, views) VALUES
    ('news', 'published', (SELECT id FROM users WHERE email = 'admin@admin.com'), 1924)
    RETURNING id INTO post2_id;

    INSERT INTO posts (type, status, author_id, views) VALUES
    ('event', 'published', (SELECT id FROM users WHERE email = 'admin@admin.com'), 856)
    RETURNING id INTO post3_id;

    INSERT INTO posts (type, status, author_id, views) VALUES
    ('news', 'published', (SELECT id FROM users WHERE email = 'admin@admin.com'), 3421)
    RETURNING id INTO post4_id;

    INSERT INTO posts (type, status, author_id, views) VALUES
    ('news', 'published', (SELECT id FROM users WHERE email = 'admin@admin.com'), 1677)
    RETURNING id INTO post5_id;

    INSERT INTO posts (type, status, author_id, views) VALUES
    ('privacy_policy', 'published', (SELECT id FROM users WHERE email = 'admin@admin.com'), 654)
    RETURNING id INTO post6_id;

    INSERT INTO posts (type, status, author_id, views) VALUES
    ('terms_of_use', 'published', (SELECT id FROM users WHERE email = 'admin@admin.com'), 432)
    RETURNING id INTO post7_id;

    INSERT INTO posts (type, status, author_id, views) VALUES
    ('news', 'draft', (SELECT id FROM users WHERE email = 'admin@admin.com'), 0)
    RETURNING id INTO post8_id;

    -- Now insert translations for each post
    INSERT INTO posts_translations (post_id, language_code, title, excerpt, content, reading_time) VALUES
    (post1_id, 'en', 'Market Analysis: Q1 2024 Review', 'Comprehensive analysis of Q1 2024 market performance showing 8.2% S&P 500 growth and strong technology sector momentum despite economic uncertainties.', '<h2>Q1 2024 Market Performance</h2><p>The first quarter of 2024 has shown remarkable resilience in global markets despite ongoing economic uncertainties. <strong>Key highlights include:</strong></p><ul><li>S&P 500 up 8.2% year-to-date</li><li>Technology sector leading gains with 12.5% growth</li><li>Emerging markets showing strong momentum</li><li>Bond yields stabilizing around historical averages</li></ul><p>Looking ahead, we expect continued volatility as markets navigate through earnings season and evolving monetary policy decisions.</p><h3>Investment Recommendations</h3><p>Our analysis suggests maintaining a diversified portfolio with a slight overweight in technology and healthcare sectors while remaining cautious about interest rate sensitive assets.</p>', 3),

    (post2_id, 'en', 'Understanding Options Trading: A Beginner''s Guide', 'Learn the fundamentals of options trading including call and put options, key benefits like leverage and hedging, and essential risk management principles for beginners.', '<h2>What Are Options?</h2><p>Options are financial contracts that give traders the right, but not the obligation, to buy or sell an underlying asset at a predetermined price within a specific timeframe.</p><h3>Types of Options</h3><ul><li><strong>Call Options:</strong> Give you the right to buy an asset</li><li><strong>Put Options:</strong> Give you the right to sell an asset</li></ul><h3>Key Benefits</h3><p>Options trading offers several advantages:</p><ul><li>Leverage your investment capital</li><li>Hedge existing positions</li><li>Generate additional income</li><li>Limited risk with defined maximum loss</li></ul><p><em>Remember: Options trading involves significant risk and may not be suitable for all investors. Always consult with a financial advisor before making investment decisions.</em></p>', 2),

    (post3_id, 'en', 'Virtual Trading Conference 2024', 'Join the premier virtual trading event March 15-17, 2024 featuring industry experts, professional traders, and sessions on market trends and advanced strategies.', '<h2>Join Us for the Premier Trading Event of the Year</h2><p>We''re excited to announce our <strong>Virtual Trading Conference 2024</strong>, bringing together industry experts, professional traders, and investment enthusiasts from around the world.</p><h3>Event Details</h3><ul><li><strong>Date:</strong> March 15-17, 2024</li><li><strong>Format:</strong> Virtual (Online)</li><li><strong>Duration:</strong> 3 days of intensive sessions</li><li><strong>Registration:</strong> Early bird pricing available</li></ul><h3>Featured Speakers</h3><p>This year''s lineup includes renowned market analysts, successful hedge fund managers, and fintech innovators who will share their insights on:</p><ul><li>Market trends and predictions for 2024</li><li>Advanced trading strategies</li><li>Risk management techniques</li><li>Technology trends in finance</li></ul><p><strong>Register now</strong> and secure your spot at this exclusive event. Limited seats available!</p>', 2),

    (post4_id, 'en', 'New Platform Features: Advanced Charting Tools', 'Discover our latest platform update featuring 200+ technical indicators, custom drawing tools, multiple timeframes, and real-time data for professional-grade analysis.', '<h2>Enhanced Technical Analysis Capabilities</h2><p>We''re thrilled to introduce our latest platform update featuring advanced charting tools designed to empower traders with professional-grade analysis capabilities.</p><h3>New Features Include:</h3><ul><li><strong>200+ Technical Indicators:</strong> From basic moving averages to complex momentum oscillators</li><li><strong>Custom Drawing Tools:</strong> Fibonacci retracements, trend lines, and pattern recognition</li><li><strong>Multiple Timeframes:</strong> Analyze from 1-minute to monthly charts</li><li><strong>Real-time Data:</strong> Lightning-fast market data updates</li><li><strong>Alert System:</strong> Custom price and indicator alerts</li></ul><h3>How to Access</h3><p>All Premium and Pro subscribers can access these features immediately through the updated web platform and mobile app. Free users can explore basic charting tools with limited indicators.</p><p>Our development team has worked tirelessly to ensure these tools meet the highest standards of accuracy and performance.</p>', 3),

    (post5_id, 'en', 'Risk Management in Volatile Markets', 'Learn essential risk management strategies including position sizing, stop losses, diversification, and quantitative tools to protect your portfolio during market uncertainty.', '<h2>Protecting Your Portfolio During Market Uncertainty</h2><p>Recent market volatility has highlighted the critical importance of robust risk management strategies. Here''s how professional traders protect their capital during uncertain times.</p><h3>Essential Risk Management Principles</h3><ol><li><strong>Position Sizing:</strong> Never risk more than 2% of your portfolio on a single trade</li><li><strong>Stop Losses:</strong> Always set predetermined exit points</li><li><strong>Diversification:</strong> Spread risk across different assets and sectors</li><li><strong>Regular Review:</strong> Continuously assess and adjust your strategy</li></ol><h3>Tools for Risk Assessment</h3><p>Modern risk management relies on quantitative tools:</p><ul><li>Value at Risk (VaR) calculations</li><li>Beta analysis for portfolio volatility</li><li>Correlation analysis between holdings</li><li>Stress testing against historical scenarios</li></ul><p><strong>Remember:</strong> The goal isn''t to eliminate risk entirely, but to manage it intelligently while pursuing your investment objectives.</p>', 4),

    (post6_id, 'en', 'Privacy Policy Update', 'Updated privacy policy effective March 1, 2024 with enhanced data protection, improved cookie management, and expanded user rights for data access and deletion.', '<h2>Updated Privacy Policy - Effective March 1, 2024</h2><p>We are committed to protecting your privacy and have updated our privacy policy to provide greater transparency about how we collect, use, and protect your personal information.</p><h3>Key Changes</h3><ul><li><strong>Enhanced Data Protection:</strong> Additional security measures for sensitive financial data</li><li><strong>Cookie Management:</strong> Improved controls for managing website cookies and tracking</li><li><strong>Third-Party Integrations:</strong> Clear disclosure of data sharing with trading partners</li><li><strong>User Rights:</strong> Expanded rights for data access, correction, and deletion</li></ul><h3>Your Data Rights</h3><p>Under our updated policy, you have the right to:</p><ul><li>Access your personal data</li><li>Correct inaccurate information</li><li>Request data deletion (subject to regulatory requirements)</li><li>Opt-out of marketing communications</li><li>Export your data in a portable format</li></ul><p>For questions about this policy update, please contact our privacy team at privacy@trading.com</p>', 3),

    (post7_id, 'en', 'Platform Terms of Service', 'Terms of service agreement covering account requirements, trading rules, risk disclosure, and liability limitations for our trading platform users.', '<h2>Terms of Service Agreement</h2><p>By accessing and using our trading platform, you agree to comply with and be bound by the following terms and conditions.</p><h3>Account Requirements</h3><ul><li>Users must be 18 years or older</li><li>Accurate information required for account verification</li><li>Compliance with applicable securities regulations</li><li>Maintenance of account security credentials</li></ul><h3>Trading Rules</h3><p>All trading activities must comply with:</p><ul><li>Market regulations and exchange rules</li><li>Anti-money laundering (AML) requirements</li><li>Pattern day trading regulations where applicable</li><li>Position limits and margin requirements</li></ul><h3>Risk Disclosure</h3><p><strong>Important:</strong> Trading securities involves substantial risk of loss and is not suitable for all investors. Past performance does not guarantee future results. Please read our full risk disclosure before trading.</p><h3>Limitation of Liability</h3><p>Our platform is provided "as is" without warranties. We are not liable for trading losses, system downtime, or market data delays beyond our reasonable control.</p>', 5),

    (post8_id, 'en', 'Cryptocurrency Integration Coming Soon', 'Exciting announcement: Cryptocurrency trading coming Q2 2024 with support for Bitcoin, Ethereum, and other major digital assets with enhanced security protocols.', '<h2>Expanding Our Offering: Digital Assets</h2><p>We''re excited to announce that cryptocurrency trading will be available on our platform starting Q2 2024. This expansion represents our commitment to providing comprehensive investment opportunities.</p><h3>Supported Cryptocurrencies</h3><p>Initially, we''ll support major cryptocurrencies including:</p><ul><li>Bitcoin (BTC)</li><li>Ethereum (ETH)</li><li>Cardano (ADA)</li><li>Solana (SOL)</li><li>Polygon (MATIC)</li></ul><h3>Security Measures</h3><p>Cryptocurrency trading will feature enhanced security protocols:</p><ul><li>Cold storage for digital assets</li><li>Multi-signature wallet technology</li><li>Two-factor authentication requirement</li><li>Real-time transaction monitoring</li></ul><p><em>This feature is currently in beta testing. Full rollout expected by June 2024.</em></p>', 3);

    -- Store post IDs in a temporary table for use in image insertion
    CREATE TEMP TABLE temp_post_ids AS
    SELECT post1_id, post2_id, post3_id, post4_id, post5_id, post6_id, post7_id, post8_id;
END $$;

-- ===============================================
-- POST IMAGES (Thumbnail Images for Posts)
-- ===============================================

DO $$
DECLARE
    post_ids temp_post_ids%ROWTYPE;
BEGIN
    SELECT * INTO post_ids FROM temp_post_ids LIMIT 1;

    -- Market Analysis: Q1 2024 Review
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('posts', post_ids.post1_id, 'thumbnail', 'thumbnails/market_analysis_q1_2024.jpg', 'Market analysis chart showing Q1 2024 performance');

    -- Understanding Options Trading: A Beginner's Guide
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('posts', post_ids.post2_id, 'thumbnail', 'thumbnails/options_trading_guide.jpg', 'Options trading educational diagram');

    -- Virtual Trading Conference 2024
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('posts', post_ids.post3_id, 'thumbnail', 'thumbnails/virtual_trading_conference_2024.jpg', 'Virtual trading conference promotional image');

    -- New Platform Features: Advanced Charting Tools
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('posts', post_ids.post4_id, 'thumbnail', 'thumbnails/advanced_charting_tools.jpg', 'Advanced trading charts and technical indicators');

    -- Risk Management in Volatile Markets
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('posts', post_ids.post5_id, 'thumbnail', 'thumbnails/risk_management_volatile_markets.jpg', 'Risk management dashboard and portfolio protection');

    -- Privacy Policy Update
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('posts', post_ids.post6_id, 'thumbnail', 'thumbnails/privacy_policy_update.jpg', 'Privacy policy and data protection illustration');

    -- Platform Terms of Service
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('posts', post_ids.post7_id, 'thumbnail', 'thumbnails/platform_terms_of_service.jpg', 'Legal documents and terms of service illustration');

    -- Cryptocurrency Integration Coming Soon
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('posts', post_ids.post8_id, 'thumbnail', 'thumbnails/cryptocurrency_integration.jpg', 'Cryptocurrency trading and digital assets illustration');

    -- Clean up temporary table
    DROP TABLE temp_post_ids;
END $$;

-- ===============================================
-- BANNERS (Promotional Content)
-- ===============================================

INSERT INTO banners (name, target_url) VALUES
('Welcome New Traders', 'https://trading.com/welcome-bonus'),
('Premium Features Upgrade', 'https://trading.com/premium-upgrade'),
('Trading Conference 2024', 'https://trading.com/conference-2024'),
('Mobile App Download', 'https://trading.com/mobile-app'),
('Educational Resources', 'https://trading.com/education'),
('Risk Management Guide', 'https://trading.com/risk-management'),
('Options Trading Course', 'https://trading.com/options-course');

-- ===============================================
-- BANNER IMAGES (Promotional Banner Images)
-- ===============================================

DO $$
DECLARE
    banner_id uuid;
BEGIN
    -- Welcome New Traders
    SELECT id INTO banner_id FROM banners WHERE name = 'Welcome New Traders';
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('banners', banner_id, NULL, 'images/welcome_new_traders.jpg', 'Promotional banner for new traders');

    -- Premium Features Upgrade
    SELECT id INTO banner_id FROM banners WHERE name = 'Premium Features Upgrade';
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('banners', banner_id, NULL, 'images/premium_features_upgrade.jpg', 'Banner advertising an upgrade to premium features');

    -- Trading Conference 2024
    SELECT id INTO banner_id FROM banners WHERE name = 'Trading Conference 2024';
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('banners', banner_id, NULL, 'images/trading_conference_2024.jpg', 'Banner for the Trading Conference 2024');

    -- Mobile App Download
    SELECT id INTO banner_id FROM banners WHERE name = 'Mobile App Download';
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('banners', banner_id, NULL, 'images/mobile_app_download.jpg', 'Banner prompting to download the mobile app');

    -- Educational Resources
    SELECT id INTO banner_id FROM banners WHERE name = 'Educational Resources';
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('banners', banner_id, NULL, 'images/educational_resources.jpg', 'Banner for educational trading resources');

    -- Risk Management Guide
    SELECT id INTO banner_id FROM banners WHERE name = 'Risk Management Guide';
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('banners', banner_id, NULL, 'images/risk_management_guide.jpg', 'Banner for a risk management guide');

    -- Options Trading Course
    SELECT id INTO banner_id FROM banners WHERE name = 'Options Trading Course';
    INSERT INTO images (table_name, record_id, type, path, alt_text) VALUES ('banners', banner_id, NULL, 'images/options_trading_course.jpg', 'Banner for an options trading course');
END $$;

-- ===============================================
-- SEED DATA SUMMARY REPORT
-- ===============================================

DO $$
DECLARE
    total_users int;
    total_posts int;
    total_products int;
    total_brokers int;
    total_banners int;
    total_images int;
    admin_user_exists boolean;
BEGIN
    -- Count all seeded data
    SELECT count(*) INTO total_users FROM users;
    SELECT count(*) INTO total_posts FROM posts;
    SELECT count(*) INTO total_products FROM products;
    SELECT count(*) INTO total_brokers FROM brokers;
    SELECT count(*) INTO total_banners FROM banners;
    SELECT count(*) INTO total_images FROM images;
    SELECT exists(SELECT 1 FROM users WHERE email = 'admin@admin.com') INTO admin_user_exists;

    -- Generate report
    RAISE NOTICE '';
    RAISE NOTICE '🎉 =======================================';
    RAISE NOTICE '🎉 CLEAN SEED DATA COMPLETE!';
    RAISE NOTICE '🎉 =======================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SEEDED DATA SUMMARY:';
    RAISE NOTICE '👥 Users: % (admin only)', total_users;
    RAISE NOTICE '📝 Posts: % (with admin as author)', total_posts;
    RAISE NOTICE '🛍️  Products: % (without images)', total_products;
    RAISE NOTICE '🏢 Brokers: % (major trading brokers)', total_brokers;
    RAISE NOTICE '🖼️  Banners: % (promotional banners)', total_banners;
    RAISE NOTICE '🎨 Images: % (broker logos + post thumbnails)', total_images;
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
    RAISE NOTICE '🚀 Your application is ready with sample data!';
    RAISE NOTICE '   ✨ Includes sample images (broker logos & post thumbnails)';
    RAISE NOTICE '   🎯 All images stored in centralized images table';
    RAISE NOTICE '   📁 Post thumbnails: posts/thumbnails/ | Broker logos: brokers/logos/';
    RAISE NOTICE '';
END $$;
