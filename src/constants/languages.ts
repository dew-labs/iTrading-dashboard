/**
 * Language Constants
 * Configuration for internationalization (i18n)
 *
 * Usage Examples:
 *
 * 1. Get available languages:
 *    const languages = Object.values(LANGUAGES)
 *
 * 2. Check if language is supported:
 *    if (SUPPORTED_LANGUAGE_CODES.includes(languageCode)) { ... }
 *
 * 3. Get language metadata:
 *    const langInfo = LANGUAGE_INFO[languageCode]
 */

// Supported language codes
export const LANGUAGE_CODES = {
  ENGLISH: 'en',
  PORTUGUESE: 'pt'
} as const

export type LanguageCode = (typeof LANGUAGE_CODES)[keyof typeof LANGUAGE_CODES]

// Default language
export const DEFAULT_LANGUAGE: LanguageCode = LANGUAGE_CODES.ENGLISH

// Number of supported languages
export const SUPPORTED_LANGUAGES_COUNT = Object.keys(LANGUAGE_CODES).length

// Array of supported language codes
export const SUPPORTED_LANGUAGE_CODES: LanguageCode[] = Object.values(LANGUAGE_CODES)

// Language metadata with display information
export const LANGUAGE_INFO = {
  [LANGUAGE_CODES.ENGLISH]: {
    code: LANGUAGE_CODES.ENGLISH,
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    locale: 'en-US'
  },
  [LANGUAGE_CODES.PORTUGUESE]: {
    code: LANGUAGE_CODES.PORTUGUESE,
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    locale: 'pt-BR'
  }
} as const

export type LanguageInfo = (typeof LANGUAGE_INFO)[keyof typeof LANGUAGE_INFO]

// Convenience array for language options in UI components
export const LANGUAGES: LanguageInfo[] = SUPPORTED_LANGUAGE_CODES.map(code => LANGUAGE_INFO[code])

// Helper functions
export const getLanguageInfo = (code: LanguageCode): LanguageInfo => {
  return LANGUAGE_INFO[code] || LANGUAGE_INFO[DEFAULT_LANGUAGE]
}

export const isValidLanguageCode = (code: string): code is LanguageCode => {
  return SUPPORTED_LANGUAGE_CODES.includes(code as LanguageCode)
}

export const getBrowserLanguage = (): LanguageCode => {
  const browserLang = navigator.language.slice(0, 2) as LanguageCode
  return isValidLanguageCode(browserLang) ? browserLang : DEFAULT_LANGUAGE
}

// Storage keys for persisting language preference
export const I18N_STORAGE_KEY = 'itrading_language'

// Namespace constants for translation files
export const I18N_NAMESPACES = {
  COMMON: 'common',
  NAVIGATION: 'navigation',
  FORMS: 'forms',
  NOTIFICATIONS: 'notifications',
  ERRORS: 'errors',
  PAGES: 'pages'
} as const

export type I18nNamespace = (typeof I18N_NAMESPACES)[keyof typeof I18N_NAMESPACES]
