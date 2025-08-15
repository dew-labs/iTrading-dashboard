/*
  # Comprehensive Seed Data for iTrading Dashboard

  This file contains comprehensive seed data including:
  - Role permissions
  - Broker categories and brokers with translations
  - Posts with translations
  - Products with translations
  - Banners
  - Image metadata (paths for manual upload)
  - Broker account types

  Note: Users are excluded as requested
*/

-- ===============================================
-- CLEAN EXISTING SEED DATA
-- ===============================================

DELETE FROM audit_logs;
DELETE FROM images;
DELETE FROM banners;
DELETE FROM broker_account_types;
DELETE FROM brokers_translations;
DELETE FROM products_translations;
DELETE FROM posts_translations;
DELETE FROM products;
DELETE FROM posts;
DELETE FROM brokers;
DELETE FROM broker_categories;
DELETE FROM role_permissions;

-- ===============================================
-- DEFAULT ROLE PERMISSIONS
-- ===============================================

INSERT INTO role_permissions (role, resource, action) VALUES
-- User role permissions (read-only access to most content)
('user', 'posts', 'read'),
('user', 'products', 'read'),
('user', 'brokers', 'read'),
('user', 'banners', 'read'),

-- Moderator role permissions (CRUD on posts, banners, brokers + view users)
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

-- Admin role permissions (full access to everything)
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
-- SEED DATA WITH PROPER UUID HANDLING
-- ===============================================

DO $$
DECLARE
    -- Broker Category IDs
    fx_cfd_category_id uuid;
    crypto_category_id uuid;
    cards_category_id uuid;
    copy_trading_category_id uuid;
    prop_trading_category_id uuid;

    -- Broker IDs
    oanda_id uuid;
    ig_group_id uuid;
    fxcm_id uuid;
    binance_id uuid;
    coinbase_id uuid;
    kraken_id uuid;
    revolut_id uuid;
    etoro_id uuid;
    ftmo_id uuid;

    -- Post IDs
    post1_id uuid;
    post2_id uuid;
    post3_id uuid;
    post4_id uuid;
    post5_id uuid;
    post6_id uuid;
    post7_id uuid;
    post8_id uuid;

    -- Product IDs
    product1_id uuid;
    product2_id uuid;
    product3_id uuid;
    product4_id uuid;
    product5_id uuid;

    -- Banner IDs
    banner1_id uuid;
    banner2_id uuid;
    banner3_id uuid;
    banner4_id uuid;
    banner5_id uuid;

