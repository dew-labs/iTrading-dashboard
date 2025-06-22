/**
 * Color Constants
 * Centralized color palette with semantic naming
 */

// Base color palette
export const COLORS = {
  // Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  },

  // Status colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },

  // Feature colors
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb'
  },

  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea'
  },

  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a'
  },

  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    500: '#f97316',
    600: '#ea580c'
  },

  yellow: {
    50: '#fefce8',
    100: '#fef3c7',
    500: '#eab308',
    600: '#ca8a04'
  },

  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626'
  }
} as const

// Semantic color mappings
export const SEMANTIC_COLORS = {
  // Text colors
  text: {
    primary: COLORS.gray[900],
    secondary: COLORS.gray[600],
    muted: COLORS.gray[500],
    inverse: '#ffffff'
  },

  // Background colors
  background: {
    primary: '#ffffff',
    secondary: COLORS.gray[50],
    muted: COLORS.gray[100]
  },

  // Border colors
  border: {
    default: COLORS.gray[200],
    muted: COLORS.gray[300],
    focus: COLORS.gray[900]
  },

  // Feature colors
  features: {
    users: COLORS.blue,
    products: COLORS.purple,
    posts: COLORS.green,
    banners: COLORS.orange,
    dashboard: COLORS.gray
  }
} as const

// CSS Custom Properties (for runtime theming)
export const CSS_VARIABLES = {
  // Colors
  '--color-primary': COLORS.gray[900],
  '--color-secondary': COLORS.gray[600],
  '--color-muted': COLORS.gray[500],
  '--color-background': '#ffffff',
  '--color-background-secondary': COLORS.gray[50],
  '--color-border': COLORS.gray[200],
  '--color-success': COLORS.success[500],
  '--color-warning': COLORS.warning[500],
  '--color-error': COLORS.error[500],
  '--color-info': COLORS.info[500]
} as const

export default COLORS
