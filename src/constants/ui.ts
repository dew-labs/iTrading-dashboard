/**
 * UI Constants
 * Common UI strings, sizes, variants, and other magic values
 * Used across components to ensure consistency and avoid magic strings
 */

// Size constants
export const SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const

export type Size = (typeof SIZES)[keyof typeof SIZES]

// Button variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
  DANGER: 'danger',
  WARNING: 'warning',
  SUCCESS: 'success'
} as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[keyof typeof BUTTON_VARIANTS]

// Input variants
export const INPUT_VARIANTS = {
  DEFAULT: 'default',
  ERROR: 'error',
  SUCCESS: 'success'
} as const

export type InputVariant = (typeof INPUT_VARIANTS)[keyof typeof INPUT_VARIANTS]

// Modal sizes
export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  FULL: 'full'
} as const

export type ModalSize = (typeof MODAL_SIZES)[keyof typeof MODAL_SIZES]

// View modes
export const VIEW_MODES = {
  LIST: 'list',
  CARD: 'card',
  GRID: 'grid'
} as const

export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES]

// Sort directions
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
} as const

export type SortDirection = (typeof SORT_DIRECTIONS)[keyof typeof SORT_DIRECTIONS]

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

export type LoadingState = (typeof LOADING_STATES)[keyof typeof LOADING_STATES]

// Dialog variants
export const DIALOG_VARIANTS = {
  INFO: 'info',
  WARNING: 'warning',
  DANGER: 'danger',
  SUCCESS: 'success'
} as const

export type DialogVariant = (typeof DIALOG_VARIANTS)[keyof typeof DIALOG_VARIANTS]

// Badge sizes
export const BADGE_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
} as const

export type BadgeSize = (typeof BADGE_SIZES)[keyof typeof BADGE_SIZES]

// Keyboard keys
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete'
} as const

export type KeyboardKey = (typeof KEYBOARD_KEYS)[keyof typeof KEYBOARD_KEYS]

// Image types
export const IMAGE_TYPES = {
  AVATAR: 'avatar',
  THUMBNAIL: 'thumbnail',
  LOGO: 'logo',
  BANNER: 'banner',
  COVER: 'cover'
} as const

export type ImageType = (typeof IMAGE_TYPES)[keyof typeof IMAGE_TYPES]

// Upload sizes
export const UPLOAD_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg'
} as const

export type UploadSize = (typeof UPLOAD_SIZES)[keyof typeof UPLOAD_SIZES]

// Content types for translation
export const CONTENT_TYPES = {
  POSTS: 'posts',
  PRODUCTS: 'products',
  BROKERS: 'brokers'
} as const

export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES]

// Default values
export const DEFAULT_VALUES = {
  READING_TIME: 1,
  PAGINATION_LIMIT: 10,
  BROKERS_PAGINATION_LIMIT: 12, // Brokers use a different default for card view
  SEARCH_DEBOUNCE: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 300,
  LOADING_SPINNER_DELAY: 200
} as const

// File upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
} as const

// Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  CONTENT_MAX_LENGTH: 50000,
  // Year validation
  YEAR_MIN: 1800,
  YEAR_MAX: new Date().getFullYear(),
  // Price validation
  PRICE_MIN: 0,
  PRICE_STEP: 0.01,
  // Bio validation
  BIO_MAX_LENGTH: 500,
  // City validation
  CITY_MAX_LENGTH: 100,
  // Headquarter validation
  HEADQUARTER_MAX_LENGTH: 100,
  // Banner validation
  BANNER_NAME_MIN_LENGTH: 2,
  BANNER_NAME_MAX_LENGTH: 100,
  // Description validation
  DESCRIPTION_MIN_LENGTH: 10,
  // Content validation
  CONTENT_MIN_LENGTH: 10,
  // General validation
  REQUIRED_FIELD_MIN_LENGTH: 2,
  REQUIRED_FIELD_MAX_LENGTH: 100
} as const

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  TOAST: 1100,
  TOOLTIP: 1200
} as const

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
} as const

