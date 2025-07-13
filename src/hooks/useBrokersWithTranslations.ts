import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { TranslationService } from '../services/translationService'
import { useContentTranslation } from './useContentTranslation'
import type {
  BrokerWithTranslations,
  BrokerTranslation,
  LanguageCode
} from '../types/translations'

/**
 * Hook for fetching brokers with translation data
 */
export const useBrokersWithTranslations = (languageCode?: LanguageCode) => {
  const { i18n } = useTranslation()

  // Use current language if not specified
  const currentLanguage = languageCode || (i18n.language as LanguageCode)

  // Fetch brokers with translations
  const {
    data: brokers = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery<BrokerWithTranslations[]>({
    queryKey: ['brokers-with-translations', currentLanguage],
    queryFn: () => TranslationService.getBrokersWithTranslations(currentLanguage),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
  })

  // Helper functions to analyze translation status
  const getTranslationStatus = (broker: BrokerWithTranslations) => {
    const translations = broker.translations || []
    const hasEnglish = translations.some(t => t.language_code === 'en')
    const hasPortuguese = translations.some(t => t.language_code === 'pt')
    const hasAnyTranslation = translations.length > 0

    return {
      hasEnglish,
      hasPortuguese,
      hasAnyTranslation,
      totalTranslations: translations.length,
      completedTranslations: translations.filter(t => {
        // Check if translation is complete (has required fields)
        if ('description' in t && t.description && t.description.trim() !== '') {
          return true
        }
        return false
      }).length,
      translationsByLanguage: translations.reduce((acc, t) => {
        acc[t.language_code as LanguageCode] = t
        return acc
      }, {} as Record<LanguageCode, BrokerTranslation>)
    }
  }

  // Get translation for specific language
  const getTranslationForLanguage = (broker: BrokerWithTranslations, language: LanguageCode): BrokerTranslation | null => {
    const translations = broker.translations || []
    return translations.find(t => t.language_code === language) || null
  }

  // Get current translation (based on currentLanguage)
  const getCurrentTranslation = (broker: BrokerWithTranslations): BrokerTranslation | null => {
    return getTranslationForLanguage(broker, currentLanguage)
  }

  // Check if broker has translation for specific language
  const hasTranslationForLanguage = (broker: BrokerWithTranslations, language: LanguageCode): boolean => {
    const translations = broker.translations || []
    return translations.some(t => t.language_code === language)
  }

  // Get missing translations for broker
  const getMissingTranslations = (broker: BrokerWithTranslations, requiredLanguages: LanguageCode[] = ['en', 'pt']): LanguageCode[] => {
    const translations = broker.translations || []
    const existingLanguages = translations.map(t => t.language_code)
    return requiredLanguages.filter(lang => !existingLanguages.includes(lang))
  }

  // Calculate translation completeness percentage
  const getTranslationCompleteness = (broker: BrokerWithTranslations, requiredLanguages: LanguageCode[] = ['en', 'pt']): number => {
    const translations = broker.translations || []
    const completedTranslations = translations.filter(t => {
      // Check if translation is complete (has required fields)
      return t.description && t.description.trim() !== ''
    }).length

    const totalRequired = requiredLanguages.length
    return totalRequired > 0 ? (completedTranslations / totalRequired) * 100 : 0
  }

  // Get translation statistics
  const getTranslationStats = () => {
    const totalBrokers = brokers.length
    const brokersWithTranslations = brokers.filter(b => (b.translations || []).length > 0).length
    const brokersWithEnglish = brokers.filter(b => hasTranslationForLanguage(b, 'en')).length
    const brokersWithPortuguese = brokers.filter(b => hasTranslationForLanguage(b, 'pt')).length
    const fullyTranslated = brokers.filter(b => {
      const translations = b.translations || []
      return translations.length >= 2 && translations.every(t => t.description && t.description.trim() !== '')
    }).length

    return {
      totalBrokers,
      brokersWithTranslations,
      brokersWithEnglish,
      brokersWithPortuguese,
      fullyTranslated,
      translationCoverage: totalBrokers > 0 ? (brokersWithTranslations / totalBrokers) * 100 : 0
    }
  }

  return {
    brokers,
    loading,
    error,
    refetch,
    // Helper functions
    getTranslationStatus,
    getTranslationForLanguage,
    getCurrentTranslation,
    hasTranslationForLanguage,
    getMissingTranslations,
    getTranslationCompleteness,
    getTranslationStats,
    // Current language
    currentLanguage
  }
}

/**
 * Hook for managing translations with broker data
 */
export const useBrokerTranslations = (
  brokerId: string,
  options?: {
    enabled?: boolean
    defaultLanguage?: LanguageCode
    requiredLanguages?: LanguageCode[]
  }
) => {
  return useContentTranslation('brokers', brokerId, options)
}
