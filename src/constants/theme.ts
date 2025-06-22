/**
 * Theme Constants
 * Centralized design tokens for consistent styling across the application
 */

// Colors - Following Tailwind CSS naming convention
export const COLORS = {
  // Primary Grays (main theme)
  primary: {
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

  // Status Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b'
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af'
  },

  // Feature Colors (for different sections)
  users: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7'
  },

  products: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea'
  },

  posts: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a'
  },

  banners: {
    50: '#fff7ed',
    100: '#ffedd5',
    500: '#f97316',
    600: '#ea580c'
  }
} as const

// Spacing & Layout
export const SPACING = {
  // Container spacing
  container: {
    padding: {
      sm: 'px-3 sm:px-4 lg:px-6',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12'
    },
    maxWidth: {
      sm: 'max-w-4xl',
      md: 'max-w-6xl',
      lg: 'max-w-7xl',
      full: 'max-w-full'
    },
    section: 'py-6',
    sectionLarge: 'py-8'
  },

  // Component spacing
  component: {
    cardPadding: 'p-6',
    cardSpacing: 'space-y-6',
    cardSpacingLarge: 'space-y-8',
    buttonPadding: 'px-4 py-2.5',
    buttonPaddingLarge: 'px-6 py-3',
    inputPadding: 'px-3 py-2',
    tablePadding: 'px-6 pb-6'
  },

  // Grid spacing
  grid: {
    gap: 'gap-6',
    gapSmall: 'gap-4',
    gapLarge: 'gap-8'
  }
} as const

// Typography
export const TYPOGRAPHY = {
  // Headings
  heading: {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-bold text-gray-900',
    h3: 'text-lg font-semibold text-gray-900',
    h4: 'text-base font-semibold text-gray-900'
  },

  // Body text
  body: {
    large: 'text-lg text-gray-600',
    medium: 'text-base text-gray-600',
    small: 'text-sm text-gray-600',
    xsmall: 'text-xs text-gray-500'
  },

  // Special text styles
  subtitle: 'text-gray-600 font-medium',
  description: 'text-gray-600',
  muted: 'text-gray-500',
  caption: 'text-xs text-gray-500'
} as const

// Component Styles
export const COMPONENTS = {
  // Cards
  card: {
    base: 'bg-white rounded-xl shadow-sm border border-gray-200',
    hover: 'hover:shadow-md transition-all duration-200',
    interactive: 'bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200'
  },

  // Buttons
  button: {
    primary: 'bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors shadow-sm font-medium',
    secondary: 'border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium',
    danger: 'bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors'
  },

  // Form elements
  input: {
    base: 'w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent',
    withIcon: 'pl-10 pr-4 py-2'
  },

  // Badges
  badge: {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800'
  },

  // Icons
  icon: {
    container: 'w-12 h-12 rounded-xl flex items-center justify-center',
    size: {
      small: 'w-4 h-4',
      medium: 'w-5 h-5',
      large: 'w-6 h-6'
    }
  }
} as const

// Animation & Transitions
export const ANIMATIONS = {
  // Transition durations
  duration: {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300'
  },

  // Common transitions
  transition: {
    all: 'transition-all duration-200',
    colors: 'transition-colors duration-200',
    shadow: 'transition-shadow duration-200',
    transform: 'transition-transform duration-200'
  },

  // Hover effects
  hover: {
    scale: 'hover:scale-105',
    scaleSmall: 'hover:scale-102',
    lift: 'hover:-translate-y-1',
    shadow: 'hover:shadow-lg'
  }
} as const

// Time Constants
export const TIME = {
  // Debounce delays
  debounce: {
    search: 300,
    input: 500,
    resize: 250
  },

  // Auto-refresh intervals (in milliseconds)
  refresh: {
    realtime: 1000,    // 1 second
    frequent: 5000,    // 5 seconds
    normal: 30000,     // 30 seconds
    slow: 60000,       // 1 minute
    background: 300000 // 5 minutes
  },

  // Timeout durations
  timeout: {
    notification: 5000,  // 5 seconds
    loading: 30000,      // 30 seconds
    idle: 900000         // 15 minutes
  },

  // Animation durations (in milliseconds)
  animation: {
    fast: 150,
    normal: 200,
    slow: 300,
    modal: 200,
    tooltip: 100
  }
} as const

// Layout Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Z-index scale
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  notification: 70,
  max: 9999
} as const

// Common patterns
export const PATTERNS = {
  // Status badge mapping
  statusBadges: {
    active: COMPONENTS.badge.success,
    inactive: COMPONENTS.badge.gray,
    pending: COMPONENTS.badge.warning,
    suspended: COMPONENTS.badge.error,
    invited: COMPONENTS.badge.warning,
    published: COMPONENTS.badge.success,
    draft: COMPONENTS.badge.warning
  },

  // Role badge mapping
  roleBadges: {
    user: COMPONENTS.badge.gray,
    admin: COMPONENTS.badge.purple,
    super_admin: COMPONENTS.badge.error
  },

  // Feature color mapping
  featureColors: {
    users: 'from-blue-500 to-blue-600',
    products: 'from-purple-500 to-purple-600',
    posts: 'from-green-500 to-green-600',
    banners: 'from-orange-500 to-orange-600',
    dashboard: 'from-gray-900 to-black'
  }
} as const

// Format Constants
export const FORMAT = {
  // Date formats
  date: {
    display: 'dd-MM-yyyy',    // 01-12-2024
    displayLong: 'dd-MM-yyyy HH:mm', // 01-12-2024 14:30
    iso: 'yyyy-MM-dd',        // 2024-12-01
    fileName: 'yyyyMMdd'     // 20241201
  },

  // Number formats
  number: {
    currency: { style: 'currency', currency: 'USD' },
    percent: { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 },
    decimal: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  }
} as const

// API Constants
export const API = {
  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    options: [2, 10, 25, 50, 100]
  },

  // Request timeouts
  timeout: {
    default: 30000,  // 30 seconds
    upload: 120000,  // 2 minutes
    download: 60000  // 1 minute
  }
} as const

// Export default theme object
export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  components: COMPONENTS,
  animations: ANIMATIONS,
  time: TIME,
  format: FORMAT,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  patterns: PATTERNS,
  api: API
} as const

export default THEME
