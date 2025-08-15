# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Commands

### Development

- `npm run dev` - Start development server with Vite
- `npm run build` - Build production bundle (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking without emitting files
- `npm run lint` - Run ESLint on the codebase

### Database (Supabase)

- Run Supabase commands through `npx` with the `--linked` flag for cloud operations
- Use `zsh` instead of bash for shell commands

## Architecture Overview

### Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand + TanStack React Query
- **Routing**: React Router 7.x
- **Rich Text**: TinyMCE
- **UI Components**: Custom component library with atomic design
- **Internationalization**: react-i18next

### Project Structure

#### Core Architecture

- **Atomic Design Pattern**: Components organized as atoms → molecules → organisms → templates
- **Feature-Based Organization**: Business logic grouped by domain (users, posts, brokers, etc.)
- **Type-Safe Database**: Generated Supabase types with strict TypeScript configuration

#### Key Directories

- `src/components/` - UI components following atomic design
  - `atoms/` - Basic UI elements (Button, Input, Modal, Badge, etc.)
  - `molecules/` - Composed components (Table, Pagination, Select, FormInput, etc.)
  - `features/` - Feature-specific components (BrokerForm, PostForm, UserForm, etc.)
  - `layout/` - Layout components (Header, Sidebar)
  - `templates/` - Page layouts (DashboardLayout)
  - `common/` - Common components (ProtectedRoute, ConfirmDialog, RichTextRenderer)
  - `feedback/` - Loading and error components (LoadingSpinner, ErrorBoundary)
  - `transitions/` - Animation components (PageTransition)
- `src/features/` - Business logic and API hooks by domain
  - `brokers/` - Broker management (API hooks, components, utilities)
  - `brokerCategories/` - Broker category management
  - `posts/` - Post/content management
  - `products/` - Product management
  - `users/` - User management
  - `banners/` - Banner management
  - `audits/` - Audit log functionality
- `src/hooks/` - Reusable hooks
  - `common/` - Generic hooks (useCRUD, useDataTable, useTranslatedContent)
  - Feature-specific hooks (useAuth, useBrokers, usePosts, etc.)
- `src/store/` - Zustand stores (authStore, themeStore)
- `src/types/` - TypeScript type definitions including generated Supabase types
- `src/utils/` - Utility functions (validation, formatting, translation utils)
- `src/locales/` - i18n translation files (en, pt)
- `src/lib/` - Core libraries (Supabase client, i18n config)
- `src/pages/` - Route components
- `src/services/` - Service layer (translationService, userService, otpService)
- `src/constants/` - Application constants (general, languages, theme, UI)

### Database & API Patterns

#### Supabase Integration

- Uses Row Level Security (RLS) policies
- Generated TypeScript types in `src/types/database.ts`
- Helper functions in `src/lib/supabase.ts` for common operations
- Query key factories for consistent React Query caching

#### Multi-language Content

- Separate translation tables for content (posts_translations, brokers_translations, etc.)
- Database views with aggregated translations (`*_with_translations`)
- Translation utilities for fallback language handling
- Translation management components for content creation

#### Generic CRUD Operations

- `useCRUD` hook in `src/hooks/common/useCRUD.ts` provides type-safe CRUD operations
- Optimistic updates with automatic rollback on errors
- Consistent error handling and toast notifications
- `useDataTable` hook for table functionality with filtering, pagination, and sorting

### Authentication & Authorization

- Role-based access control (user, moderator, admin, affiliate)
- Dashboard access restricted to non-"user" roles
- Comprehensive auth error handling with automatic session cleanup
- User profile management with validation
- OTP verification system
- Protected routes with role checking

### Performance Optimizations

- Strategic code splitting by feature in Vite config
- Vendor chunk optimization for faster loading
- React Query caching with appropriate stale times
- Image optimization with blurhash placeholders
- Lazy loading of heavy components (TinyMCE editor)
- Manual chunk splitting for optimal bundle sizes

### Development Guidelines

#### TypeScript Configuration

- Strict type checking enabled with exact optional property types
- No implicit returns, unused locals handled by ESLint
- Import sorting plugin configured
- Path aliases: `@/*` maps to `./src/*`
- ES2020 target with modern browser support
- Verbatim module syntax for better tree-shaking

#### Code Style

- **Formatting**: Uses Prettier, configured in package.json
- **Linting**: ESLint with eslint-config-prettier integration
- **Modules**: ES modules with import/export syntax (type: "module")
- **Error Handling**: Use try/catch with explicit error messages that provide context
- **Naming**: camelCase for variables and functions, PascalCase for components
- **Imports**: Group by source (internal/external) with proper separation
- **Documentation**: Use JSDoc for public APIs and complex functions

#### Component Guidelines

- Always check existing patterns before implementing new features
- Follow established naming conventions and folder structure
- Prefer interfaces for extendable object shapes, types for unions
- Avoid custom CSS unless absolutely necessary
- Use Tailwind's responsive variants for adaptive designs
- Include accessibility considerations (ARIA labels, focus management)
- Document complex types with TSDoc/JSDoc

#### Error Handling

- Comprehensive error boundaries
- Translation-aware error messages
- Graceful handling of auth session issues
- Optimistic UI updates with rollback capabilities
- Toast notifications for user feedback

### Testing & Quality

- ESLint configuration with React and TypeScript rules
- Prettier for code formatting
- Husky pre-commit hooks with lint-staged
- TypeScript strict mode with comprehensive type checking
- Import suggestions sorting for better organization

### Internationalization

- Supports English (en) and Portuguese (pt)
- Translation files organized by feature/domain:
  - `forms.json` - Form labels, placeholders, validation messages
  - `navigation.json` - Menu items and navigation
  - `pages.json` - Page-specific content
  - `common.json` - Common UI elements
  - `errors.json` - Error messages
  - `notifications.json` - Toast and notification messages
- Content translation management system for database content
- Language switching with persistent preferences
- **IMPORTANT**: Always create translations for both EN and PT when adding new text content. Update both `src/locales/en/` and `src/locales/pt/` files when introducing new translatable strings.

### Security & Best Practices

- Never include sensitive information (API keys, tokens) in code or commits
- Always validate user inputs and handle edge cases
- Comprehensive input sanitization and validation
- Secure file upload handling with type and size restrictions
- Password strength requirements and validation
- Session management with automatic cleanup

## Important Notes

- **Never commit code unless asked**: Very often we'll work on code and iterate. After you think it's complete, let me check it before you commit.
- Ensure all new components follow the established atomic design patterns
- Use the generic CRUD hook for standard database operations
- Follow the existing translation patterns for multi-language support
- Always run `npm run lint` and `npm run type-check` before considering code complete
- The project uses Husky pre-commit hooks - never bypass them as this leads to CI failures

## Code Architecture Principles

### General Principles

- Follow the existing code style and structure
- Use `const` and `let` instead of `var`
- Avoid global variables; use module scope
- Use arrow functions for callbacks
- Prefer template literals over string concatenation
- Use destructuring for objects and arrays when appropriate
- Use async/await for asynchronous code instead of callbacks or promises
- Minimize special case handling - prefer explicit over implicit behavior
- Consider adding comprehensive error handling

### Constants and Magic Numbers

- Local un-exported properties should be used for shared constants
- Local constants should be used for temporary values
- Always use named constants instead of magic numbers in code
- Use PascalCase for module-level constants
- Prefer module-level constants over function-local constants for shared values
- Define constants in `src/constants/` for application-wide values
- Add comments explaining what the constant represents

### Feature Development

When adding new features:
1. Create feature directory in `src/features/[feature-name]/`
2. Add API hooks in `api/hooks.ts`
3. Add types in `api/types.ts` (if needed)
4. Create components in `components/`
5. Add to feature index file for clean imports
6. Add translation keys to appropriate locale files
7. Update routing in main App component
8. Add to navigation if needed

### Component Creation

When creating new components:
1. Determine the appropriate atomic design level
2. Follow existing naming conventions
3. Include proper TypeScript interfaces
4. Add accessibility attributes
5. Handle loading and error states
6. Include internationalization support
7. Add proper error boundaries where needed

## File Naming Conventions

- Components: PascalCase (e.g., `UserForm.tsx`, `BrokerCard.tsx`)
- Hooks: camelCase starting with "use" (e.g., `useAuth.ts`, `useBrokers.ts`)
- Utils: camelCase (e.g., `validation.ts`, `translationUtils.ts`)
- Types: camelCase (e.g., `database.ts`, `users.ts`)
- Constants: camelCase (e.g., `general.ts`, `theme.ts`)

## Build Configuration

The project uses Vite with optimized build configuration:
- Manual chunk splitting for optimal loading
- Separate vendor chunks for major libraries
- Feature-based code splitting
- Source maps enabled for production debugging
- ES2020 target for modern browser optimization
- ESBuild minification for faster builds

## Performance Considerations

- Use React.memo for expensive components
- Implement proper loading states
- Optimize images with proper formats and sizes
- Use React Query for efficient data fetching and caching
- Implement proper error boundaries
- Use code splitting for heavy features (like TinyMCE)
- Monitor bundle sizes with chunk size warnings