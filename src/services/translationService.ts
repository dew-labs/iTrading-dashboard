import { supabase } from '../lib/supabase'
import type {
  LanguageCode,
  TranslatableContentType,
  Translation,
  PostTranslation,
  ProductTranslation,
  BrokerTranslation,
  PostTranslationInsert,
  ProductTranslationInsert,
  BrokerTranslationInsert,
  PostTranslationUpdate,
  ProductTranslationUpdate,
  BrokerTranslationUpdate,
  TranslationOperationResult,
  PostWithTranslations,
  ProductWithTranslations,
  BrokerWithTranslations
} from '../types/translations'

/**
 * Translation Service
 * Handles all database operations for content translations
 */
export class TranslationService {
  // ==========================================
  // POSTS TRANSLATIONS
  // ==========================================

  /**
   * Get all translations for a post
   */
  static async getPostTranslations(
    postId: string,
    languageCode?: LanguageCode
  ): Promise<PostTranslation[]> {
    let query = supabase
      .from('posts_translations')
      .select('*')
      .eq('post_id', postId)
      .order('language_code')

    if (languageCode) {
      query = query.eq('language_code', languageCode)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching post translations:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get posts with translations
   */
  static async getPostsWithTranslations(
    languageCode?: LanguageCode
  ): Promise<PostWithTranslations[]> {
    const { data, error } = await supabase
      .from('posts_with_translations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts with translations:', error)
      throw error
    }

    return (data || []).map(post => {
      const translations = Array.isArray(post.translations)
        ? (post.translations as unknown as PostTranslation[])
        : []

      return {
        ...post,
        translations,
        currentTranslation: languageCode && translations.length > 0
          ? translations.find((t: PostTranslation) => t.language_code === languageCode)
          : undefined
      }
    })
  }

  /**
   * Create a new post translation
   */
  static async createPostTranslation(
    translation: PostTranslationInsert
  ): Promise<TranslationOperationResult> {
    try {
      const { data, error } = await supabase
        .from('posts_translations')
        .insert(translation)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          message: 'Failed to create post translation',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Post translation created successfully',
        translation: data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create post translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update a post translation
   */
  static async updatePostTranslation(
    id: string,
    translation: PostTranslationUpdate
  ): Promise<TranslationOperationResult> {
    try {
      const { data, error } = await supabase
        .from('posts_translations')
        .update({
          ...translation,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          message: 'Failed to update post translation',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Post translation updated successfully',
        translation: data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update post translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete a post translation
   */
  static async deletePostTranslation(id: string): Promise<TranslationOperationResult> {
    try {
      const { error } = await supabase
        .from('posts_translations')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          success: false,
          message: 'Failed to delete post translation',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Post translation deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete post translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ==========================================
  // PRODUCTS TRANSLATIONS
  // ==========================================

  /**
   * Get all translations for a product
   */
  static async getProductTranslations(
    productId: string,
    languageCode?: LanguageCode
  ): Promise<ProductTranslation[]> {
    let query = supabase
      .from('products_translations')
      .select('*')
      .eq('product_id', productId)
      .order('language_code')

    if (languageCode) {
      query = query.eq('language_code', languageCode)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching product translations:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get products with translations
   */
  static async getProductsWithTranslations(
    languageCode?: LanguageCode
  ): Promise<ProductWithTranslations[]> {
    const { data, error } = await supabase
      .from('products_with_translations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products with translations:', error)
      throw error
    }

    return (data || []).map(product => {
      const translations = Array.isArray(product.translations)
        ? (product.translations as unknown as ProductTranslation[])
        : []

      return {
        ...product,
        translations,
        currentTranslation: languageCode && translations.length > 0
          ? translations.find((t: ProductTranslation) => t.language_code === languageCode)
          : undefined
      }
    })
  }

  /**
   * Create a new product translation
   */
  static async createProductTranslation(
    translation: ProductTranslationInsert
  ): Promise<TranslationOperationResult> {
    try {
      const { data, error } = await supabase
        .from('products_translations')
        .insert(translation)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          message: 'Failed to create product translation',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Product translation created successfully',
        translation: data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create product translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update a product translation
   */
  static async updateProductTranslation(
    id: string,
    translation: ProductTranslationUpdate
  ): Promise<TranslationOperationResult> {
    try {
      const { data, error } = await supabase
        .from('products_translations')
        .update({
          ...translation,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          message: 'Failed to update product translation',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Product translation updated successfully',
        translation: data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update product translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete a product translation
   */
  static async deleteProductTranslation(id: string): Promise<TranslationOperationResult> {
    try {
      const { error } = await supabase
        .from('products_translations')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          success: false,
          message: 'Failed to delete product translation',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Product translation deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete product translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ==========================================
  // BROKERS TRANSLATIONS
  // ==========================================

  /**
   * Get all translations for a broker
   */
  static async getBrokerTranslations(
    brokerId: string,
    languageCode?: LanguageCode
  ): Promise<BrokerTranslation[]> {
    let query = supabase
      .from('brokers_translations')
      .select('*')
      .eq('broker_id', brokerId)
      .order('language_code')

    if (languageCode) {
      query = query.eq('language_code', languageCode)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching broker translations:', error)
      throw error
    }

    return data || []
  }

  /**
   * Get brokers with translations
   */
  static async getBrokersWithTranslations(
    languageCode?: LanguageCode
  ): Promise<BrokerWithTranslations[]> {
    const { data, error } = await supabase
      .from('brokers_with_translations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching brokers with translations:', error)
      throw error
    }

    return (data || []).map(broker => {
      const translations = Array.isArray(broker.translations)
        ? (broker.translations as unknown as BrokerTranslation[])
        : []

      return {
        ...broker,
        translations,
        currentTranslation: languageCode && translations.length > 0
          ? translations.find((t: BrokerTranslation) => t.language_code === languageCode)
          : undefined
      }
    })
  }

  /**
   * Create a new broker translation
   */
  static async createBrokerTranslation(
    translation: BrokerTranslationInsert
  ): Promise<TranslationOperationResult> {
    try {
      const { data, error } = await supabase
        .from('brokers_translations')
        .insert(translation)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          message: 'Failed to create broker translation',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Broker translation created successfully',
        translation: data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create broker translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update a broker translation
   */
  static async updateBrokerTranslation(
    id: string,
    translation: BrokerTranslationUpdate
  ): Promise<TranslationOperationResult> {
    try {
      const { data, error } = await supabase
        .from('brokers_translations')
        .update({
          ...translation,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return {
          success: false,
          message: 'Failed to update broker translation',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Broker translation updated successfully',
        translation: data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update broker translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete a broker translation
   */
  static async deleteBrokerTranslation(id: string): Promise<TranslationOperationResult> {
    try {
      const { error } = await supabase
        .from('brokers_translations')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          success: false,
          message: 'Failed to delete broker translation',
          error: error.message
        }
      }

      return {
        success: true,
        message: 'Broker translation deleted successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete broker translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ==========================================
  // GENERIC HELPERS
  // ==========================================

  /**
   * Get translations for any content type
   */
  static async getTranslations(
    contentType: TranslatableContentType,
    contentId: string,
    languageCode?: LanguageCode
  ): Promise<Translation[]> {
    switch (contentType) {
      case 'posts':
        return await this.getPostTranslations(contentId, languageCode)
      case 'products':
        return await this.getProductTranslations(contentId, languageCode)
      case 'brokers':
        return await this.getBrokerTranslations(contentId, languageCode)
      default:
        throw new Error(`Unsupported content type: ${contentType}`)
    }
  }

  /**
   * Check if translation exists
   */
     static async translationExists(
     contentType: TranslatableContentType,
     contentId: string,
     languageCode: LanguageCode
   ): Promise<boolean> {
     try {
       const contentIdField = contentType === 'posts' ? 'post_id' :
                             contentType === 'products' ? 'product_id' : 'broker_id'

       let query
       if (contentType === 'posts') {
         query = supabase
           .from('posts_translations')
           .select('id')
           .eq(contentIdField, contentId)
           .eq('language_code', languageCode)
       } else if (contentType === 'products') {
         query = supabase
           .from('products_translations')
           .select('id')
           .eq(contentIdField, contentId)
           .eq('language_code', languageCode)
       } else {
         query = supabase
           .from('brokers_translations')
           .select('id')
           .eq(contentIdField, contentId)
           .eq('language_code', languageCode)
       }

       const { data, error } = await query.single()

       if (error && error.code !== 'PGRST116') {
         console.error('Error checking translation existence:', error)
         return false
       }

       return !!data
     } catch (error) {
       console.error('Error checking translation existence:', error)
       return false
     }
   }

  /**
   * Bulk delete translations
   */
  static async bulkDeleteTranslations(
    contentType: TranslatableContentType,
    contentIds: string[],
    languageCode?: LanguageCode
  ): Promise<{ success: boolean; deletedCount: number; errors: string[] }> {
    const contentIdField = contentType === 'posts' ? 'post_id' :
                          contentType === 'products' ? 'product_id' : 'broker_id'

    try {
      let query
      if (contentType === 'posts') {
        query = supabase
          .from('posts_translations')
          .delete()
          .in(contentIdField, contentIds)
      } else if (contentType === 'products') {
        query = supabase
          .from('products_translations')
          .delete()
          .in(contentIdField, contentIds)
      } else {
        query = supabase
          .from('brokers_translations')
          .delete()
          .in(contentIdField, contentIds)
      }

      if (languageCode) {
        query = query.eq('language_code', languageCode)
      }

      const { error, count } = await query

      if (error) {
        return {
          success: false,
          deletedCount: 0,
          errors: [error.message]
        }
      }

      return {
        success: true,
        deletedCount: count || 0,
        errors: []
      }
    } catch (error) {
      return {
        success: false,
        deletedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Get translation statistics
   */
  static async getTranslationStatistics(
    contentType: TranslatableContentType
  ): Promise<{
    totalContent: number
    totalTranslations: number
    translationsByLanguage: Record<string, number>
    completenessPercentage: number
  }> {
         try {
       // Get total content count
      let totalContentQuery
      if (contentType === 'posts') {
        totalContentQuery = supabase.from('posts').select('*', { count: 'exact', head: true })
      } else if (contentType === 'products') {
        totalContentQuery = supabase.from('products').select('*', { count: 'exact', head: true })
      } else {
        totalContentQuery = supabase.from('brokers').select('*', { count: 'exact', head: true })
      }

      const { count: totalContent } = await totalContentQuery

      // Get total translations count
      let totalTranslationsQuery
      if (contentType === 'posts') {
        totalTranslationsQuery = supabase.from('posts_translations').select('*', { count: 'exact', head: true })
      } else if (contentType === 'products') {
        totalTranslationsQuery = supabase.from('products_translations').select('*', { count: 'exact', head: true })
      } else {
        totalTranslationsQuery = supabase.from('brokers_translations').select('*', { count: 'exact', head: true })
      }

      const { count: totalTranslations } = await totalTranslationsQuery

      // Get translations by language
      let translationsByLangQuery
      if (contentType === 'posts') {
        translationsByLangQuery = supabase.from('posts_translations').select('language_code')
      } else if (contentType === 'products') {
        translationsByLangQuery = supabase.from('products_translations').select('language_code')
      } else {
        translationsByLangQuery = supabase.from('brokers_translations').select('language_code')
      }

      const { data: translationsByLang } = await translationsByLangQuery

      const translationsByLanguage = (translationsByLang || []).reduce(
        (acc: Record<string, number>, item: { language_code: string }) => {
          acc[item.language_code] = (acc[item.language_code] || 0) + 1
          return acc
        },
        {}
      )

      // Calculate completeness percentage
      const completenessPercentage = totalContent && totalContent > 0
        ? Math.round(((totalTranslations || 0) / (totalContent * 2)) * 100) // Assuming 2 languages (en, pt)
        : 0

      return {
        totalContent: totalContent || 0,
        totalTranslations: totalTranslations || 0,
        translationsByLanguage,
        completenessPercentage
      }
    } catch (error) {
      console.error('Error getting translation statistics:', error)
      return {
        totalContent: 0,
        totalTranslations: 0,
        translationsByLanguage: {},
        completenessPercentage: 0
      }
    }
  }
}
