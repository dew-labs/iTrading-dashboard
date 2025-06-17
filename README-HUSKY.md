# Husky & Lint-Staged Setup

This project uses **Husky** and **lint-staged** to ensure code quality by running ESLint before each commit.

## What's Configured

### Pre-commit Hook

- **Husky** runs a pre-commit hook before every `git commit`
- **lint-staged** runs ESLint only on staged files (not the entire codebase)
- ESLint automatically fixes fixable issues
- If there are unfixable errors, the commit is blocked

### Configuration Files

**package.json** - lint-staged configuration:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix"]
  }
}
```

**.husky/pre-commit** - Git hook:

```bash
npx lint-staged
```

## How It Works

1. **Developer runs:** `git commit -m "message"`
2. **Husky triggers:** pre-commit hook
3. **lint-staged runs:** ESLint on staged TypeScript/JavaScript files
4. **ESLint fixes:** Auto-fixable issues (formatting, quotes, semicolons, etc.)
5. **Commit proceeds** if no unfixable errors exist
6. **Commit blocked** if there are linting errors that can't be auto-fixed

## Benefits

✅ **Consistent Code Style** - All committed code follows standard style rules
✅ **Automatic Fixes** - Formatting issues are fixed automatically
✅ **Fast Execution** - Only checks changed files, not entire codebase
✅ **Prevents Bad Code** - Blocks commits with linting errors
✅ **Team Collaboration** - Ensures all team members follow same standards

## Example Workflow

```bash
# Make changes to files
git add src/components/MyComponent.tsx

# Try to commit
git commit -m "feat: add new component"

# Husky runs ESLint on staged files
# - Fixes formatting issues automatically
# - Blocks commit if there are unfixable errors
# - Allows commit if everything passes

# If blocked, fix errors and try again
# Edit the file to fix linting errors
git add src/components/MyComponent.tsx
git commit -m "feat: add new component"  # Now succeeds
```

## Bypassing (Not Recommended)

In rare cases, you can bypass the pre-commit hook:

```bash
git commit -m "message" --no-verify
```

**⚠️ Warning:** Only use `--no-verify` in emergency situations. It defeats the purpose of having quality checks.
