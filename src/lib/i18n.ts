import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGE_CODES,
  I18N_STORAGE_KEY,
  getBrowserLanguage,
  I18N_NAMESPACES
} from '../constants/languages'

// Import translation files
import enCommon from '../locales/en/common.json'
import enNavigation from '../locales/en/navigation.json'
import enForms from '../locales/en/forms.json'
import enNotifications from '../locales/en/notifications.json'
import enErrors from '../locales/en/errors.json'

import ptCommon from '../locales/pt/common.json'
import ptNavigation from '../locales/pt/navigation.json'
import ptForms from '../locales/pt/forms.json'
import ptNotifications from '../locales/pt/notifications.json'
import ptErrors from '../locales/pt/errors.json'

// Get saved language from localStorage or use browser language
const getSavedLanguage = (): string => {
  try {
    const saved = localStorage.getItem(I18N_STORAGE_KEY)
    if (saved && SUPPORTED_LANGUAGE_CODES.includes(saved as 'en' | 'pt')) {
      return saved
    }
  } catch (error) {
    console.warn('Failed to read language preference from localStorage:', error)
  }
  return getBrowserLanguage()
}

// Resources object containing all translations
const resources = {
  en: {
    [I18N_NAMESPACES.COMMON]: enCommon,
    [I18N_NAMESPACES.NAVIGATION]: enNavigation,
    [I18N_NAMESPACES.FORMS]: enForms,
    [I18N_NAMESPACES.NOTIFICATIONS]: enNotifications,
    [I18N_NAMESPACES.ERRORS]: enErrors
  },
  pt: {
    [I18N_NAMESPACES.COMMON]: ptCommon,
    [I18N_NAMESPACES.NAVIGATION]: ptNavigation,
    [I18N_NAMESPACES.FORMS]: ptForms,
    [I18N_NAMESPACES.NOTIFICATIONS]: ptNotifications,
    [I18N_NAMESPACES.ERRORS]: ptErrors
  }
}

// Initialize i18next
i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: getSavedLanguage(), // Language to use
    fallbackLng: DEFAULT_LANGUAGE, // Fallback language
    defaultNS: I18N_NAMESPACES.COMMON, // Default namespace
    interpolation: {
      escapeValue: false // React already does escaping
    },
    // Advanced options
    debug: process.env.NODE_ENV === 'development',
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${ns}:${key} for language: ${lng}`)
      }
    },
    // React specific options
    react: {
      useSuspense: false
    }
  })

// Save language preference to localStorage when language changes
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(I18N_STORAGE_KEY, lng)
  } catch (error) {
    console.warn('Failed to save language preference to localStorage:', error)
  }
})

export default i18n
