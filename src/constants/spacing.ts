/**
 * Spacing & Layout Constants
 * Consistent spacing, sizing, and layout utilities
 */

// Spacing scale (based on 4px grid)
export const SPACING_SCALE = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem' // 96px
} as const

// Container spacing configurations
export const CONTAINER = {
  // Max widths
  maxWidth: {
    sm: 'max-w-4xl', // 896px
    md: 'max-w-6xl', // 1152px
    lg: 'max-w-7xl', // 1280px
    xl: 'max-w-full', // Full width
    content: 'max-w-5xl' // 1024px - for content-focused pages
  },

  // Horizontal padding
  padding: {
    mobile: 'px-3', // 12px on mobile
    tablet: 'px-4 sm:px-6', // 16px → 24px
    desktop: 'px-3 sm:px-4 lg:px-6', // 12px → 16px → 24px (current)
    wide: 'px-4 sm:px-6 lg:px-8' // 16px → 24px → 32px
  },

  // Vertical spacing
  section: {
    compact: 'py-4', // 16px
    normal: 'py-6', // 24px (current)
    relaxed: 'py-8', // 32px
    spacious: 'py-12' // 48px
  }
} as const

// Component spacing
export const COMPONENT_SPACING = {
  // Card spacing
  card: {
    padding: {
      compact: 'p-4', // 16px
      normal: 'p-6', // 24px (current)
      relaxed: 'p-8' // 32px
    },
    gap: {
      tight: 'space-y-4', // 16px
      normal: 'space-y-6', // 24px (current)
      relaxed: 'space-y-8' // 32px
    }
  },

  // Button spacing
  button: {
    padding: {
      compact: 'px-3 py-1.5', // 12px × 6px
      normal: 'px-4 py-2.5', // 16px × 10px (current)
      comfortable: 'px-6 py-3', // 24px × 12px
      spacious: 'px-8 py-4' // 32px × 16px
    }
  },

  // Input spacing
  input: {
    padding: {
      compact: 'px-3 py-2', // 12px × 8px (current)
      normal: 'px-4 py-2.5', // 16px × 10px
      comfortable: 'px-4 py-3' // 16px × 12px
    }
  },

  // Grid spacing
  grid: {
    gap: {
      tight: 'gap-3', // 12px
      normal: 'gap-4', // 16px
      comfortable: 'gap-6', // 24px (current)
      relaxed: 'gap-8' // 32px
    }
  }
} as const

// Layout utilities
export const LAYOUT = {
  // Flexbox utilities
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center'
  },

  // Grid utilities
  grid: {
    auto: 'grid grid-cols-1',
    responsive: {
      '1-2': 'grid grid-cols-1 sm:grid-cols-2',
      '1-2-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      '1-2-4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      '2-4': 'grid grid-cols-2 lg:grid-cols-4'
    }
  },

  // Position utilities
  position: {
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky'
  }
} as const

// Responsive breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  'sm': '640px', // Mobile landscape
  'md': '768px', // Tablet
  'lg': '1024px', // Desktop
  'xl': '1280px', // Large desktop
  '2xl': '1536px' // Extra large
} as const

// Z-index scale
export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const

// Border radius scale
export const BORDER_RADIUS = {
  'none': '0',
  'sm': '0.125rem', // 2px
  'default': '0.25rem', // 4px
  'md': '0.375rem', // 6px
  'lg': '0.5rem', // 8px
  'xl': '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  'full': '9999px'
} as const

// Box shadow scale
export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
} as const

export default {
  SPACING_SCALE,
  CONTAINER,
  COMPONENT_SPACING,
  LAYOUT,
  BREAKPOINTS,
  Z_INDEX,
  BORDER_RADIUS,
  SHADOWS
}
