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
  - `atoms/` - Basic UI elements (Button, Input, etc.)
  - `molecules/` - Composed components (Table, Modal, etc.)
  - `features/` - Feature-specific components
  - `templates/` - Page layouts
- `src/features/` - Business logic and API hooks by domain
- `src/hooks/` - Reusable hooks including generic CRUD operations
- `src/store/` - Zustand stores (auth, theme)
- `src/types/` - TypeScript type definitions including generated Supabase types
- `src/utils/` - Utility functions
- `src/locales/` - i18n translation files (en, pt)

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

#### Generic CRUD Operations

- `useCRUD` hook in `src/hooks/common/useCRUD.ts` provides type-safe CRUD operations
- Optimistic updates with automatic rollback on errors
- Consistent error handling and toast notifications

### Authentication & Authorization

- Role-based access control (user, moderator, admin)
- Dashboard access restricted to non-"user" roles
- Comprehensive auth error handling with automatic session cleanup
- User profile management with validation

### Performance Optimizations

- Strategic code splitting by feature in Vite config
- Vendor chunk optimization for faster loading
- React Query caching with appropriate stale times
- Image optimization with blurhash placeholders

### Development Guidelines

#### TypeScript Configuration

- Strict type checking enabled with exact optional property types
- No implicit returns, unused locals handled by ESLint
- Import sorting plugin configured
- Path aliases: `@/*` maps to `./src/*`

#### Code Style (from .cursorrules)

- Always check existing patterns before implementing new features
- Follow established naming conventions and folder structure
- Prefer interfaces for extendable object shapes, types for unions
- Avoid custom CSS unless absolutely necessary
- Use Tailwind's responsive variants for adaptive designs
- Include accessibility considerations
- Document complex types with TSDoc/JSDoc

#### Error Handling

- Comprehensive error boundaries
- Translation-aware error messages
- Graceful handling of auth session issues
- Optimistic UI updates with rollback capabilities

### Testing & Quality

- ESLint configuration with React and TypeScript rules
- Prettier for code formatting
- Husky pre-commit hooks with lint-staged
- TypeScript strict mode with comprehensive type checking

## Important Notes

- Never include sensitive information (API keys, tokens) in code or commits
- Always validate user inputs and handle edge cases
- Ensure all new components follow the established atomic design patterns
- Use the generic CRUD hook for standard database operations
- Follow the existing translation patterns for multi-language support

## Code Style Guidelines

- **Formatting**: Uses Prettier, configured in package.json
- **Linting**: ESLint with eslint-config-prettier integration
- **Modules**: ES modules with import/export syntax (type: "module")
- **JavaScript Target**: ES2020 with strict null checks
- **Error Handling**: Use try/catch with explicit error messages that provide context about what failed
- **Naming**: camelCase for variables and functions, PascalCase for classes
- **Imports**: Group by source (internal/external) with proper separation
- **Documentation**: Use JSDoc for public APIs and complex functions, add comments for non-obvious code
- **Error Messages**: Use consistent, specific error messages (e.g., "Track buffer overflow" instead of "Overflow in disc building")

## Test Organization

- **Test Consolidation**: All tests for a specific component should be consolidated in a single test file.
  For example, all tests for `emulator.js` should be in `test-emulator.js` - do not create separate test files
  for different aspects of the same component.
- **Test Structure**: Use nested describe blocks to organize tests by component features
- **Test Isolation**: When mocking components in tests, use `vi.spyOn()` with `vi.restoreAllMocks()` in
  `afterEach` hooks rather than global `vi.mock()` to prevent memory leaks and test pollution
- **Memory Management**: Avoid global mocks that can leak between tests and accumulate memory usage over time
- **Test philosophy**
  - Mock as little as possible: Try and rephrase code not to require it.
  - Try not to rely on internal state: don't manipulate objects' inner state in tests
  - Use idiomatic vitest assertions (expect/toBe/toEqual) instead of node assert

## Project-Specific Knowledge

- **Never commit code unless asked**: Very often we'll work on code and iterate. After you think it's complete, let me
  check it before you commit.

### Code Architecture

#### General Principles

- Follow the existing code style and structure
- Use `const` and `let` instead of `var`
- Avoid global variables; use module scope
- Use arrow functions for callbacks
- Prefer template literals over string concatenation
- Use destructuring for objects and arrays when appropriate
- Use async/await for asynchronous code instead of callbacks or promises
- Minimise special case handling - prefer explicit over implicit behaviour
- Consider adding tests first before implementing features

#### When simplifying existing code

- Prefer helper functions for repetitive operations (like the `appendParam` function)
- Remove unnecessary type checking where types are expected to be correct
- Replace complex conditionals with more readable alternatives when possible
- Ensure simplifications don't break existing behavior or assumptions
- Try and modernise the code to use ES6+ features where possible

#### Constants and Magic Numbers

- Local un-exported properties should be used for shared constants
- Local constants should be used for temporary values
- Always use named constants instead of magic numbers in code
- Use PascalCase for module-level constants (e.g., `const MaxHfeTrackPulses = 3132;`)
- Prefer module-level constants over function-local constants for shared values
- Define constants at the beginning of functions or at the class/module level as appropriate
- Add comments explaining what the constant represents, especially for non-obvious values

#### Pre-commit Hooks

- The project uses lint-staged with ESLint
- Watch for unused variables and ensure proper error handling
- YOU MUST NEVER bypass git commit hooks on checkins. This leads to failures in CI later on