BEGIN
    -- Generate UUIDs
    fx_cfd_category_id := gen_random_uuid();
    crypto_category_id := gen_random_uuid();
    cards_category_id := gen_random_uuid();
    copy_trading_category_id := gen_random_uuid();
    prop_trading_category_id := gen_random_uuid();

    oanda_id := gen_random_uuid();
    ig_group_id := gen_random_uuid();
    fxcm_id := gen_random_uuid();
    binance_id := gen_random_uuid();
    coinbase_id := gen_random_uuid();
    kraken_id := gen_random_uuid();
    revolut_id := gen_random_uuid();
    etoro_id := gen_random_uuid();
    ftmo_id := gen_random_uuid();

    post1_id := gen_random_uuid();
    post2_id := gen_random_uuid();
    post3_id := gen_random_uuid();
    post4_id := gen_random_uuid();
    post5_id := gen_random_uuid();
    post6_id := gen_random_uuid();
    post7_id := gen_random_uuid();
    post8_id := gen_random_uuid();

    product1_id := gen_random_uuid();
    product2_id := gen_random_uuid();
    product3_id := gen_random_uuid();
    product4_id := gen_random_uuid();
    product5_id := gen_random_uuid();

    banner1_id := gen_random_uuid();
    banner2_id := gen_random_uuid();
    banner3_id := gen_random_uuid();
    banner4_id := gen_random_uuid();
    banner5_id := gen_random_uuid();

    -- ===============================================
    -- BROKER CATEGORIES
    -- ===============================================

    INSERT INTO broker_categories (id, name) VALUES
    (fx_cfd_category_id, 'FX/CFD'),
    (crypto_category_id, 'Crypto'),
    (cards_category_id, 'Cards'),
    (copy_trading_category_id, 'Copy Trading'),
    (prop_trading_category_id, 'Prop Trading')
    ON CONFLICT (name) DO NOTHING;

    -- ===============================================
    -- BROKERS
    -- ===============================================

    INSERT INTO brokers (id, is_visible, name, headquarter, established_in, category_id) VALUES
    -- FX/CFD Brokers
    (oanda_id, true, 'OANDA', 'New York, USA', 1996, fx_cfd_category_id),
    (ig_group_id, true, 'IG Group', 'London, UK', 1974, fx_cfd_category_id),
    (fxcm_id, true, 'FXCM', 'London, UK', 1999, fx_cfd_category_id),

    -- Crypto Exchanges
    (binance_id, true, 'Binance', 'Malta', 2017, crypto_category_id),
    (coinbase_id, true, 'Coinbase', 'San Francisco, USA', 2012, crypto_category_id),
    (kraken_id, true, 'Kraken', 'San Francisco, USA', 2011, crypto_category_id),

    -- Card/Payment Providers
    (revolut_id, true, 'Revolut', 'London, UK', 2015, cards_category_id),

    -- Copy Trading
    (etoro_id, true, 'eToro', 'Tel Aviv, Israel', 2007, copy_trading_category_id),

    -- Prop Trading
    (ftmo_id, true, 'FTMO', 'Prague, Czech Republic', 2015, prop_trading_category_id);

    -- ===============================================
    -- BROKERS TRANSLATIONS
    -- ===============================================

    INSERT INTO brokers_translations (broker_id, language_code, description, affiliate_link) VALUES
    -- OANDA
    (oanda_id, 'en', 'Leading online forex broker with over 25 years of experience. Regulated by top-tier authorities including NFA and FCA. Offers advanced trading platforms and market analysis.', 'https://www.oanda.com/register'),
    (oanda_id, 'pt', 'Corretor forex online líder com mais de 25 anos de experiência. Regulamentado por autoridades de primeira linha incluindo NFA e FCA. Oferece plataformas de negociação avançadas e análise de mercado.', 'https://www.oanda.com/register'),
    (oanda_id, 'vi', 'Nhà môi giới forex trực tuyến hàng đầu với hơn 25 năm kinh nghiệm. Được quản lý bởi các cơ quan hàng đầu bao gồm NFA và FCA. Cung cấp nền tảng giao dịch tiên tiến và phân tích thị trường.', 'https://www.oanda.com/register'),

    -- IG Group
    (ig_group_id, 'en', 'World''s No.1 CFD provider with 50+ years in financial markets. FCA regulated with award-winning platforms and comprehensive market coverage.', 'https://www.ig.com/uk/welcome-page'),
    (ig_group_id, 'pt', 'Provedor de CFD No.1 do mundo com mais de 50 anos nos mercados financeiros. Regulamentado pela FCA com plataformas premiadas e cobertura abrangente do mercado.', 'https://www.ig.com/uk/welcome-page'),
    (ig_group_id, 'vi', 'Nhà cung cấp CFD số 1 thế giới với hơn 50 năm trong thị trường tài chính. Được FCA quản lý với các nền tảng đoạt giải và phủ sóng thị trường toàn diện.', 'https://www.ig.com/uk/welcome-page'),

    -- FXCM
    (fxcm_id, 'en', 'Global leader in online forex trading and CFD services. Offers advanced trading platforms, tight spreads, and comprehensive educational resources.', 'https://www.fxcm.com/markets/'),
    (fxcm_id, 'pt', 'Líder global em negociação forex online e serviços de CFD. Oferece plataformas de negociação avançadas, spreads apertados e recursos educacionais abrangentes.', 'https://www.fxcm.com/markets/'),
    (fxcm_id, 'vi', 'Công ty dẫn đầu thế giới trong giao dịch forex trực tuyến và dịch vụ CFD. Cung cấp nền tảng giao dịch tiên tiến, spread chặt và tài nguyên giáo dục toàn diện.', 'https://www.fxcm.com/markets/'),

    -- Binance
    (binance_id, 'en', 'World''s largest cryptocurrency exchange by trading volume. Supports 500+ cryptocurrencies with advanced trading features and institutional-grade security.', 'https://www.binance.com/en/register'),
    (binance_id, 'pt', 'Maior exchange de criptomoedas do mundo por volume de negociação. Suporta mais de 500 criptomoedas com recursos de negociação avançados e segurança de nível institucional.', 'https://www.binance.com/en/register'),
    (binance_id, 'vi', 'Sàn giao dịch tiền điện tử lớn nhất thế giới theo khối lượng giao dịch. Hỗ trợ hơn 500 tiền điện tử với tính năng giao dịch nâng cao và bảo mật cấp tổ chức.', 'https://www.binance.com/en/register'),

    -- Coinbase
    (coinbase_id, 'en', 'Leading US-based cryptocurrency exchange trusted by millions. SEC-compliant with easy-to-use interface and institutional custody services.', 'https://www.coinbase.com/signup'),
    (coinbase_id, 'pt', 'Exchange de criptomoedas líder baseada nos EUA, confiável por milhões. Compatível com SEC com interface fácil de usar e serviços de custódia institucional.', 'https://www.coinbase.com/signup'),
    (coinbase_id, 'vi', 'Sàn giao dịch tiền điện tử hàng đầu có trụ sở tại Mỹ được hàng triệu người tin tưởng. Tuân thủ SEC với giao diện dễ sử dụng và dịch vụ lưu ký tổ chức.', 'https://www.coinbase.com/signup'),

    -- Kraken
    (kraken_id, 'en', 'Premier cryptocurrency exchange founded in 2011. Known for security, liquidity, and comprehensive crypto services including futures and margin trading.', 'https://www.kraken.com/sign-up'),
    (kraken_id, 'pt', 'Exchange de criptomoedas premier fundada em 2011. Conhecida por segurança, liquidez e serviços cripto abrangentes incluindo futuros e negociação com margem.', 'https://www.kraken.com/sign-up'),
    (kraken_id, 'vi', 'Sàn giao dịch tiền điện tử hàng đầu được thành lập năm 2011. Nổi tiếng về bảo mật, thanh khoản và dịch vụ crypto toàn diện bao gồm futures và giao dịch ký quỹ.', 'https://www.kraken.com/sign-up'),

    -- Revolut
    (revolut_id, 'en', 'Digital banking app with trading features. Offers commission-free stock and crypto trading, multi-currency accounts, and premium cards with cashback.', 'https://www.revolut.com/'),
    (revolut_id, 'pt', 'Aplicativo bancário digital com recursos de negociação. Oferece negociação de ações e criptomoedas sem comissão, contas multi-moeda e cartões premium com cashback.', 'https://www.revolut.com/'),
    (revolut_id, 'vi', 'Ứng dụng ngân hàng số với tính năng giao dịch. Cung cấp giao dịch cổ phiếu và crypto không phí hoa hồng, tài khoản đa tiền tệ và thẻ cao cấp với hoàn tiền.', 'https://www.revolut.com/'),

    -- eToro
    (etoro_id, 'en', 'Social trading and investment platform. Pioneer in copy trading with CopyTrader feature, allowing you to automatically copy successful traders'' strategies.', 'https://www.etoro.com/'),
    (etoro_id, 'pt', 'Plataforma de negociação social e investimento. Pioneiro em copy trading com recurso CopyTrader, permitindo copiar automaticamente estratégias de traders bem-sucedidos.', 'https://www.etoro.com/'),
    (etoro_id, 'vi', 'Nền tảng giao dịch xã hội và đầu tư. Tiên phong trong copy trading với tính năng CopyTrader, cho phép tự động sao chép chiến lược của các trader thành công.', 'https://www.etoro.com/'),

    -- FTMO
    (ftmo_id, 'en', 'Leading proprietary trading firm offering funded trading accounts up to $2M. Two-step evaluation process with competitive profit splits and professional development.', 'https://ftmo.com/en/'),
    (ftmo_id, 'pt', 'Empresa de trading proprietário líder oferecendo contas de negociação financiadas até $2M. Processo de avaliação de duas etapas com divisões de lucro competitivas e desenvolvimento profissional.', 'https://ftmo.com/en/'),
    (ftmo_id, 'vi', 'Công ty trading độc quyền hàng đầu cung cấp tài khoản giao dịch được tài trợ lên đến $2M. Quy trình đánh giá hai bước với chia sẻ lợi nhuận cạnh tranh và phát triển chuyên nghiệp.', 'https://ftmo.com/en/');

    -- ===============================================
    -- BROKER ACCOUNT TYPES
    -- ===============================================

    INSERT INTO broker_account_types (broker_id, account_type, spreads, commission, min_deposit) VALUES
    -- OANDA
    (oanda_id, 'Core', 'From 1.2 pips', '$0', '$0'),
    (oanda_id, 'Active', 'From 0.9 pips', '$0', '$20,000'),
    (oanda_id, 'VIP', 'From 0.6 pips', '$0', '$100,000'),

    -- IG Group
    (ig_group_id, 'Standard', 'From 0.6 pips', '$0', '$250'),
    (ig_group_id, 'DMA', 'From 0.0 pips', '$10 per lot', '$15,000'),

    -- FXCM
    (fxcm_id, 'Standard', 'From 1.3 pips', '$0', '$50'),
    (fxcm_id, 'Active Trader', 'From 0.2 pips', '$6 per lot', '$25,000'),

    -- Binance
    (binance_id, 'Spot', 'From 0.1%', 'Maker: 0.1%, Taker: 0.1%', '$10'),
    (binance_id, 'Margin', 'From 0.1%', 'Daily Interest', '$15'),
    (binance_id, 'Futures', 'From 0.02%', 'Maker: 0.02%, Taker: 0.04%', '$5'),

    -- Coinbase
    (coinbase_id, 'Basic', 'Variable', '0.5-4.5%', '$2'),
    (coinbase_id, 'Advanced', 'Variable', '0.4-0.6%', '$10'),
    (coinbase_id, 'Pro', 'Variable', '0.0-0.5%', '$10'),

    -- Kraken
    (kraken_id, 'Starter', 'Variable', '0.16-0.26%', '$1'),
    (kraken_id, 'Intermediate', 'Variable', '0.14-0.24%', '$1'),
    (kraken_id, 'Pro', 'Variable', '0.00-0.20%', '$1'),

    -- Revolut
    (revolut_id, 'Standard', 'N/A', 'Commission-free stocks', '$0'),
    (revolut_id, 'Premium', 'N/A', 'Commission-free + benefits', '$9.99/month'),
    (revolut_id, 'Metal', 'N/A', 'Premium features + cashback', '$15.99/month'),

    -- eToro
    (etoro_id, 'Retail', 'Variable', 'Spread-based', '$200'),
    (etoro_id, 'Professional', 'Variable', 'Reduced fees', '$5,000'),

    -- FTMO
    (ftmo_id, 'Challenge', 'From 0.7 pips', '$0 trading fees', '$155'),
    (ftmo_id, 'Funded', 'From 0.7 pips', '80% profit split', '$0');

    -- ===============================================
    -- POSTS
    -- ===============================================

    INSERT INTO posts (id, type, status, views, published_at) VALUES
    (post1_id, 'news', 'published', 1250, '2024-12-01 10:00:00+00'),
    (post2_id, 'news', 'published', 890, '2024-12-05 14:30:00+00'),
    (post3_id, 'news', 'published', 2100, '2024-12-10 09:15:00+00'),
    (post4_id, 'event', 'published', 560, '2024-12-15 16:45:00+00'),
    (post5_id, 'news', 'published', 1800, '2024-12-20 11:20:00+00'),
    (post6_id, 'news', 'draft', 0, null),
    (post7_id, 'terms_of_use', 'published', 450, '2024-11-01 08:00:00+00'),
    (post8_id, 'privacy_policy', 'published', 320, '2024-11-01 08:00:00+00');

    -- ===============================================
    -- POSTS TRANSLATIONS
    -- ===============================================

    INSERT INTO posts_translations (post_id, language_code, title, excerpt, content, reading_time) VALUES
    -- Post 1: Market Analysis
    (post1_id, 'en', 'Global Markets Reach New Heights in December 2024', 'Major stock indices continue their upward trajectory as investors remain optimistic about economic recovery and technological advancement.',
    '<h2>Market Overview</h2><p>The global financial markets have shown remarkable resilience in December 2024, with major indices reaching new all-time highs. The S&P 500 has gained 3.2% this month alone, while the NASDAQ has surged 4.1%.</p><h3>Key Drivers</h3><ul><li>Strong corporate earnings reports</li><li>Positive economic indicators</li><li>Technological breakthroughs in AI sector</li><li>Improved global trade relations</li></ul><p>Analysts predict this bullish trend may continue into Q1 2025, though they caution about potential volatility around major economic announcements.</p>', 5),

    (post1_id, 'pt', 'Mercados Globais Atingem Novos Patamares em Dezembro de 2024', 'Os principais índices de ações continuam sua trajetória ascendente enquanto os investidores permanecem otimistas sobre a recuperação econômica e avanço tecnológico.',
    '<h2>Visão Geral do Mercado</h2><p>Os mercados financeiros globais mostraram uma resistência notável em dezembro de 2024, com os principais índices atingindo novos máximos históricos. O S&P 500 ganhou 3,2% apenas neste mês, enquanto o NASDAQ disparou 4,1%.</p><h3>Principais Fatores</h3><ul><li>Relatórios corporativos sólidos</li><li>Indicadores econômicos positivos</li><li>Avanços tecnológicos no setor de IA</li><li>Melhoria nas relações comerciais globais</li></ul><p>Analistas preveem que essa tendência altista pode continuar no primeiro trimestre de 2025, embora alertem sobre potencial volatilidade em torno de anúncios econômicos importantes.</p>', 5),

    (post1_id, 'vi', 'Thị Trường Toàn Cầu Đạt Đỉnh Mới Trong Tháng 12/2024', 'Các chỉ số chứng khoán chính tiếp tục xu hướng tăng khi các nhà đầu tư vẫn lạc quan về phục hồi kinh tế và tiến bộ công nghệ.',
    '<h2>Tổng Quan Thị Trường</h2><p>Các thị trường tài chính toàn cầu đã cho thấy khả năng phục hồi đáng kể trong tháng 12/2024, với các chỉ số chính đạt mức cao kỷ lục mới. S&P 500 đã tăng 3,2% chỉ trong tháng này, trong khi NASDAQ tăng vọt 4,1%.</p><h3>Động Lực Chính</h3><ul><li>Báo cáo thu nhập doanh nghiệp mạnh mẽ</li><li>Các chỉ số kinh tế tích cực</li><li>Đột phá công nghệ trong lĩnh vực AI</li><li>Cải thiện quan hệ thương mại toàn cầu</li></ul><p>Các nhà phân tích dự đoán xu hướng tăng giá này có thể tiếp tục vào Q1 2025, mặc dù họ cảnh báo về khả năng biến động xung quanh các thông báo kinh tế quan trọng.</p>', 5),

    -- Post 2: Forex Analysis
    (post2_id, 'en', 'USD Strengthens Against Major Currencies Amid Fed Policy Changes', 'The US Dollar has shown significant strength this week following the Federal Reserve''s latest policy announcement and economic data releases.',
    '<h2>Currency Markets Update</h2><p>The US Dollar Index (DXY) has climbed 1.8% this week, reaching its highest level since October 2024. This surge comes after the Federal Reserve hinted at potential policy adjustments in their latest meeting.</p><h3>Impact on Major Pairs</h3><ul><li>EUR/USD: Down 2.1% to 1.0845</li><li>GBP/USD: Declined 1.9% to 1.2650</li><li>USD/JPY: Rose 2.3% to 151.20</li><li>AUD/USD: Fell 1.6% to 0.6720</li></ul><p>Trading volumes have increased significantly, with institutional investors repositioning their portfolios ahead of year-end.</p>', 4),

    (post2_id, 'pt', 'Dólar Americano se Fortalece Contra as Principais Moedas em Meio a Mudanças na Política do Fed', 'O Dólar Americano mostrou força significativa esta semana após o último anúncio de política do Federal Reserve e divulgação de dados econômicos.',
    '<h2>Atualização dos Mercados de Moedas</h2><p>O Índice do Dólar Americano (DXY) subiu 1,8% nesta semana, atingindo seu nível mais alto desde outubro de 2024. Esse aumento veio após o Federal Reserve sugerir potenciais ajustes de política em sua última reunião.</p><h3>Impacto nos Principais Pares</h3><ul><li>EUR/USD: Queda de 2,1% para 1,0845</li><li>GBP/USD: Declinou 1,9% para 1,2650</li><li>USD/JPY: Subiu 2,3% para 151,20</li><li>AUD/USD: Caiu 1,6% para 0,6720</li></ul><p>Os volumes de negociação aumentaram significativamente, com investidores institucionais reposicionando seus portfólios antes do final do ano.</p>', 4),

    (post2_id, 'vi', 'USD Tăng Mạnh So Với Các Đồng Tiền Chính Giữa Bối Cảnh Thay Đổi Chính Sách Fed', 'Đồng Dollar Mỹ đã cho thấy sức mạnh đáng kể trong tuần này sau thông báo chính sách mới nhất của Federal Reserve và công bố dữ liệu kinh tế.',
    '<h2>Cập Nhật Thị Trường Tiền Tệ</h2><p>Chỉ số Dollar Mỹ (DXY) đã tăng 1,8% trong tuần này, đạt mức cao nhất kể từ tháng 10/2024. Sự tăng vọt này xảy ra sau khi Federal Reserve ám chỉ về các điều chỉnh chính sách tiềm năng trong cuộc họp gần đây.</p><h3>Tác Động Lên Các Cặp Tiền Chính</h3><ul><li>EUR/USD: Giảm 2,1% xuống 1,0845</li><li>GBP/USD: Giảm 1,9% xuống 1,2650</li><li>USD/JPY: Tăng 2,3% lên 151,20</li><li>AUD/USD: Giảm 1,6% xuống 0,6720</li></ul><p>Khối lượng giao dịch đã tăng đáng kể, với các nhà đầu tư tổ chức tái cấu trúc danh mục trước cuối năm.</p>', 4),

    -- Post 3: Crypto News
    (post3_id, 'en', 'Bitcoin Surpasses $100,000 Milestone as Institutional Adoption Accelerates', 'Bitcoin reaches a historic milestone, breaking through the $100,000 barrier for the first time, driven by massive institutional investment and regulatory clarity.',
    '<h2>Historic Achievement</h2><p>Bitcoin has officially crossed the $100,000 threshold, marking a pivotal moment in cryptocurrency history. This achievement comes after months of steady growth fueled by institutional adoption and favorable regulatory developments.</p><h3>Key Factors Behind the Rally</h3><ul><li>Major corporations adding Bitcoin to treasury reserves</li><li>Bitcoin ETF approvals gaining momentum</li><li>Institutional trading platforms expanding crypto offerings</li><li>Growing acceptance from traditional financial institutions</li></ul><h2>Market Impact</h2><p>The broader cryptocurrency market has responded positively, with Ethereum reaching $4,200 and many altcoins posting double-digit gains. Total crypto market cap now exceeds $3.5 trillion.</p><p>Analysts suggest this could be the beginning of a new bull cycle, though they remind investors to exercise caution and proper risk management.</p>', 6),

    (post3_id, 'pt', 'Bitcoin Supera Marco de $100.000 Enquanto Adoção Institucional Acelera', 'Bitcoin atinge um marco histórico, rompendo a barreira de $100.000 pela primeira vez, impulsionado por investimento institucional massivo e clareza regulatória.',
    '<h2>Conquista Histórica</h2><p>O Bitcoin oficialmente cruzou o limite de $100.000, marcando um momento crucial na história das criptomoedas. Esta conquista vem após meses de crescimento constante alimentado pela adoção institucional e desenvolvimentos regulatórios favoráveis.</p><h3>Fatores Principais Por Trás do Rally</h3><ul><li>Grandes corporações adicionando Bitcoin às reservas do tesouro</li><li>Aprovações de ETF de Bitcoin ganhando momentum</li><li>Plataformas de negociação institucionais expandindo ofertas cripto</li><li>Crescente aceitação de instituições financeiras tradicionais</li></ul><h2>Impacto no Mercado</h2><p>O mercado mais amplo de criptomoedas respondeu positivamente, com Ethereum atingindo $4.200 e muitas altcoins registrando ganhos de dois dígitos. A capitalização total do mercado cripto agora excede $3,5 trilhões.</p><p>Analistas sugerem que este pode ser o início de um novo ciclo de alta, embora lembrem aos investidores para exercer cautela e gerenciamento adequado de risco.</p>', 6),

    (post3_id, 'vi', 'Bitcoin Vượt Mốc $100,000 Khi Việc Áp Dụng Thể Chế Tăng Tốc', 'Bitcoin đạt được mốc son lịch sử, vượt qua rào cản $100,000 lần đầu tiên, được thúc đẩy bởi đầu tư thể chế lớn và sự rõ ràng về quy định.',
    '<h2>Thành Tựu Lịch Sử</h2><p>Bitcoin đã chính thức vượt qua ngưỡng $100,000, đánh dấu một khoảnh khắc quan trọng trong lịch sử tiền điện tử. Thành tựu này đến sau nhiều tháng tăng trưởng ổn định được thúc đẩy bởi việc áp dụng thể chế và các phát triển quy định thuận lợi.</p><h3>Các Yếu Tố Chính Đằng Sau Đợt Tăng Giá</h3><ul><li>Các tập đoàn lớn thêm Bitcoin vào dự trữ ngân quỹ</li><li>Việc phê duyệt Bitcoin ETF tăng động lực</li><li>Các nền tảng giao dịch thể chế mở rộng dịch vụ crypto</li><li>Sự chấp nhận ngày càng tăng từ các tổ chức tài chính truyền thống</li></ul><h2>Tác Động Thị Trường</h2><p>Thị trường tiền điện tử rộng lớn hơn đã phản ứng tích cực, với Ethereum đạt $4,200 và nhiều altcoin tăng hai chữ số. Tổng vốn hóa thị trường crypto hiện vượt $3,5 nghìn tỷ.</p><p>Các nhà phân tích cho rằng đây có thể là khởi đầu của chu kỳ tăng giá mới, mặc dù họ nhắc nhở các nhà đầu tư cần thận trọng và quản lý rủi ro phù hợp.</p>', 6),

    -- Draft Post
    (post6_id, 'en', 'Future of Algorithmic Trading - Draft', 'This is a draft post about the future developments in algorithmic trading and AI-powered trading systems.',
    '<h2>Draft Content</h2><p>This post is still being written and will cover the latest developments in algorithmic trading, machine learning applications, and future trends in automated trading systems.</p>', 3),

    -- Terms of Use
    (post7_id, 'en', 'Terms of Use', 'Please read these terms of use carefully before using our trading platform and services.',
    '<h2>Terms of Use</h2><p>Welcome to our trading platform. By accessing and using our services, you agree to be bound by these terms and conditions.</p><h3>1. Acceptance of Terms</h3><p>By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.</p><h3>2. Use of Services</h3><p>Our services are provided for informational and educational purposes. Trading involves substantial risk and may not be suitable for all investors.</p><h3>3. Risk Disclosure</h3><p>Trading in financial instruments involves substantial risk of loss and may not be suitable for all investors. Past performance is not indicative of future results.</p>', 10),

    (post7_id, 'pt', 'Termos de Uso', 'Por favor, leia estes termos de uso cuidadosamente antes de usar nossa plataforma de trading e serviços.',
    '<h2>Termos de Uso</h2><p>Bem-vindo à nossa plataforma de trading. Ao acessar e usar nossos serviços, você concorda em estar vinculado a estes termos e condições.</p><h3>1. Aceitação dos Termos</h3><p>Ao usar nossa plataforma, você reconhece que leu, entendeu e concorda em estar vinculado a estes Termos de Uso.</p><h3>2. Uso dos Serviços</h3><p>Nossos serviços são fornecidos para fins informativos e educacionais. O trading envolve risco substancial e pode não ser adequado para todos os investidores.</p><h3>3. Divulgação de Risco</h3><p>O trading em instrumentos financeiros envolve risco substancial de perda e pode não ser adequado para todos os investidores. Desempenho passado não é indicativo de resultados futuros.</p>', 10),

    (post7_id, 'vi', 'Điều Khoản Sử Dụng', 'Vui lòng đọc kỹ các điều khoản sử dụng này trước khi sử dụng nền tảng trading và dịch vụ của chúng tôi.',
    '<h2>Điều Khoản Sử Dụng</h2><p>Chào mừng bạn đến với nền tảng trading của chúng tôi. Bằng cách truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý bị ràng buộc bởi các điều khoản và điều kiện này.</p><h3>1. Chấp Nhận Điều Khoản</h3><p>Bằng cách sử dụng nền tảng của chúng tôi, bạn thừa nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều khoản Sử dụng này.</p><h3>2. Sử Dụng Dịch Vụ</h3><p>Dịch vụ của chúng tôi được cung cấp cho mục đích thông tin và giáo dục. Trading liên quan đến rủi ro đáng kể và có thể không phù hợp với tất cả nhà đầu tư.</p><h3>3. Tiết Lộ Rủi Ro</h3><p>Trading các công cụ tài chính liên quan đến rủi ro mất mát đáng kể và có thể không phù hợp với tất cả nhà đầu tư. Hiệu suất trong quá khứ không phải là chỉ báo của kết quả tương lai.</p>', 10),

    -- Privacy Policy
    (post8_id, 'en', 'Privacy Policy', 'This privacy policy explains how we collect, use, and protect your personal information when you use our services.',
    '<h2>Privacy Policy</h2><p>We are committed to protecting your privacy and ensuring the security of your personal information.</p><h3>1. Information We Collect</h3><p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p><h3>2. How We Use Your Information</h3><p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p><h3>3. Information Sharing</h3><p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>', 8),

    (post8_id, 'pt', 'Política de Privacidade', 'Esta política de privacidade explica como coletamos, usamos e protegemos suas informações pessoais quando você usa nossos serviços.',
    '<h2>Política de Privacidade</h2><p>Estamos comprometidos em proteger sua privacidade e garantir a segurança de suas informações pessoais.</p><h3>1. Informações que Coletamos</h3><p>Coletamos informações que você nos fornece diretamente, como quando você cria uma conta, usa nossos serviços ou entra em contato conosco para suporte.</p><h3>2. Como Usamos Suas Informações</h3><p>Usamos as informações que coletamos para fornecer, manter e melhorar nossos serviços, processar transações e nos comunicar com você.</p><h3>3. Compartilhamento de Informações</h3><p>Não vendemos, negociamos ou transferimos suas informações pessoais para terceiros sem seu consentimento, exceto conforme descrito nesta política.</p>', 8),

    (post8_id, 'vi', 'Chính Sách Bảo Mật', 'Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng dịch vụ của chúng tôi.',
    '<h2>Chính Sách Bảo Mật</h2><p>Chúng tôi cam kết bảo vệ quyền riêng tư của bạn và đảm bảo an toàn thông tin cá nhân của bạn.</p><h3>1. Thông Tin Chúng Tôi Thu Thập</h3><p>Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi, chẳng hạn như khi bạn tạo tài khoản, sử dụng dịch vụ của chúng tôi hoặc liên hệ với chúng tôi để được hỗ trợ.</p><h3>2. Cách Chúng Tôi Sử Dụng Thông Tin Của Bạn</h3><p>Chúng tôi sử dụng thông tin chúng tôi thu thập để cung cấp, duy trì và cải thiện dịch vụ của chúng tôi, xử lý giao dịch và giao tiếp với bạn.</p><h3>3. Chia Sẻ Thông Tin</h3><p>Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba mà không có sự đồng ý của bạn, trừ khi được mô tả trong chính sách này.</p>', 8);

    -- ===============================================
    -- PRODUCTS
    -- ===============================================

    INSERT INTO products (id, affiliate_link) VALUES
    (product1_id, 'https://affiliate.tradingtools.com/premium-signals'),
    (product2_id, 'https://partner.tradingcourse.com/masterclass'),
    (product3_id, 'https://refer.tradingbot.ai/pro-version'),
    (product4_id, 'https://affiliate.riskmanager.com/tool'),
    (product5_id, 'https://partner.chartanalysis.com/premium');

    -- ===============================================
    -- PRODUCTS TRANSLATIONS
    -- ===============================================

    INSERT INTO products_translations (product_id, language_code, name, description) VALUES
    -- Trading Signals Premium
    (product1_id, 'en', 'Premium Trading Signals', 'Get real-time trading signals with 85% accuracy rate. Our AI-powered system analyzes market conditions 24/7 to provide you with profitable trading opportunities across forex, crypto, and stock markets.'),
    (product1_id, 'pt', 'Sinais de Trading Premium', 'Obtenha sinais de trading em tempo real com 85% de taxa de precisão. Nosso sistema alimentado por IA analisa as condições do mercado 24/7 para fornecer oportunidades de trading lucrativas em forex, crypto e mercados de ações.'),
    (product1_id, 'vi', 'Tín Hiệu Trading Cao Cấp', 'Nhận tín hiệu trading thời gian thực với tỷ lệ chính xác 85%. Hệ thống AI của chúng tôi phân tích điều kiện thị trường 24/7 để cung cấp cơ hội trading có lợi nhuận trên thị trường forex, crypto và cổ phiếu.'),

    -- Trading Masterclass
    (product2_id, 'en', 'Complete Trading Masterclass', 'Comprehensive trading course covering technical analysis, risk management, and psychology. Includes 50+ video lessons, live trading sessions, and lifetime access to our trading community.'),
    (product2_id, 'pt', 'Masterclass Completa de Trading', 'Curso abrangente de trading cobrindo análise técnica, gestão de risco e psicologia. Inclui mais de 50 videoaulas, sessões de trading ao vivo e acesso vitalício à nossa comunidade de trading.'),
    (product2_id, 'vi', 'Khóa Học Trading Toàn Diện', 'Khóa học trading toàn diện bao gồm phân tích kỹ thuật, quản lý rủi ro và tâm lý học. Bao gồm hơn 50 bài học video, phiên trading trực tiếp và truy cập trọn đời vào cộng đồng trading của chúng tôi.'),

    -- Trading Bot Pro
    (product3_id, 'en', 'AI Trading Bot Pro', 'Advanced automated trading bot with machine learning algorithms. Supports multiple exchanges, customizable strategies, and 24/7 automated trading with risk management features.'),
    (product3_id, 'pt', 'Bot de Trading IA Pro', 'Bot de trading automatizado avançado com algoritmos de aprendizado de máquina. Suporta múltiplas exchanges, estratégias personalizáveis e trading automatizado 24/7 com recursos de gestão de risco.'),
    (product3_id, 'vi', 'Bot Trading AI Pro', 'Bot trading tự động tiên tiến với thuật toán machine learning. Hỗ trợ nhiều sàn giao dịch, chiến lược tùy chỉnh và trading tự động 24/7 với tính năng quản lý rủi ro.'),

    -- Risk Management Tool
    (product4_id, 'en', 'Professional Risk Management Tool', 'Calculate position sizes, set stop losses, and manage your portfolio risk effectively. Features include risk/reward calculators, portfolio analysis, and real-time risk monitoring.'),
    (product4_id, 'pt', 'Ferramenta Profissional de Gestão de Risco', 'Calcule tamanhos de posição, defina stop losses e gerencie o risco do seu portfólio efetivamente. Inclui calculadoras de risco/retorno, análise de portfólio e monitoramento de risco em tempo real.'),
    (product4_id, 'vi', 'Công Cụ Quản Lý Rủi Ro Chuyên Nghiệp', 'Tính toán kích thước vị thế, đặt stop loss và quản lý rủi ro danh mục hiệu quả. Bao gồm máy tính rủi ro/lợi nhuận, phân tích danh mục và giám sát rủi ro thời gian thực.'),

    -- Chart Analysis Premium
    (product5_id, 'en', 'Advanced Chart Analysis Suite', 'Professional charting software with 100+ technical indicators, pattern recognition, and multi-timeframe analysis. Perfect for serious traders and analysts.'),
    (product5_id, 'pt', 'Suíte Avançada de Análise de Gráficos', 'Software de gráficos profissional com mais de 100 indicadores técnicos, reconhecimento de padrões e análise multi-timeframe. Perfeito para traders e analistas sérios.'),
    (product5_id, 'vi', 'Bộ Phân Tích Biểu Đồ Nâng Cao', 'Phần mềm biểu đồ chuyên nghiệp với hơn 100 chỉ báo kỹ thuật, nhận dạng mẫu và phân tích đa khung thời gian. Hoàn hảo cho các trader và nhà phân tích nghiêm túc.');

    -- ===============================================
    -- BANNERS
    -- ===============================================

    INSERT INTO banners (id, is_visible, name, target_url) VALUES
    (banner1_id, true, 'New Year Trading Bonus', 'https://promo.tradingplatform.com/newyear2025'),
    (banner2_id, true, 'Free Trading Course', 'https://education.tradingacademy.com/free-course'),
    (banner3_id, true, 'Premium Signals 50% Off', 'https://signals.tradingpro.com/discount'),
    (banner4_id, false, 'Christmas Special Offer', 'https://christmas.tradingdeals.com'),
    (banner5_id, true, 'Live Trading Webinar', 'https://webinar.tradingexperts.com/live');

    -- ===============================================
    -- IMAGES (Paths for manual upload)
    -- ===============================================

    INSERT INTO images (table_name, record_id, path, type, alt_text, mime_type) VALUES
    -- Post images
    ('posts', post1_id, '/images/posts/global-markets-chart.jpg', 'featured', 'Global market indices chart showing upward trend', 'image/jpeg'),
    ('posts', post2_id, '/images/posts/usd-strength-forex.jpg', 'featured', 'USD strength against major currencies chart', 'image/jpeg'),
    ('posts', post3_id, '/images/posts/bitcoin-100k-milestone.jpg', 'featured', 'Bitcoin price chart reaching $100,000', 'image/jpeg'),

    -- Broker logos
    ('brokers', oanda_id, '/images/brokers/oanda-logo.png', 'logo', 'OANDA broker logo', 'image/png'),
    ('brokers', ig_group_id, '/images/brokers/ig-group-logo.png', 'logo', 'IG Group broker logo', 'image/png'),
    ('brokers', fxcm_id, '/images/brokers/fxcm-logo.png', 'logo', 'FXCM broker logo', 'image/png'),
    ('brokers', binance_id, '/images/brokers/binance-logo.png', 'logo', 'Binance exchange logo', 'image/png'),
    ('brokers', coinbase_id, '/images/brokers/coinbase-logo.png', 'logo', 'Coinbase exchange logo', 'image/png'),
    ('brokers', kraken_id, '/images/brokers/kraken-logo.png', 'logo', 'Kraken exchange logo', 'image/png'),
    ('brokers', revolut_id, '/images/brokers/revolut-logo.png', 'logo', 'Revolut trading app logo', 'image/png'),
    ('brokers', etoro_id, '/images/brokers/etoro-logo.png', 'logo', 'eToro social trading logo', 'image/png'),
    ('brokers', ftmo_id, '/images/brokers/ftmo-logo.png', 'logo', 'FTMO prop trading logo', 'image/png'),

    -- Product images
    ('products', product1_id, '/images/products/premium-signals-preview.jpg', 'preview', 'Premium Trading Signals dashboard preview', 'image/jpeg'),
    ('products', product2_id, '/images/products/trading-masterclass-cover.jpg', 'cover', 'Complete Trading Masterclass course cover', 'image/jpeg'),
    ('products', product3_id, '/images/products/trading-bot-interface.jpg', 'interface', 'AI Trading Bot Pro interface screenshot', 'image/jpeg'),
    ('products', product4_id, '/images/products/risk-management-tool.jpg', 'screenshot', 'Risk Management Tool interface', 'image/jpeg'),
    ('products', product5_id, '/images/products/chart-analysis-suite.jpg', 'screenshot', 'Advanced Chart Analysis Suite interface', 'image/jpeg'),

    -- Banner images
    ('banners', banner1_id, '/images/banners/new-year-bonus-2025.jpg', 'banner', 'New Year Trading Bonus 2025 promotional banner', 'image/jpeg'),
    ('banners', banner2_id, '/images/banners/free-trading-course.jpg', 'banner', 'Free Trading Course promotional banner', 'image/jpeg'),
    ('banners', banner3_id, '/images/banners/premium-signals-discount.jpg', 'banner', 'Premium Signals 50% Off promotional banner', 'image/jpeg'),
    ('banners', banner4_id, '/images/banners/christmas-special-offer.jpg', 'banner', 'Christmas Special Offer promotional banner', 'image/jpeg'),
    ('banners', banner5_id, '/images/banners/live-trading-webinar.jpg', 'banner', 'Live Trading Webinar promotional banner', 'image/jpeg');

