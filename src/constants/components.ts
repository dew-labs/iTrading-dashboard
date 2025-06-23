/**
 * Component Style Constants
 * Pre-computed component styles for optimal performance
 */

import { COMPONENT_SPACING } from './spacing'

// Base component styles
export const BASE_STYLES = {
  // Reset and base
  reset: 'box-border',
  focus: 'focus:outline-none focus:border-black',

  // Common transitions
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
    colors: 'transition-colors duration-200 ease-in-out',
    transform: 'transition-transform duration-200 ease-in-out'
  }
} as const

// Card variants
export const CARD_VARIANTS = {
  // Base card styles (no padding - user applies their own)
  base: 'bg-white rounded-xl border border-gray-200',

  // Interactive cards (with padding)
  interactive: 'bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer p-6',

  // Card with shadows (with padding)
  elevated: 'bg-white rounded-xl border border-gray-200 shadow-sm p-6',

  // Hover states (with padding)
  hoverable: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 p-6',

  // Stats card specific (with padding)
  stats: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6'
} as const

// Button variants (pre-computed for performance)
export const BUTTON_VARIANTS = {
  // Primary button
  primary: 'inline-flex items-center justify-center font-medium bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',

  // Secondary button
  secondary: 'inline-flex items-center justify-center font-medium border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',

  // Danger button
  danger: 'inline-flex items-center justify-center font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',

  // Ghost button
  ghost: 'inline-flex items-center justify-center font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',

  // Icon button
  icon: 'inline-flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
} as const

// Button sizes
export const BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm', // Current default
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
  icon: 'p-2'
} as const

// Input variants
export const INPUT_VARIANTS = {
  base: 'w-full border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-black transition-colors duration-200',

  withIcon: 'w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-black transition-colors duration-200',

  error: 'w-full border border-red-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors duration-200',

  disabled: 'w-full border border-gray-200 rounded-lg bg-gray-50 text-gray-500 placeholder-gray-400 cursor-not-allowed'
} as const

// Badge variants (status, role, etc.)
export const BADGE_VARIANTS = {
  // Status badges
  status: {
    active: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    inactive: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    pending: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    suspended: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    invited: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
    published: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
    draft: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'
  },

  // Role badges
  role: {
    user: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
    admin: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800',
    super_admin: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'
  },

  // Type badges
  type: {
    news: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    event: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800',
    terms_of_use: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
    privacy_policy: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800',
    subscription: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800',
    'one-time': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
  }
} as const

// Icon container variants
export const ICON_VARIANTS = {
  // Stats card icons
  stats: {
    base: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm',
    users: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-500 to-blue-600',
    products: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-purple-500 to-purple-600',
    posts: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-green-500 to-green-600',
    banners: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-teal-500 to-teal-600',
    dashboard: 'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-gray-900 to-black'
  },

  // Table row icons
  table: 'w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center',

  // Action icons
  action: 'w-4 h-4'
} as const

// Typography variants
export const TYPOGRAPHY_VARIANTS = {
  // Headings
  heading: {
    h1: 'text-3xl font-bold text-gray-900 tracking-tight',
    h2: 'text-2xl font-bold text-gray-900 tracking-tight',
    h3: 'text-lg font-semibold text-gray-900',
    h4: 'text-base font-semibold text-gray-900'
  },

  // Body text
  body: {
    large: 'text-lg text-gray-600 leading-relaxed',
    base: 'text-base text-gray-600 leading-normal',
    small: 'text-sm text-gray-600 leading-normal',
    xs: 'text-xs text-gray-500 leading-normal'
  },

  // Special text
  subtitle: 'text-gray-600 font-medium',
  description: 'text-gray-600 leading-relaxed',
  muted: 'text-gray-500',
  caption: 'text-xs text-gray-500 leading-relaxed'
} as const

// Layout variants
export const LAYOUT_VARIANTS = {
  // Container layouts
  container: {
    full: 'min-h-full bg-gray-50'
  },

  // Page layouts
  page: {
    header: 'flex flex-col sm:flex-row sm:items-center sm:justify-between',
    content: COMPONENT_SPACING.card.gap.normal,
    grid: COMPONENT_SPACING.grid.gap.comfortable
  }
} as const

// Export combined component styles
export const COMPONENTS = {
  base: BASE_STYLES,
  card: CARD_VARIANTS,
  button: BUTTON_VARIANTS,
  buttonSizes: BUTTON_SIZES,
  input: INPUT_VARIANTS,
  badge: BADGE_VARIANTS,
  icon: ICON_VARIANTS,
  typography: TYPOGRAPHY_VARIANTS,
  layout: LAYOUT_VARIANTS
} as const

/**
 * Predefined filter options for consistent filtering across pages
 */
export const FILTER_OPTIONS = {
  // User status filters
  userStatus: [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'invited', label: 'Invited' },
    { value: 'inactive', label: 'Inactive' }
  ],

  // User role filters
  userRole: [
    { value: 'all', label: 'All Roles' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' }
  ],

  // Product type filters
  productType: [
    { value: 'all', label: 'All Types' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'one-time', label: 'One-time' }
  ],

  // Post status filters
  postStatus: [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' }
  ],

  // Post type filters
  postType: [
    { value: 'all', label: 'All Types' },
    { value: 'news', label: 'News' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'guide', label: 'Guide' },
    { value: 'announcement', label: 'Announcement' }
  ],

  // Banner status filters
  bannerStatus: [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ],

  // Common sorting options
  sortOrder: [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' }
  ],

  // Items per page options (already in API.pagination.options)
  itemsPerPage: [
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' }
  ]
} as const

export default COMPONENTS
