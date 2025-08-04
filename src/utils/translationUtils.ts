import { CONTENT_LANGUAGE_CODES } from '../constants/languages'
import type {
  LanguageCode,
  TranslatableContentType,
  Translation,
  PostTranslation,
  ProductTranslation,
  BrokerTranslation,
  TranslationCompleteness,
  TranslationStatus,
  TranslatedFieldResult,
  PostWithTranslations,
  ProductWithTranslations,
  BrokerWithTranslations
} from '../types/translations'

/**
 * Get a translated field value with fallback logic
 */
const getFieldValue = (translation: Translation, field: string): string | undefined => {
  if (field in translation) {
    const value = (translation as unknown as Record<string, unknown>)[field]
    return typeof value === 'string' ? value : undefined
  }
  return undefined
}

export const getTranslatedField = <T extends Record<string, unknown>>(
  item: T,
  field: string,
  language: LanguageCode,
  fallbackLanguage: LanguageCode = 'en'
): TranslatedFieldResult => {
  // If the item has translations array
  if (item.translations && Array.isArray(item.translations)) {
    const translations = item.translations as Translation[]

    // Try to find translation in requested language
    const requestedTranslation = translations.find(t => t.language_code === language)
    if (requestedTranslation) {
      const value = getFieldValue(requestedTranslation, field)
      if (value) {
        return {
          value,
          language,
          isFallback: false,
          isOriginal: language === fallbackLanguage
        }
      }
    }

    // Try fallback language if different from requested
    if (language !== fallbackLanguage) {
      const fallbackTranslation = translations.find(t => t.language_code === fallbackLanguage)
      if (fallbackTranslation) {
        const value = getFieldValue(fallbackTranslation, field)
        if (value) {
          return {
            value,
            language: fallbackLanguage,
            isFallback: true,
            isOriginal: true
          }
        }
      }
    }
  }

  // If item has currentTranslation
  if (item.currentTranslation && typeof item.currentTranslation === 'object') {
    const currentTranslation = item.currentTranslation as Translation
    const value = getFieldValue(currentTranslation, field)
    if (value) {
      return {
        value,
        language: currentTranslation.language_code as LanguageCode,
        isFallback: currentTranslation.language_code !== language,
        isOriginal: currentTranslation.language_code === fallbackLanguage
      }
    }
  }

  // Fallback to original field in the main item
  if (item[field]) {
    const value = item[field]
    if (typeof value === 'string') {
      return {
        value,
        language: fallbackLanguage,
        isFallback: language !== fallbackLanguage,
        isOriginal: true
      }
    }
  }

  // Return empty string if nothing found
  return {
    value: '',
    language: fallbackLanguage,
    isFallback: true,
    isOriginal: false
  }
}

/**
 * Check if a translation exists for a specific language
 */
export const hasTranslation = (
  translations: Translation[],
  language: LanguageCode
): boolean => {
  return translations.some(t => t.language_code === language)
}

/**
 * Get translation completeness information
 */
export const getTranslationCompleteness = (
  translations: Translation[],
  requiredLanguages: LanguageCode[] = CONTENT_LANGUAGE_CODES
): TranslationCompleteness => {
  const completed = requiredLanguages.filter(lang => hasTranslation(translations, lang))
  const missing = requiredLanguages.filter(lang => !hasTranslation(translations, lang))

  return {
    total: requiredLanguages.length,
    completed: completed.length,
    missing,
    percentage: Math.round((completed.length / requiredLanguages.length) * 100)
  }
}

/**
 * Get translation status for all required languages
 */
export const getTranslationStatus = (
  translations: Translation[],
  requiredLanguages: LanguageCode[] = CONTENT_LANGUAGE_CODES
): TranslationStatus[] => {
  return requiredLanguages.map(language => {
    const translation = translations.find(t => t.language_code === language)
    return {
      languageCode: language,
      hasTranslation: !!translation,
      isComplete: !!translation && isTranslationComplete(translation),
      lastUpdated: translation?.updated_at
    }
  })
}

/**
 * Check if a translation is complete (has all required fields)
 */
export const isTranslationComplete = (translation: Translation): boolean => {
  if ('title' in translation) {
    // Post translation - title is required
    return !!translation.title
  }

  if ('name' in translation) {
    // Product translation - name is required
    return !!translation.name
  }

  if ('description' in translation && !('name' in translation) && !('title' in translation)) {
    // Broker translation - description is the only field
    return !!translation.description
  }

  return false
}

/**
 * Get the required fields for a content type
 */