END $$;

-- ===============================================
-- SEED DATA SUMMARY REPORT
-- ===============================================

DO $$
DECLARE
    total_broker_categories int;
    total_brokers int;
    total_broker_translations int;
    total_broker_account_types int;
    total_posts int;
    total_posts_translations int;
    total_products int;
    total_products_translations int;
    total_banners int;
    total_images int;
    total_role_permissions int;
BEGIN
    -- Count all seeded data
    SELECT count(*) INTO total_broker_categories FROM broker_categories;
    SELECT count(*) INTO total_brokers FROM brokers;
    SELECT count(*) INTO total_broker_translations FROM brokers_translations;
    SELECT count(*) INTO total_broker_account_types FROM broker_account_types;
    SELECT count(*) INTO total_posts FROM posts;
    SELECT count(*) INTO total_posts_translations FROM posts_translations;
    SELECT count(*) INTO total_products FROM products;
    SELECT count(*) INTO total_products_translations FROM products_translations;
    SELECT count(*) INTO total_banners FROM banners;
    SELECT count(*) INTO total_images FROM images;
    SELECT count(*) INTO total_role_permissions FROM role_permissions;

    -- Generate report
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ==========================================';
    RAISE NOTICE '🎉 COMPREHENSIVE SEED DATA COMPLETE!';
    RAISE NOTICE '🎉 ==========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SEEDED DATA SUMMARY:';
    RAISE NOTICE '🏢 Broker Categories: %', total_broker_categories;
    RAISE NOTICE '💼 Brokers: %', total_brokers;
    RAISE NOTICE '🌐 Broker Translations: % (across 3 languages)', total_broker_translations;
    RAISE NOTICE '📋 Broker Account Types: %', total_broker_account_types;
    RAISE NOTICE '📰 Posts: %', total_posts;
    RAISE NOTICE '🌍 Post Translations: % (across 3 languages)', total_posts_translations;
    RAISE NOTICE '🛍️ Products: %', total_products;
    RAISE NOTICE '📦 Product Translations: % (across 3 languages)', total_products_translations;
    RAISE NOTICE '📢 Banners: %', total_banners;
    RAISE NOTICE '🖼️ Images: % (paths ready for upload)', total_images;
    RAISE NOTICE '🔒 Role Permissions: %', total_role_permissions;
    RAISE NOTICE '';
    RAISE NOTICE '🌐 LANGUAGES SUPPORTED:';
    RAISE NOTICE '   🇺🇸 English (en)';
    RAISE NOTICE '   🇵🇹 Portuguese (pt)';
    RAISE NOTICE '   🇻🇳 Vietnamese (vi)';
    RAISE NOTICE '';
    RAISE NOTICE '📝 NOTE: Image files need to be uploaded manually';
    RAISE NOTICE '   Image paths are already set in the database';
    RAISE NOTICE '   Upload images to match the paths in the images table';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your trading platform is ready with comprehensive data!';
    RAISE NOTICE '';
END $$;
