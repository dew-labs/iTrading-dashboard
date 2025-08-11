# iTrading Dashboard - Essential Commands

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check without emitting files
npm run type-check

# Run linting
npm run lint
```

## Database (Supabase)

```bash
# Run Supabase commands (use --linked flag for cloud)
npx supabase [command] --linked

# Use zsh for shell commands (preferred over bash)
zsh
```

## Git & Quality

- Pre-commit hooks with lint-staged enabled
- ESLint + Prettier configuration
- Never bypass commit hooks
- TypeScript strict mode with comprehensive checking

## File Structure Commands

- Use `src/components/` for UI components (atomic design)
- Use `src/features/` for business logic by domain
- Use `src/hooks/` for reusable hooks including CRUD
- Use `src/types/` for TypeScript definitions
- Use `src/utils/` for utility functions
