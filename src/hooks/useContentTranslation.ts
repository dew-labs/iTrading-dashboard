import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TranslationService } from '../services/translationService'
import { useTranslation } from './useTranslation'
import { useToast, type EntityType } from './useToast'
import { CONTENT_LANGUAGE_CODES } from '../constants/languages'
import type {
  LanguageCode,
  TranslatableContentType,
  Translation,
  TranslationFormData,
  TranslationOperationResult,
  TranslationStatus,
  TranslationCompleteness,
  UseTranslationResult
} from '../types/translations'
import {
  getTranslationCompleteness,
  getTranslationStatus,
  createEmptyTranslation,
  validateTranslation
} from '../utils/translationUtils'

/**
 * Hook for managing content translations
 */
export const useContentTranslation = (
  contentType: TranslatableContentType,
  contentId: string,
  options: {
    enabled?: boolean
    defaultLanguage?: LanguageCode
    requiredLanguages?: LanguageCode[]
  } = {}
): UseTranslationResult => {
  const {
    enabled = true,
    defaultLanguage = 'en',
    requiredLanguages = CONTENT_LANGUAGE_CODES
  } = options

  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(defaultLanguage)
  const { language } = useTranslation()
  const queryClient = useQueryClient()
  const toast = useToast()

  // Fetch translations
  const {
    data: translations = [],
    isLoading: loading,
    error: fetchError
  } = useQuery<Translation[]>({
    queryKey: ['translations', contentType, contentId],
    queryFn: () => TranslationService.getTranslations(contentType, contentId),
    enabled: enabled && !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })

  // Get current translation based on selected language
  const currentTranslation = translations.find((t: Translation) => t.language_code === currentLanguage)

  // Sync with global language setting
  useEffect(() => {
    if (language && language !== currentLanguage) {
      setCurrentLanguage(language as LanguageCode)
    }
  }, [language, currentLanguage])

  // Create translation mutation
  const createMutation = useMutation({
    mutationFn: async (translationData: TranslationFormData) => {
      const { languageCode, fields } = translationData

      // Validate the translation
      const emptyTranslation = createEmptyTranslation(contentType, contentId, languageCode)
      const translationToValidate = { ...emptyTranslation, ...fields }
      const validation = validateTranslation(translationToValidate, contentType)

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Create translation based on content type
      switch (contentType) {
                case 'posts':
          return await TranslationService.createPostTranslation({
            post_id: contentId,
            language_code: languageCode,
            title: fields.title || '',
            ...(fields.excerpt && { excerpt: fields.excerpt }),
            ...(fields.content && { content: fields.content }),
            ...(fields.reading_time && { reading_time: parseInt(fields.reading_time) || 1 })
          })
        case 'products':
          return await TranslationService.createProductTranslation({
            product_id: contentId,
            language_code: languageCode,
            name: fields.name || '',
            ...(fields.description && { description: fields.description })
          })
        case 'brokers':
          return await TranslationService.createBrokerTranslation({
            broker_id: contentId,
            language_code: languageCode,
            ...(fields.description && { description: fields.description })
          })
        default:
          throw new Error(`Unsupported content type: ${contentType}`)
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['translations', contentType, contentId] })
        toast.success('created', contentType.slice(0, -1) as EntityType)
      } else {
        throw new Error(result.error || 'Failed to create translation')
      }
    },
    onError: (error) => {
      toast.error('validation', undefined, error instanceof Error ? error.message : 'Failed to create translation')
    }
  })

  // Update translation mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, translationData }: { id: string; translationData: TranslationFormData }) => {
      const { fields } = translationData

      // Update translation based on content type
      switch (contentType) {
        case 'posts':
          return await TranslationService.updatePostTranslation(id, {
            ...(fields.title && { title: fields.title }),
            ...(fields.excerpt && { excerpt: fields.excerpt }),
            ...(fields.content && { content: fields.content }),
            ...(fields.reading_time && { reading_time: parseInt(fields.reading_time) || 1 })
          })
        case 'products':
          return await TranslationService.updateProductTranslation(id, {
            ...(fields.name && { name: fields.name }),
            ...(fields.description && { description: fields.description })
          })
        case 'brokers':
          return await TranslationService.updateBrokerTranslation(id, {
            ...(fields.description && { description: fields.description })
          })
        default:
          throw new Error(`Unsupported content type: ${contentType}`)
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['translations', contentType, contentId] })
        toast.success('updated', contentType.slice(0, -1) as EntityType)
      } else {
        throw new Error(result.error || 'Failed to update translation')
      }
    },
    onError: (error) => {
      toast.error('validation', undefined, error instanceof Error ? error.message : 'Failed to update translation')
    }
  })

  // Delete translation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      switch (contentType) {
        case 'posts':
          return await TranslationService.deletePostTranslation(id)
        case 'products':
          return await TranslationService.deleteProductTranslation(id)
        case 'brokers':
          return await TranslationService.deleteBrokerTranslation(id)
        default:
          throw new Error(`Unsupported content type: ${contentType}`)
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['translations', contentType, contentId] })
        toast.success('deleted', contentType.replace(/s$/, '') as EntityType) // Convert contentType to EntityType
      } else {
        throw new Error(result.error || 'Failed to delete translation')
      }
    },
    onError: (error) => {
      toast.error('validation', undefined, error instanceof Error ? error.message : 'Failed to delete translation')
    }
  })

  // Helper functions
  const createTranslation = useCallback(
    async (translationData: TranslationFormData): Promise<TranslationOperationResult> => {
      try {
        const result = await createMutation.mutateAsync(translationData)
        return result
      } catch (error) {
        return {
          success: false,
          message: 'Failed to create translation',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    },
    [createMutation]
  )

  const updateTranslation = useCallback(
    async (id: string, translationData: TranslationFormData): Promise<TranslationOperationResult> => {
      try {
        const result = await updateMutation.mutateAsync({ id, translationData })
        return result
      } catch (error) {
        return {
          success: false,
          message: 'Failed to update translation',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    },
    [updateMutation]
  )

  const deleteTranslation = useCallback(
    async (id: string): Promise<TranslationOperationResult> => {
      try {
        const result = await deleteMutation.mutateAsync(id)
        return result
      } catch (error) {
        return {
          success: false,
          message: 'Failed to delete translation',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    },
    [deleteMutation]
  )

  const getTranslationStatusCallback = useCallback((): TranslationStatus[] => {
    return getTranslationStatus(translations)
  }, [translations])

  const getCompleteness = useCallback((): TranslationCompleteness => {
    return getTranslationCompleteness(translations, requiredLanguages)
  }, [translations, requiredLanguages])

  return {
    translations,
    currentTranslation,
    loading: loading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: fetchError ? (fetchError as Error).message : undefined,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    setCurrentLanguage,
    getTranslationStatus: getTranslationStatusCallback,
    getCompleteness
  }
}

/**
 * Hook for managing translations with posts data
 */
export const usePostTranslations = (
  postId: string,
  options?: {
    enabled?: boolean
    defaultLanguage?: LanguageCode
    requiredLanguages?: LanguageCode[]
  }
) => {
  return useContentTranslation('posts', postId, options)
}

/**
 * Hook for managing translations with products data
 */
export const useProductTranslations = (
  productId: string,
  options?: {
    enabled?: boolean
    defaultLanguage?: LanguageCode
    requiredLanguages?: LanguageCode[]
  }
) => {
  return useContentTranslation('products', productId, options)
}

/**
 * Hook for managing translations with brokers data
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

/**
 * Hook for getting translation statistics
 */
export const useTranslationStatistics = (contentType: TranslatableContentType) => {
  return useQuery({
    queryKey: ['translation-statistics', contentType],
    queryFn: () => TranslationService.getTranslationStatistics(contentType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

/**
 * Hook for checking if translation exists
 */
export const useTranslationExists = (
  contentType: TranslatableContentType,
  contentId: string,
  languageCode: LanguageCode
) => {
  return useQuery({
    queryKey: ['translation-exists', contentType, contentId, languageCode],
    queryFn: () => TranslationService.translationExists(contentType, contentId, languageCode),
    enabled: !!contentId && !!languageCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

/**
 * Hook for bulk translation operations
 */
export const useBulkTranslations = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  const bulkDeleteMutation = useMutation({
    mutationFn: async ({
      contentType,
      contentIds,
      languageCode
    }: {
      contentType: TranslatableContentType
      contentIds: string[]
      languageCode?: LanguageCode
    }) => {
      return await TranslationService.bulkDeleteTranslations(contentType, contentIds, languageCode)
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['translations', variables.contentType] })
        toast.success('deleted', undefined, `${result.deletedCount} translations deleted`)
      } else {
        throw new Error(result.errors.join(', '))
      }
    },
    onError: (error) => {
      toast.error('validation', undefined, error instanceof Error ? error.message : 'Failed to delete translations')
    }
  })

  return {
    bulkDelete: bulkDeleteMutation.mutate,
    bulkDeleteAsync: bulkDeleteMutation.mutateAsync,
    isLoading: bulkDeleteMutation.isPending,
    error: bulkDeleteMutation.error
  }
}