// Icon sizes
export const ICON_SIZES = {
  XS: 'w-3 h-3',
  SM: 'w-4 h-4',
  MD: 'w-5 h-5',
  LG: 'w-6 h-6',
  XL: 'w-8 h-8'
} as const

// Common CSS classes
export const CSS_CLASSES = {
  VISUALLY_HIDDEN: 'sr-only',
  TRUNCATE: 'truncate',
  LOADING_SPINNER: 'animate-spin',
  FADE_IN: 'animate-fade-in',
  SLIDE_IN: 'animate-slide-in',
  BOUNCE: 'animate-bounce',
  PULSE: 'animate-pulse'
} as const

// Placeholder texts (should be moved to translation files)
export const PLACEHOLDER_KEYS = {
  SEARCH_USERS: 'placeholders.searchUsersPlaceholder',
  SEARCH_POSTS: 'placeholders.searchPostsPlaceholder',
  SEARCH_PRODUCTS: 'placeholders.searchProductsPlaceholder',
  SEARCH_BANNERS: 'placeholders.searchBannersPlaceholder',
  SEARCH_BROKERS: 'placeholders.searchBrokersPlaceholder',
  SEARCH_ACTIVITIES: 'placeholders.searchActivitiesPlaceholder'
} as const

// Error message keys
export const ERROR_KEYS = {
  REQUIRED: 'validation.required',
  INVALID_EMAIL: 'validation.invalidEmail',
  INVALID_PHONE: 'validation.invalidPhone',
  TOO_SHORT: 'validation.tooShort',
  TOO_LONG: 'validation.tooLong',
  INVALID_FORMAT: 'validation.invalidFormat'
} as const

// Success message keys
export const SUCCESS_KEYS = {
  CREATED: 'notifications.created',
  UPDATED: 'notifications.updated',
  DELETED: 'notifications.deleted',
  SAVED: 'notifications.saved'
} as const

// Common aria labels
export const ARIA_LABELS = {
  CLOSE: 'common:ui.accessibility.close',
  EDIT: 'common:ui.accessibility.editItem',
  DELETE: 'common:ui.accessibility.deleteItem',
  VIEW: 'common:ui.accessibility.viewDetails',
  SEARCH: 'common:actions.search',
  PAGINATION: 'common:ui.accessibility.pagination',
  SORT: 'common:actions.sort',
  FILTER: 'common:actions.filter',
  UPLOAD: 'common:actions.upload',
  LOADING: 'common:actions.loading'
} as const

// Helper functions
export const getSizeClasses = (size: Size): string => {
  const sizeMap = {
    [SIZES.XS]: 'text-xs px-2 py-1',
    [SIZES.SM]: 'text-sm px-3 py-1.5',
    [SIZES.MD]: 'text-base px-4 py-2',
    [SIZES.LG]: 'text-lg px-6 py-3',
    [SIZES.XL]: 'text-xl px-8 py-4'
  }
  return sizeMap[size] || sizeMap[SIZES.MD]
}

export const getIconSize = (size: Size): string => {
  const iconMap = {
    [SIZES.XS]: ICON_SIZES.XS,
    [SIZES.SM]: ICON_SIZES.SM,
    [SIZES.MD]: ICON_SIZES.MD,
    [SIZES.LG]: ICON_SIZES.LG,
    [SIZES.XL]: ICON_SIZES.XL
  }
  return iconMap[size] || iconMap[SIZES.MD]
}

export const isValidSize = (size: string): size is Size => {
  return Object.values(SIZES).includes(size as Size)
}

export const isValidViewMode = (mode: string): mode is ViewMode => {
  return Object.values(VIEW_MODES).includes(mode as ViewMode)
}

export const isValidSortDirection = (direction: string): direction is SortDirection => {
  return Object.values(SORT_DIRECTIONS).includes(direction as SortDirection)
}
