/**
 * Theme Constants Index
 * Centralized exports for all theme-related constants
 */

// Core theme exports
export * from './colors'
export * from './spacing'
export * from './components'
export * from './general'

// Re-export theme from the old file for backward compatibility
export { TIME, API, FORMAT } from './theme'

// Create unified theme object for convenience
import { COLORS, SEMANTIC_COLORS, CSS_VARIABLES } from './colors'
import {
  CONTAINER,
  COMPONENT_SPACING,
  LAYOUT,
  BREAKPOINTS,
  Z_INDEX,
  BORDER_RADIUS,
  SHADOWS
} from './spacing'
import { COMPONENTS } from './components'
import { TIME, API, FORMAT } from './theme'

export const THEME = {
  // Colors
  colors: COLORS,
  semanticColors: SEMANTIC_COLORS,
  cssVariables: CSS_VARIABLES,

  // Layout & Spacing
  container: CONTAINER,
  spacing: COMPONENT_SPACING,
  layout: LAYOUT,
  breakpoints: BREAKPOINTS,
  zIndex: Z_INDEX,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,

  // Components
  components: COMPONENTS,

  // Time & API
  time: TIME,
  api: API,
  format: FORMAT
} as const

export default THEME
