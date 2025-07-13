import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { TranslationService } from '../../services/translationService'
import type { Translation, LanguageCode, TranslatableContentType } from '../../types/translations'

/**
 * Configuration for translated content
 */
interface TranslatedContentConfig {
  contentType: TranslatableContentType
  language?: LanguageCode
  enabled?: boolean
  staleTime?: number
  gcTime?: number
  refetchInterval?: number | false | ((...args: unknown[]) => number | false | undefined)
}

/**
 * Translation status for a single item
 */
interface TranslationStatus {
  hasEnglish: boolean
  hasPortuguese: boolean
  hasAnyTranslation: boolean
  totalTranslations: number
  completedTranslations: number
  translationsByLanguage: Record<LanguageCode, Translation>
}

/**
 * Return type for useTranslatedContent hook
 */
interface UseTranslatedContentReturn<T> {
  data: T[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<any>
  getTranslationStatus: (item: T) => TranslationStatus
  getTranslatedField: (item: T, field: string, language?: LanguageCode) => string | undefined
  filterByTranslationStatus: (items: T[], status: 'complete' | 'incomplete' | 'missing') => T[]
  getAvailableLanguages: (item: T) => LanguageCode[]
}

/**
 * Generic hook for fetching content with translations
 * This replaces all the duplicated translation hooks
 */
export function useTranslatedContent<T extends { id: string; translations?: Translation[] }>(
  config: TranslatedContentConfig
): UseTranslatedContentReturn<T> {
  const { contentType, language, enabled = true, staleTime = 2 * 60 * 1000, gcTime = 5 * 60 * 1000, refetchInterval } = config
  const { i18n } = useTranslation()

  // Use current language if not specified
  const currentLanguage = language || (i18n.language as LanguageCode)

  // Create query key that includes content type and language
  const queryKey = [`${contentType}-with-translations`, currentLanguage]

  // Build query options, only include refetchInterval if defined
  const queryOptions: Record<string, unknown> = {
    queryKey,
    queryFn: async () => {
      switch (contentType) {
        case 'posts':
          return TranslationService.getPostsWithTranslations(currentLanguage)
        case 'products':
          return TranslationService.getProductsWithTranslations(currentLanguage)
        case 'brokers':
          return TranslationService.getBrokersWithTranslations(currentLanguage)
        default:
          throw new Error(`Unsupported content type: ${contentType}`)
      }
    },
    enabled,
    staleTime,
    gcTime
  }
  if (typeof refetchInterval !== 'undefined') {
    queryOptions.refetchInterval = refetchInterval
  }

  // Fetch data with translations
  const {
    data: rawData = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery<T[]>({ ...(queryOptions as any) })

  const data = rawData as T[]

  // Memoized helper functions
  const getTranslationStatus = useMemo(() => (item: T): TranslationStatus => {
    const translations = (item.translations || []) as Translation[]
    const hasEnglish = translations.some((t) => t.language_code === 'en')
    const hasPortuguese = translations.some((t) => t.language_code === 'pt')
    const hasAnyTranslation = translations.length > 0

    // Define required fields based on content type
    const requiredFields = getRequiredFieldsForContentType(contentType)

    const completedTranslations = translations.filter((t) => {
      return requiredFields.every(field =>
        typeof (t as any)[field] === 'string' && String((t as any)[field]).trim() !== ''
      )
    })

    const translationsByLanguage = translations.reduce((acc: Record<LanguageCode, Translation>, t) => {
      acc[t.language_code as LanguageCode] = t
      return acc
    }, {} as Record<LanguageCode, Translation>)

    return {
      hasEnglish,
      hasPortuguese,
      hasAnyTranslation,
      totalTranslations: translations.length,
      completedTranslations: completedTranslations.length,
      translationsByLanguage
    }
  }, [contentType])

  const getTranslatedField = useMemo(() => (
    item: T,
    field: string,
    language: LanguageCode = currentLanguage
  ): string | undefined => {
    const translations = (item.translations || []) as Translation[]

    // Helper to safely get a string field from a translation
    const getStringField = (t: Translation, f: string): string | undefined => {
      if (Object.prototype.hasOwnProperty.call(t, f) && typeof (t as any)[f] === 'string') {
        return (t as any)[f]
      }
      return undefined
    }

    // Try to find translation in requested language
    const translation = translations.find((t) => t.language_code === language)
    if (translation) {
      const value = getStringField(translation, field)
      if (value) return value
    }

    // Fallback to English if different language was requested
    if (language !== 'en') {
      const englishTranslation = translations.find((t) => t.language_code === 'en')
      if (englishTranslation) {
        const value = getStringField(englishTranslation, field)
        if (value) return value
      }
    }

    // Fallback to any available translation
    const anyTranslation = translations.find((t) => getStringField(t, field))
    return anyTranslation ? getStringField(anyTranslation, field) : undefined
  }, [currentLanguage])

  const filterByTranslationStatus = useMemo(() => (
    items: T[],
    status: 'complete' | 'incomplete' | 'missing'
  ): T[] => {
    return items.filter(item => {
      const translationStatus = getTranslationStatus(item)

      switch (status) {
        case 'complete':
          return translationStatus.completedTranslations > 0
        case 'incomplete':
          return translationStatus.hasAnyTranslation && translationStatus.completedTranslations === 0
        case 'missing':
          return !translationStatus.hasAnyTranslation
        default:
          return true
      }
    })
  }, [getTranslationStatus])

  const getAvailableLanguages = useMemo(() => (item: T): LanguageCode[] => {
    const translations = (item.translations || []) as Translation[]
    return translations.map((t) => t.language_code as LanguageCode)
  }, [])

  return {
    data,
    loading,
    error: error as Error | null,
    refetch,
    getTranslationStatus,
    getTranslatedField,
    filterByTranslationStatus,
    getAvailableLanguages
  }
}

/**
 * Helper function to get required fields for content type
 */
function getRequiredFieldsForContentType(contentType: TranslatableContentType): string[] {
  switch (contentType) {
    case 'posts':
      return ['title']
    case 'products':
      return ['name']
    case 'brokers':
      return ['description']
    default:
      return []
  }
}

/**
 * Convenience hooks for specific content types
 */
export function usePostsWithTranslations(language?: LanguageCode) {
  return useTranslatedContent({
    contentType: 'posts',
    ...(language ? { language } : {}),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000
  })
}

export function useProductsWithTranslations(language?: LanguageCode) {
  return useTranslatedContent({
    contentType: 'products',
    ...(language ? { language } : {}),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000
  })
}

export function useBrokersWithTranslations(language?: LanguageCode) {
  return useTranslatedContent({
    contentType: 'brokers',
    ...(language ? { language } : {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000
  })
}

/**
 * Hook for managing translations of a single item
 */
export function useItemTranslations(
  contentType: TranslatableContentType,
  itemId: string,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options
  const queryClient = useQueryClient()

  const {
    data: translations = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['translations', contentType, itemId],
    queryFn: () => TranslationService.getTranslations(contentType, itemId),
    enabled: enabled && !!itemId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000
  })

  const invalidateTranslations = () => {
    queryClient.invalidateQueries({ queryKey: ['translations', contentType, itemId] })
    // Also invalidate the main content queries
    queryClient.invalidateQueries({ queryKey: [`${contentType}-with-translations`] })
  }

  return {
    translations,
    loading,
    error,
    refetch,
    invalidateTranslations
  }
}

/**
 * Optimized translation context provider
 */
export function useTranslationContext() {
  const { i18n } = useTranslation()
  const queryClient = useQueryClient()

  const changeLanguage = async (language: LanguageCode) => {
    await i18n.changeLanguage(language)

    // Invalidate all translation queries to fetch new language data
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.some(key =>
          typeof key === 'string' && key.includes('-with-translations')
        )
    })
  }

  const preloadLanguage = (language: LanguageCode) => {
    // Preload translations for the specified language
    const contentTypes: TranslatableContentType[] = ['posts', 'products', 'brokers']

    contentTypes.forEach(contentType => {
      queryClient.prefetchQuery({
        queryKey: [`${contentType}-with-translations`, language],
        queryFn: async () => {
          switch (contentType) {
            case 'posts':
              return TranslationService.getPostsWithTranslations(language)
            case 'products':
              return TranslationService.getProductsWithTranslations(language)
            case 'brokers':
              return TranslationService.getBrokersWithTranslations(language)
            default:
              return []
          }
        },
        staleTime: 5 * 60 * 1000
      })
    })
  }

  return {
    currentLanguage: i18n.language as LanguageCode,
    changeLanguage,
    preloadLanguage
  }
}
