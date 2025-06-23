/**
 * Badge Constants
 * Centralized constants for all badge variants used throughout the application
 */

// User Role Constants
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user'
} as const

// User Status Constants
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  INVITED: 'invited'
} as const

// Post Status Constants
export const POST_STATUSES = {
  PUBLISHED: 'published',
  DRAFT: 'draft'
} as const

// Post Type Constants
export const POST_TYPES = {
  NEWS: 'news',
  EVENT: 'event',
  TERMS_OF_USE: 'terms_of_use',
  PRIVACY_POLICY: 'privacy_policy'
} as const

// Product Type Constants
export const PRODUCT_TYPES = {
  SUBSCRIPTION: 'subscription',
  ONE_TIME: 'one-time'
} as const

// Banner Status Constants
export const BANNER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

// All Badge Variants (for type checking)
export const BADGE_VARIANTS = {
  // User roles
  ...USER_ROLES,
  // User statuses
  ...USER_STATUSES,
  // Post statuses
  ...POST_STATUSES,
  // Post types
  ...POST_TYPES,
  // Product types
  ...PRODUCT_TYPES
} as const

// Badge Sizes
export const BADGE_SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg'
} as const

// Helper functions to get badge variants
export const getBadgeVariant = {
  // User role helpers
  userRole: (role: string) => {
    switch (role) {
    case 'super_admin':
      return USER_ROLES.SUPER_ADMIN
    case 'admin':
      return USER_ROLES.ADMIN
    case 'user':
      return USER_ROLES.USER
    default:
      return USER_ROLES.USER
    }
  },

  // User status helpers
  userStatus: (status: string) => {
    switch (status) {
    case 'active':
      return USER_STATUSES.ACTIVE
    case 'inactive':
      return USER_STATUSES.INACTIVE
    case 'suspended':
      return USER_STATUSES.SUSPENDED
    case 'invited':
      return USER_STATUSES.INVITED
    default:
      return USER_STATUSES.INACTIVE
    }
  },

  // Post status helpers
  postStatus: (status: string) => {
    switch (status) {
    case 'published':
      return POST_STATUSES.PUBLISHED
    case 'draft':
      return POST_STATUSES.DRAFT
    default:
      return POST_STATUSES.DRAFT
    }
  },

  // Post type helpers
  postType: (type: string) => {
    switch (type) {
    case 'news':
      return POST_TYPES.NEWS
    case 'event':
      return POST_TYPES.EVENT
    case 'terms_of_use':
      return POST_TYPES.TERMS_OF_USE
    case 'privacy_policy':
      return POST_TYPES.PRIVACY_POLICY
    default:
      return POST_TYPES.NEWS
    }
  },

  // Product type helpers
  productType: (isSubscription: boolean) => {
    return isSubscription ? PRODUCT_TYPES.SUBSCRIPTION : PRODUCT_TYPES.ONE_TIME
  },

  // Banner status helpers
  bannerStatus: (isActive: boolean) => {
    return isActive ? BANNER_STATUSES.ACTIVE : BANNER_STATUSES.INACTIVE
  }
}

// Type exports for TypeScript
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]
export type UserStatus = typeof USER_STATUSES[keyof typeof USER_STATUSES]
export type PostStatus = typeof POST_STATUSES[keyof typeof POST_STATUSES]
export type PostType = typeof POST_TYPES[keyof typeof POST_TYPES]
export type ProductType = typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES]
export type BannerStatus = typeof BANNER_STATUSES[keyof typeof BANNER_STATUSES]
export type BadgeVariant = typeof BADGE_VARIANTS[keyof typeof BADGE_VARIANTS]
export type BadgeSize = typeof BADGE_SIZES[keyof typeof BADGE_SIZES]

// Export everything as default for convenience
export default {
  USER_ROLES,
  USER_STATUSES,
  POST_STATUSES,
  POST_TYPES,
  PRODUCT_TYPES,
  BANNER_STATUSES,
  BADGE_VARIANTS,
  BADGE_SIZES,
  getBadgeVariant
}
