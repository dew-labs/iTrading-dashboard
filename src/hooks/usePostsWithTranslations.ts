import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { TranslationService } from '../services/translationService'
import type {
  PostWithTranslations,
  ProductWithTranslations,
  BrokerWithTranslations,
  PostTranslation,
  ProductTranslation,
  BrokerTranslation,
  LanguageCode
} from '../types/translations'

/**
 * Hook for fetching posts with translation data
 */
export const usePostsWithTranslations = (languageCode?: LanguageCode) => {
  const { i18n } = useTranslation()

  // Use current language if not specified
  const currentLanguage = languageCode || (i18n.language as LanguageCode)

  // Fetch posts with translations
  const {
    data: posts = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery<PostWithTranslations[]>({
    queryKey: ['posts-with-translations', currentLanguage],
    queryFn: () => TranslationService.getPostsWithTranslations(currentLanguage),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
  })

  // Helper functions to analyze translation status
  const getTranslationStatus = (post: PostWithTranslations) => {
    const translations = post.translations || []
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
        if ('title' in t && t.title && t.title.trim() !== '') {
          return true
        }
        return false
      }).length,
             translationsByLanguage: translations.reduce((acc, t) => {
         acc[t.language_code as LanguageCode] = t
         return acc
       }, {} as Record<LanguageCode, PostTranslation>)
    }
  }

  // Filter posts by translation status
  const filterByTranslationStatus = (posts: PostWithTranslations[], status: 'all' | 'translated' | 'untranslated' | 'partial') => {
    return posts.filter(post => {
      const translationStatus = getTranslationStatus(post)

      switch (status) {
        case 'translated':
          return translationStatus.hasEnglish && translationStatus.hasPortuguese
        case 'untranslated':
          return !translationStatus.hasAnyTranslation
        case 'partial':
          return translationStatus.hasAnyTranslation && !(translationStatus.hasEnglish && translationStatus.hasPortuguese)
        default:
          return true
      }
    })
  }

  // Get posts grouped by translation status
  const getPostsByTranslationStatus = () => {
    const translatedPosts = filterByTranslationStatus(posts, 'translated')
    const untranslatedPosts = filterByTranslationStatus(posts, 'untranslated')
    const partialPosts = filterByTranslationStatus(posts, 'partial')

    return {
      all: posts,
      translated: translatedPosts,
      untranslated: untranslatedPosts,
      partial: partialPosts,
      counts: {
        all: posts.length,
        translated: translatedPosts.length,
        untranslated: untranslatedPosts.length,
        partial: partialPosts.length
      }
    }
  }

  // Get translation statistics
  const getTranslationStats = () => {
    const { counts } = getPostsByTranslationStatus()
    const totalPosts = counts.all
    const translatedPercentage = totalPosts > 0 ? Math.round((counts.translated / totalPosts) * 100) : 0
    const untranslatedPercentage = totalPosts > 0 ? Math.round((counts.untranslated / totalPosts) * 100) : 0
    const partialPercentage = totalPosts > 0 ? Math.round((counts.partial / totalPosts) * 100) : 0

    return {
      totalPosts,
      translatedCount: counts.translated,
      untranslatedCount: counts.untranslated,
      partialCount: counts.partial,
      translatedPercentage,
      untranslatedPercentage,
      partialPercentage
    }
  }

  return {
    posts,
    loading,
    error: error as Error | null,
    refetch,
    // Helper functions
    getTranslationStatus,
    filterByTranslationStatus,
    getPostsByTranslationStatus,
    getTranslationStats,
    // Current language
    currentLanguage
  }
}

/**
 * Hook for fetching products with translation data
 */
