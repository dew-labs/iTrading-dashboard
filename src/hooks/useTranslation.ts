import { useTranslation as useI18nTranslation } from 'react-i18next'
import { I18N_NAMESPACES, type I18nNamespace } from '../constants/languages'

/**
 * Custom hook for translations with type safety and namespace support
 *
 * @param namespace - The translation namespace to use (default: 'common')
 * @returns Translation function and i18n instance
 *
 * @example
 * ```tsx
 * // Using default namespace (common)
 * const { t } = useTranslation()
 * console.log(t('loading')) // "Loading..." or "Carregando..."
 *
 * // Using specific namespace
 * const { t } = useTranslation('navigation')
 * console.log(t('dashboard')) // "Dashboard" or "Painel"
 *
 * // With interpolation
 * const { t } = useTranslation('errors')
 * console.log(t('validation.tooShort', { min: 8 })) // "Too short. Minimum 8 characters required."
 * ```
 */
export const useTranslation = (namespace: I18nNamespace = I18N_NAMESPACES.COMMON) => {
  const { t, i18n, ready } = useI18nTranslation(namespace)

  return {
    /**
     * Translation function
     * @param key - Translation key
     * @param options - Interpolation options or default value
     */
    t,

    /**
     * i18n instance for advanced operations
     */
    i18n,

    /**
     * Whether translations are ready to use
     */
    ready,

    /**
     * Current language code
     */
    language: i18n.language,

    /**
     * Change language
     * @param language - Language code to switch to
     */
    changeLanguage: (language: string) => i18n.changeLanguage(language),

    /**
     * Get translations from multiple namespaces
     * @param namespaces - Array of namespaces
     */
    useMultipleNamespaces: (namespaces: I18nNamespace[]) => {
      return useI18nTranslation(namespaces)
    }
  }
}

/**
 * Hook for accessing translations from multiple namespaces
 *
 * @param namespaces - Array of namespaces to load
 * @returns Translation function and i18n instance
 *
 * @example
 * ```tsx
 * const { t } = useMultipleTranslations(['common', 'forms', 'errors'])
 * console.log(t('common:loading'))
 * console.log(t('forms:buttons.save'))
 * console.log(t('errors:validation.required'))
 * ```
 */
export const useMultipleTranslations = (namespaces: I18nNamespace[]) => {
  const { t, i18n, ready } = useI18nTranslation(namespaces)

  return {
    t,
    i18n,
    ready,
    language: i18n.language,
    changeLanguage: (language: string) => i18n.changeLanguage(language)
  }
}

/**
 * Hook specifically for form-related translations
 *
 * @returns Translation functions for forms namespace
 */
export const useFormTranslation = () => {
  return useTranslation(I18N_NAMESPACES.FORMS)
}

/**
 * Hook specifically for navigation-related translations
 *
 * @returns Translation functions for navigation namespace
 */
export const useNavigationTranslation = () => {
  return useTranslation(I18N_NAMESPACES.NAVIGATION)
}

/**
 * Hook specifically for notification-related translations
 *
 * @returns Translation functions for notifications namespace
 */
export const useNotificationTranslation = () => {
  return useTranslation(I18N_NAMESPACES.NOTIFICATIONS)
}

/**
 * Hook specifically for error-related translations
 *
 * @returns Translation functions for errors namespace
 */
export const useErrorTranslation = () => {
  return useTranslation(I18N_NAMESPACES.ERRORS)
}

export default useTranslation