export const getRequiredFields = (contentType: TranslatableContentType): string[] => {
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
 * Get the optional fields for a content type
 */
export const getOptionalFields = (contentType: TranslatableContentType): string[] => {
  switch (contentType) {
    case 'posts':
      return ['excerpt', 'content']
    case 'products':
      return ['description']
    case 'brokers':
      return ['affiliate_link']
    default:
      return []
  }
}

/**
 * Get all translatable fields for a content type
 */
export const getTranslatableFields = (contentType: TranslatableContentType): string[] => {
  return [...getRequiredFields(contentType), ...getOptionalFields(contentType)]
}

/**
 * Create a translation object with empty values
 */
export const createEmptyTranslation = (
  contentType: TranslatableContentType,
  contentId: string,
  language: LanguageCode
): Partial<Translation> => {
  const baseTranslation = {
    language_code: language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  switch (contentType) {
    case 'posts':
      return {
        ...baseTranslation,
        post_id: contentId,
        title: '',
        excerpt: '',
        content: ''
      } as Partial<PostTranslation>

    case 'products':
      return {
        ...baseTranslation,
        product_id: contentId,
        name: '',
        description: ''
      } as Partial<ProductTranslation>

    case 'brokers':
      return {
        ...baseTranslation,
        broker_id: contentId,
        description: '',
        affiliate_link: ''
      } as Partial<BrokerTranslation>

    default:
      return baseTranslation
  }
}

/**
 * Validate translation data
 */
export const validateTranslation = (
  translation: Partial<Translation>,
  contentType: TranslatableContentType
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const requiredFields = getRequiredFields(contentType)

  // Check required fields
  for (const field of requiredFields) {
    const fieldValue = getFieldValue(translation as Translation, field)
    if (!fieldValue || fieldValue.trim() === '') {
      errors.push(`${field} is required`)
    }
  }

  // Check language code
  if (!translation.language_code || !CONTENT_LANGUAGE_CODES.includes(translation.language_code as LanguageCode)) {
    errors.push('Valid language code is required')
  }

  // Check content ID
  const contentIdField = getContentIdField(contentType)
  if (!translation[contentIdField as keyof Translation]) {
    errors.push(`${contentIdField} is required`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get the content ID field name for a content type
 */
export const getContentIdField = (contentType: TranslatableContentType): string => {
  switch (contentType) {
    case 'posts':
      return 'post_id'
    case 'products':
      return 'product_id'
    case 'brokers':
      return 'broker_id'
    default:
      return 'id'
  }
}

/**
 * Sort translations by language code
 */
export const sortTranslationsByLanguage = (translations: Translation[]): Translation[] => {
  return translations.sort((a, b) => {
    // Put English first, then Portuguese, then Vietnamese, then others alphabetically
    if (a.language_code === 'en') return -1
    if (b.language_code === 'en') return 1
    if (a.language_code === 'pt') return -1
    if (b.language_code === 'pt') return 1
    if (a.language_code === 'vi') return -1
    if (b.language_code === 'vi') return 1
    return a.language_code.localeCompare(b.language_code)
  })
}

/**
 * Get translation by language code
 */
export const getTranslationByLanguage = (
  translations: Translation[],
  language: LanguageCode
): Translation | undefined => {
  return translations.find(t => t.language_code === language)
}

/**
 * Check if content has any translations
 */
export const hasAnyTranslations = (
  content: PostWithTranslations | ProductWithTranslations | BrokerWithTranslations
): boolean => {
  return content.translations && content.translations.length > 0
}

/**
 * Get missing translations for content
 */
export const getMissingTranslations = (
  content: PostWithTranslations | ProductWithTranslations | BrokerWithTranslations,
  requiredLanguages: LanguageCode[] = CONTENT_LANGUAGE_CODES
): LanguageCode[] => {
  if (!content.translations) return requiredLanguages

  const existingLanguages = content.translations.map(t => t.language_code as LanguageCode)
  return requiredLanguages.filter(lang => !existingLanguages.includes(lang))
}

/**
 * Get translation statistics
 */
export const getTranslationStatistics = (
  contents: (PostWithTranslations | ProductWithTranslations | BrokerWithTranslations)[],
  requiredLanguages: LanguageCode[] = CONTENT_LANGUAGE_CODES
): {
  totalContent: number
  withTranslations: number
  withoutTranslations: number
  translationsByLanguage: Record<LanguageCode, number>
  completeness: number
} => {
  const totalContent = contents.length
  const withTranslations = contents.filter(hasAnyTranslations).length
  const withoutTranslations = totalContent - withTranslations

  const translationsByLanguage = requiredLanguages.reduce((acc, lang) => {
    acc[lang] = contents.filter(content => hasTranslation(content.translations || [], lang)).length
    return acc
  }, {} as Record<LanguageCode, number>)

  const completeness = totalContent > 0
    ? Math.round((withTranslations / totalContent) * 100)
    : 0

  return {
    totalContent,
    withTranslations,
    withoutTranslations,
    translationsByLanguage,
    completeness
  }
}

/**
 * Format translation field for display
 */
export const formatTranslationField = (
  value: string | undefined,
  maxLength?: number,
  placeholder = 'Not translated'
): string => {
  if (!value || value.trim() === '') {
    return placeholder
  }

  if (maxLength && value.length > maxLength) {
    return value.substring(0, maxLength) + '...'
  }

  return value
}

/**
 * Get content type from translation
 */
export const getContentTypeFromTranslation = (translation: Translation): TranslatableContentType => {
  if ('post_id' in translation) return 'posts'
  if ('product_id' in translation) return 'products'
  if ('broker_id' in translation) return 'brokers'
  throw new Error('Unknown translation type')
}

/**
 * Check if two translations are equal
 */
export const areTranslationsEqual = (
  translation1: Translation,
  translation2: Translation
): boolean => {
  if (translation1.language_code !== translation2.language_code) {
    return false
  }

  const contentType = getContentTypeFromTranslation(translation1)
  const fields = getTranslatableFields(contentType)

  return fields.every(field => {
    const value1 = getFieldValue(translation1, field) || ''
    const value2 = getFieldValue(translation2, field) || ''
    return value1.trim() === value2.trim()
  })
}