export const useProductsWithTranslations = (languageCode?: LanguageCode) => {
  const { i18n } = useTranslation()

  // Use current language if not specified
  const currentLanguage = languageCode || (i18n.language as LanguageCode)

  // Fetch products with translations
  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products-with-translations', currentLanguage],
    queryFn: () => TranslationService.getProductsWithTranslations(currentLanguage),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
  })

  // Helper functions (similar to posts)
  const getTranslationStatus = (product: ProductWithTranslations) => {
    const translations = product.translations || []
    const hasEnglish = translations.some((t: ProductTranslation) => t.language_code === 'en')
    const hasPortuguese = translations.some((t: ProductTranslation) => t.language_code === 'pt')
    const hasAnyTranslation = translations.length > 0

    return {
      hasEnglish,
      hasPortuguese,
      hasAnyTranslation,
      totalTranslations: translations.length,
      completedTranslations: translations.filter((t: ProductTranslation) => {
        // Check if translation is complete (has required fields)
        if ('name' in t && t.name && t.name.trim() !== '') {
          return true
        }
        return false
      }).length,
      translationsByLanguage: translations.reduce((acc: Record<LanguageCode, ProductTranslation>, t: ProductTranslation) => {
        acc[t.language_code as LanguageCode] = t
        return acc
      }, {} as Record<LanguageCode, ProductTranslation>)
    }
  }

  const filterByTranslationStatus = (products: ProductWithTranslations[], status: 'all' | 'translated' | 'untranslated' | 'partial') => {
    return products.filter(product => {
      const translationStatus = getTranslationStatus(product)

      switch (status) {
        case 'translated':
          return translationStatus.hasEnglish && translationStatus.hasPortuguese
        case 'untranslated':
          return !translationStatus.hasAnyTranslation
        case 'partial':
          return translationStatus.hasAnyTranslation && !(translationStatus.hasEnglish && translationStatus.hasPortuguese)
        default:
          return true
      }
    })
  }

  return {
    products,
    loading,
    error: error as Error | null,
    refetch,
    // Helper functions
    getTranslationStatus,
    filterByTranslationStatus,
    // Current language
    currentLanguage
  }
}

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
  } = useQuery({
    queryKey: ['brokers-with-translations', currentLanguage],
    queryFn: () => TranslationService.getBrokersWithTranslations(currentLanguage),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
  })

  // Helper functions (similar to posts)
  const getTranslationStatus = (broker: BrokerWithTranslations) => {
    const translations = broker.translations || []
    const hasEnglish = translations.some((t: BrokerTranslation) => t.language_code === 'en')
    const hasPortuguese = translations.some((t: BrokerTranslation) => t.language_code === 'pt')
    const hasAnyTranslation = translations.length > 0

    return {
      hasEnglish,
      hasPortuguese,
      hasAnyTranslation,
      totalTranslations: translations.length,
      completedTranslations: translations.filter((t: BrokerTranslation) => {
        // Check if translation is complete (has required fields)
        if ('description' in t && t.description && t.description.trim() !== '') {
          return true
        }
        return false
      }).length,
      translationsByLanguage: translations.reduce((acc: Record<LanguageCode, BrokerTranslation>, t: BrokerTranslation) => {
        acc[t.language_code as LanguageCode] = t
        return acc
      }, {} as Record<LanguageCode, BrokerTranslation>)
    }
  }

  const filterByTranslationStatus = (brokers: BrokerWithTranslations[], status: 'all' | 'translated' | 'untranslated' | 'partial') => {
    return brokers.filter(broker => {
      const translationStatus = getTranslationStatus(broker)

      switch (status) {
        case 'translated':
          return translationStatus.hasEnglish && translationStatus.hasPortuguese
        case 'untranslated':
          return !translationStatus.hasAnyTranslation
        case 'partial':
          return translationStatus.hasAnyTranslation && !(translationStatus.hasEnglish && translationStatus.hasPortuguese)
        default:
          return true
      }
    })
  }

  return {
    brokers,
    loading,
    error: error as Error | null,
    refetch,
    // Helper functions
    getTranslationStatus,
    filterByTranslationStatus,
    // Current language
    currentLanguage
  }
}
