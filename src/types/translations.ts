import type { Database } from './database'

/**
 * Base interface for all translation records
 */
export interface TranslationBase {
  id: string
  language_code: string
  created_at: string
  updated_at: string
}

/**
 * Language codes supported by the application
 */
export type LanguageCode = 'en' | 'pt'

/**
 * Content types that support translations
 */
export type TranslatableContentType = 'posts' | 'products' | 'brokers'

/**
 * Post translation interface
 */
export interface PostTranslation extends TranslationBase {
  post_id: string
  title: string
  excerpt?: string | null
  content?: string | null
  reading_time: number
}

/**
 * Product translation interface
 */
export interface ProductTranslation extends TranslationBase {
  product_id: string
  name: string
  description?: string | null
}

/**
 * Broker translation interface
 */
export interface BrokerTranslation extends TranslationBase {
  broker_id: string
  description?: string | null
}

/**
 * Union type for all translation types
 */
export type Translation = PostTranslation | ProductTranslation | BrokerTranslation

/**
 * Translation insert types for database operations
 */
export interface PostTranslationInsert {
  post_id: string
  language_code: LanguageCode
  title: string
  excerpt?: string
  content?: string
  reading_time?: number
}

export interface ProductTranslationInsert {
  product_id: string
  language_code: LanguageCode
  name: string
  description?: string
}

export interface BrokerTranslationInsert {
  broker_id: string
  language_code: LanguageCode
  description?: string
}

/**
 * Translation update types for database operations
 */
export interface PostTranslationUpdate {
  title?: string
  excerpt?: string
  content?: string
  reading_time?: number
}

export interface ProductTranslationUpdate {
  name?: string
  description?: string
}

export interface BrokerTranslationUpdate {
  description?: string
}

/**
 * Database row types (aliases for cleaner interface extension)
 */
export type PostRow = Database['public']['Tables']['posts']['Row']
export type ProductRow = Database['public']['Tables']['products']['Row']
export type BrokerRow = Database['public']['Tables']['brokers']['Row']

/**
 * Enhanced content types that include translations
 */
export interface PostWithTranslations extends PostRow {
  translations: PostTranslation[]
  currentTranslation?: PostTranslation | undefined
}

export interface ProductWithTranslations extends ProductRow {
  translations: ProductTranslation[]
  currentTranslation?: ProductTranslation | undefined
}

export interface BrokerWithTranslations extends BrokerRow {
  translations: BrokerTranslation[]
  currentTranslation?: BrokerTranslation | undefined
}

/**
 * Translation status interface
 */
export interface TranslationStatus {
  languageCode: LanguageCode
  hasTranslation: boolean
  isComplete: boolean
  lastUpdated?: string | undefined
}

/**
 * Translation completeness info
 */
export interface TranslationCompleteness {
  total: number
  completed: number
  missing: LanguageCode[]
  percentage: number
}

/**
 * Translation form data interface
 */
export interface TranslationFormData {
  languageCode: LanguageCode
  fields: Record<string, string>
}

/**
 * Translation validation result
 */
export interface TranslationValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

/**
 * Translation operation result
 */
export interface TranslationOperationResult {
  success: boolean
  message: string
  translation?: Translation
  error?: string
}

/**
 * Translation bulk operation interface
 */
export interface TranslationBulkOperation {
  contentType: TranslatableContentType
  contentIds: string[]
  sourceLanguage: LanguageCode
  targetLanguage: LanguageCode
  operation: 'copy' | 'delete' | 'validate'
}

/**
 * Translation bulk result
 */
export interface TranslationBulkResult {
  success: boolean
  processed: number
  failed: number
  errors: Record<string, string>
  results: TranslationOperationResult[]
}

/**
 * Language metadata interface
 */
export interface LanguageMetadata {
  code: LanguageCode
  name: string
  nativeName: string
  flag: string
  isDefault: boolean
  isEnabled: boolean
}

/**
 * Translation context for React components
 */
export interface TranslationContext {
  currentLanguage: LanguageCode
  availableLanguages: LanguageCode[]
  translations: Translation[]
  loading: boolean
  error?: string
  setCurrentLanguage: (language: LanguageCode) => void
  getTranslation: (language: LanguageCode) => Translation | undefined
  createTranslation: (translation: TranslationFormData) => Promise<TranslationOperationResult>
  updateTranslation: (id: string, translation: TranslationFormData) => Promise<TranslationOperationResult>
  deleteTranslation: (id: string) => Promise<TranslationOperationResult>
  hasTranslation: (language: LanguageCode) => boolean
  getTranslationStatus: (language: LanguageCode) => TranslationStatus
  getCompleteness: () => TranslationCompleteness
}

/**
 * Translation hooks return types
 */
export interface UseTranslationResult {
  translations: Translation[]
  currentTranslation?: Translation | undefined
  loading: boolean
  error?: string | undefined
  createTranslation: (translation: TranslationFormData) => Promise<TranslationOperationResult>
  updateTranslation: (id: string, translation: TranslationFormData) => Promise<TranslationOperationResult>
  deleteTranslation: (id: string) => Promise<TranslationOperationResult>
  setCurrentLanguage: (language: LanguageCode) => void
  getTranslationStatus: () => TranslationStatus[]
  getCompleteness: () => TranslationCompleteness
}

/**
 * Translation manager props
 */
export interface TranslationManagerProps {
  contentType: TranslatableContentType
  contentId: string
  defaultLanguage?: LanguageCode
  requiredLanguages?: LanguageCode[]
  onTranslationChange?: (translation: Translation) => void
  onLanguageChange?: (language: LanguageCode) => void
  className?: string
}

/**
 * Translation field props
 */
export interface TranslationFieldProps {
  label: string
  name: string
  type: 'text' | 'textarea' | 'richtext'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  maxLength?: number
  rows?: number
  error?: string
  className?: string
}

/**
 * Translation utility functions return types
 */
export interface TranslatedFieldResult {
  value: string
  language: LanguageCode
  isFallback: boolean
  isOriginal: boolean
}

/**
 * Translation export/import types
 */
export interface TranslationExportData {
  contentType: TranslatableContentType
  contentId: string
  contentTitle: string
  translations: Record<LanguageCode, Record<string, string>>
  metadata: {
    exportedAt: string
    exportedBy: string
    version: string
  }
}

export interface TranslationImportData {
  contentType: TranslatableContentType
  translations: Array<{
    contentId: string
    languageCode: LanguageCode
    fields: Record<string, string>
  }>
  metadata?: {
    importedAt: string
    importedBy: string
    version: string
  }
}

/**
 * Translation search and filter types
 */
export interface TranslationSearchParams {
  query?: string
  contentType?: TranslatableContentType
  languageCode?: LanguageCode
  hasTranslation?: boolean
  isComplete?: boolean
  lastUpdatedAfter?: string
  lastUpdatedBefore?: string
}

export interface TranslationSearchResult {
  content: PostWithTranslations | ProductWithTranslations | BrokerWithTranslations
  translations: Translation[]
  completeness: TranslationCompleteness
  relevance: number
}
