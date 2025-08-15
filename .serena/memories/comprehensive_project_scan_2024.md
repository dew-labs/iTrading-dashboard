# iTrading Dashboard - Comprehensive Project Scan (2024)

## Project Overview
A comprehensive React-based trading dashboard application built with modern technologies and practices.

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **State Management**: Zustand (auth, theme), TanStack React Query (server state)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom configuration
- **Routing**: TanStack React Router
- **Internationalization**: React i18next (English, Portuguese)
- **Testing**: Vitest
- **Build Tools**: Vite, ESLint, Prettier

## Architecture Analysis

### Directory Structure
```
src/
├── components/          # UI Components (atomic design)
│   ├── atoms/          # Basic UI elements (Button, Input, etc.)
│   ├── molecules/      # Composite components (Table, Form, etc.)
│   ├── features/       # Feature-specific components
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── templates/      # Page templates
├── features/           # Business domain modules
│   ├── affiliates/     # Affiliate management
│   ├── audits/         # Audit logging
│   ├── banners/        # Banner management
│   ├── brokers/        # Broker management
│   ├── posts/          # Content management
│   ├── products/       # Product management
│   └── users/          # User management
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── services/           # API services
├── store/              # Global state management
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

### Core Features

#### 1. User Management System
- **Multi-role support**: user, moderator, admin, affiliate
- **Status tracking**: invited, active, inactive, suspended
- **Profile management**: Full user profiles with extended information
- **Authentication**: Supabase Auth integration

#### 2. Content Management
- **Posts**: News, events, terms of use, privacy policy
- **Products**: Product catalog with translations
- **Brokers**: Trading broker listings with categories
- **Banners**: Marketing banner management
- **Translation Support**: Multi-language content (en, pt, vi)

#### 3. Affiliate System (Recently Added)
- **Referral Codes**: Auto-generated unique codes per affiliate
- **Tracking**: Comprehensive referral tracking and metrics
- **Dashboard**: Affiliate performance analytics
- **Management**: Code activation/deactivation, deletion

#### 4. Audit & Monitoring
- **Activity Logging**: All database changes tracked
- **User Tracking**: IP, user agent, session information
- **Statistics**: Activity analytics and reporting
- **Security**: Row-level security on all tables

#### 5. File Management
- **Image Upload**: Optimized image handling
- **Storage**: Supabase storage integration
- **Metadata**: Blurhash, alt text, file size tracking

### Database Schema

#### Core Tables
- `users` - User accounts and profiles
- `posts` - Content posts with status/type
- `products` - Product catalog
- `brokers` - Trading broker information
- `broker_categories` - Broker categorization
- `banners` - Marketing banners
- `images` - File attachments
- `audit_logs` - Activity tracking
- `role_permissions` - Permission system

#### Affiliate System Tables
- `user_referral_codes` - Referral code management
- `user_referrals` - Referral relationship tracking

#### Translation Tables
- `posts_translations` - Post content translations
- `products_translations` - Product translations
- `brokers_translations` - Broker translations

#### Database Views
- `posts_with_translations` - Posts with embedded translations
- `products_with_translations` - Products with translations
- `brokers_with_translations` - Brokers with translations

### API & State Management

#### React Query Integration
- Feature-based query keys organization
- Optimistic updates for better UX
- Error handling and retry logic
- Cache management strategies

#### Custom Hooks Pattern
- `useAuth` - Authentication state
- `usePosts` - Post management
- `useAffiliates` - Affiliate operations
- `useTranslation` - Translation management
- `useCRUD` - Generic CRUD operations
- `useDataTable` - Table functionality

### Component Design Patterns

#### Atomic Design Structure
- **Atoms**: Button, Input, Badge, Modal
- **Molecules**: Table, FormInput, Pagination
- **Organisms**: Feature-specific components
- **Templates**: Page layouts

#### Feature-Based Organization
Each feature module contains:
- `api/hooks.ts` - React Query hooks
- `api/types.ts` - Feature-specific types
- `components/` - Feature components
- `utils/` - Feature utilities

### Recent Development (Affiliate System)

#### Implementation Details
- Comprehensive affiliate user management
- Referral code generation and tracking
- Performance metrics and analytics
- Integration with existing user system
- Translation support for affiliate content

#### Database Functions
- `generate_referral_code()` - Auto-generate unique codes
- `create_user_referral_code()` - Create referral code for user
- `create_referral_relationship()` - Track referrals

### Security & Permissions

#### Row-Level Security (RLS)
- All tables protected with RLS policies
- Role-based access control
- User isolation for data access

#### Permission System
- `role_permissions` table for granular control
- Helper functions: `is_admin()`, `is_moderator_or_admin()`
- API endpoint protection

### Internationalization

#### Language Support
- English (en) - Default
- Portuguese (pt) - Full support
- Vietnamese (vi) - Content only

#### Translation Management
- Dynamic content translation
- Translation status tracking
- Fallback language support
- Translation completeness metrics

### Performance Optimizations

#### Caching Strategy
- React Query for server state
- Optimistic updates
- Stale-while-revalidate pattern

#### Code Organization
- Tree-shakable imports
- Feature-based code splitting
- Lazy loading for routes

## Development Patterns

### TypeScript Usage
- Strict type checking
- Database-first type generation
- Generic utility types
- Discriminated unions for state management

### Error Handling
- Global error boundary
- API error handling
- User-friendly error messages
- Loading states management

### Testing Strategy
- Vitest for unit testing
- Component testing patterns
- Hook testing utilities

## Key Files & Entry Points

### Configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling configuration
- `eslint.config.js` - Linting rules
- `package.json` - Dependencies and scripts

### Core Application
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Root component with routing
- `src/lib/supabase.ts` - Database client
- `src/lib/i18n.ts` - Internationalization setup

### Database
- `supabase/migrations/` - Database schema migrations
- `supabase/seed.sql` - Initial data
- `supabase/config.toml` - Supabase configuration

This comprehensive scan reveals a well-structured, modern React application with robust backend integration, comprehensive feature set, and excellent development practices.