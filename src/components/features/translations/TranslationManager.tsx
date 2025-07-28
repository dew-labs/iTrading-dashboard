import React, { useState, useEffect, useMemo } from 'react'
import { Languages, Plus, Edit2, Trash2, Save, X, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Button, Input, Textarea } from '../../atoms'
import { ConfirmDialog } from '../../common'
import RichTextEditor from '../posts/RichTextEditor'
import { useContentTranslation } from '../../../hooks/useContentTranslation'
import { useTranslation } from '../../../hooks/useTranslation'
import { cn } from '../../../utils/theme'
import { LANGUAGE_INFO, SUPPORTED_LANGUAGE_CODES } from '../../../constants/languages'
import { calculateReadingTime } from '../../../utils/textUtils'
import type {
  LanguageCode,
  Translation,
  TranslationFormData,
  TranslationManagerProps
} from '../../../types/translations'
import { getTranslatableFields, getRequiredFields } from '../../../utils/translationUtils'

/**
 * Translation Manager Component
 * Provides a comprehensive interface for managing translations
 */
const TranslationManager: React.FC<TranslationManagerProps> = ({
  contentType,
  contentId,
  defaultLanguage = 'en',
  requiredLanguages = SUPPORTED_LANGUAGE_CODES,
  onTranslationChange,
  onLanguageChange,
  className = ''
}) => {
  const { t } = useTranslation()
  const { t: tCommon } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(defaultLanguage)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [readingTime, setReadingTime] = useState<number>(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get translations for the content
  const {
    translations,
    loading,
    error,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    getTranslationStatus
  } = useContentTranslation(contentType, contentId, {
    defaultLanguage,
    requiredLanguages
  })

  // Get translatable fields for the content type - memoized to prevent infinite loops
  const translatableFields = useMemo(() => getTranslatableFields(contentType), [contentType])
  const requiredFields = useMemo(() => getRequiredFields(contentType), [contentType])

  // Get translation status
  const translationStatus = getTranslationStatus()

  // Find current translation for selected language - memoized to prevent infinite loops
  const currentTranslationForLanguage = useMemo(() =>
    translations.find(t => t.language_code === selectedLanguage),
    [translations, selectedLanguage]
  )

  // Helper function to get field value from translation
  const getFieldValue = (translation: Translation, field: string): string => {
    if (field in translation) {
      const value = (translation as unknown as Record<string, unknown>)[field]
      return typeof value === 'string' ? value : ''
    }
    return ''
  }

  // Initialize form data when language changes
  useEffect(() => {
    if (currentTranslationForLanguage) {
      const initialData: Record<string, string> = {}
      translatableFields.forEach(field => {
        initialData[field] = getFieldValue(currentTranslationForLanguage, field)
      })
      setFormData(initialData)

      // Initialize reading time from translation (for posts)
      if (contentType === 'posts' && 'reading_time' in currentTranslationForLanguage) {
        const translationWithReadingTime = currentTranslationForLanguage as Translation & { reading_time?: number }
        setReadingTime(translationWithReadingTime.reading_time || 1)
      }
    } else {
      // Reset form for new translation
      const emptyData: Record<string, string> = {}
      translatableFields.forEach(field => {
        emptyData[field] = ''
      })
      setFormData(emptyData)
      setReadingTime(1)
    }
    setErrors({})
  }, [selectedLanguage, currentTranslationForLanguage, translatableFields, contentType])

  // Handle language change
  const handleLanguageChange = (language: LanguageCode) => {
    setSelectedLanguage(language)
    setIsEditing(false)
    setErrors({})
    onLanguageChange?.(language)
  }

  // Handle form field change
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Calculate reading time for posts when content changes
    if (contentType === 'posts' && field === 'content') {
      const newReadingTime = calculateReadingTime(value)
      setReadingTime(newReadingTime)
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = t('validation.fieldIsRequired', { field })
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save translation
  const handleSave = async () => {
    if (!validateForm()) return

    const translationData: TranslationFormData = {
      languageCode: selectedLanguage,
      fields: {
        ...formData,
        // Include reading time for posts
        ...(contentType === 'posts' && { reading_time: readingTime.toString() })
      }
    }

    try {
      let result
      if (currentTranslationForLanguage) {
        // Update existing translation
        result = await updateTranslation(currentTranslationForLanguage.id, translationData)
      } else {
        // Create new translation
        result = await createTranslation(translationData)
      }

      if (result.success) {
        setIsEditing(false)
        onTranslationChange?.(result.translation as Translation)
      }
    } catch (error) {
      console.error('Failed to save translation:', error)
    }
  }

  // Handle delete translation
  const handleDelete = () => {
    if (!currentTranslationForLanguage) return
    setShowDeleteDialog(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!currentTranslationForLanguage) return

    setIsDeleting(true)
    try {
      const result = await deleteTranslation(currentTranslationForLanguage.id)
      if (result.success) {
        setIsEditing(false)
        setFormData({})
        setShowDeleteDialog(false)
      }
    } catch (error) {
      console.error('Failed to delete translation:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle start editing
  const handleEdit = () => {
    setIsEditing(true)
  }

  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false)
    setErrors({})

    // Reset form data
    if (currentTranslationForLanguage) {
      const resetData: Record<string, string> = {}
      translatableFields.forEach(field => {
        resetData[field] = getFieldValue(currentTranslationForLanguage, field)
      })
      setFormData(resetData)
    }
  }

  // Determine the current UI state
  const uiState = useMemo(() => {
    if (loading) return 'loading'
    if (error) return 'error'
    if (isEditing) return 'editing'
    if (currentTranslationForLanguage) return 'viewing'
    return 'empty'
  }, [loading, error, isEditing, currentTranslationForLanguage])

  // Render field input based on type
  const renderField = (field: string, value: string) => {
    const isRequired = requiredFields.includes(field)
    const hasError = !!errors[field]
    const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1)
    const isReadOnly = !isEditing

    // Use RichTextEditor for content fields and broker descriptions
    if (field === 'content' || (field === 'description' && contentType === 'brokers')) {
      return (
        <div className="space-y-3">
          <RichTextEditor
            content={value}
            onChange={(content: string) => handleFieldChange(field, content)}
            label={fieldLabel}
            placeholder={t('placeholders.enterFieldInLanguage', {
              field: fieldLabel.toLowerCase(),
              language: LANGUAGE_INFO[selectedLanguage].nativeName
            })}
            height={300}
            disabled={isReadOnly}
            required={isRequired}
            bucket={contentType === 'brokers' ? 'brokers' : 'posts'}
            folder={contentType === 'brokers' ? 'images' : 'images'}
            {...(errors[field] && { error: errors[field] })}
            className={cn(
              hasError && 'border-red-500',
              isReadOnly && 'opacity-60'
            )}
          />
          {/* Reading time display for posts */}
          {contentType === 'posts' && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{tCommon('content.readingTime')}: <span className="font-medium text-gray-900 dark:text-white">{readingTime} {tCommon('content.min')}</span></span>
            </div>
          )}
        </div>
      )
    }

    // Use textarea for excerpt and other longer text fields (but not broker descriptions)
    if (field === 'excerpt' || (field === 'description' && contentType !== 'brokers')) {
      return (
        <Textarea
          label={fieldLabel}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange(field, e.target.value)}
          rows={4}
          placeholder={t('placeholders.enterFieldInLanguage', {
            field: fieldLabel.toLowerCase(),
            language: LANGUAGE_INFO[selectedLanguage].nativeName
          })}
          disabled={isReadOnly}
          required={isRequired}
          {...(errors[field] && { error: errors[field] })}
          className={cn(
            'w-full',
            hasError && 'border-red-500 focus:border-red-500',
            isReadOnly && 'opacity-60 bg-gray-50 dark:bg-gray-800/50'
          )}
        />
      )
    }

    // Use regular input for short fields
    return (
      <Input
        label={fieldLabel}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field, e.target.value)}
        placeholder={t('placeholders.enterFieldInLanguage', {
          field: fieldLabel.toLowerCase(),
          language: LANGUAGE_INFO[selectedLanguage].nativeName
        })}
        disabled={isReadOnly}
        required={isRequired}
        {...(errors[field] && { error: errors[field] })}
        className={cn(
          'w-full',
          hasError && 'border-red-500 focus:border-red-500',
          isReadOnly && 'opacity-60 bg-gray-50 dark:bg-gray-800/50'
        )}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">{t('messages.loadingTranslations')}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">{t('messages.translationError')}</h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{t('messages.errorLoadingTranslations')}: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Render translation status in header using portal
  const translationStatusContainer = document.getElementById('translation-status-container')

  return (
    <div className={cn('space-y-6', className)}>
      {/* Render clickable language badges in header */}
      {translationStatusContainer && createPortal(
        <div className="flex flex-wrap gap-2">
          {translationStatus.map(status => (
            <button
              type="button"
              key={status.languageCode}
              onClick={() => handleLanguageChange(status.languageCode)}
              className={cn(
                'flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105',
                status.languageCode === selectedLanguage
                  ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-500 ring-opacity-50'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
              title={t('translations.switchToLanguage', { language: LANGUAGE_INFO[status.languageCode].nativeName })}
            >
              <span>{LANGUAGE_INFO[status.languageCode].flag}</span>
              <span className="font-medium">{LANGUAGE_INFO[status.languageCode].nativeName}</span>
              <div className="flex items-center">
                {status.hasTranslation && status.isComplete ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : status.hasTranslation ? (
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
              </div>
            </button>
          ))}
        </div>,
        translationStatusContainer
      )}

      {/* Edit/Delete Actions (only show when not editing) */}
      {!isEditing && currentTranslationForLanguage && (
        <div className="flex items-center justify-end gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={Edit2}
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
                            {tCommon('actions.edit')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={Trash2}
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
                            {tCommon('actions.delete')}
          </Button>
        </div>
      )}

      {currentTranslationForLanguage || isEditing ? (
        <div className={cn(
          'space-y-6 transition-opacity duration-200',
          uiState === 'viewing' && 'opacity-75'
        )}>
          {translatableFields.map(field => (
            <div key={field}>
              {renderField(field, formData[field] || '')}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <Languages className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('translations.noTranslationTitle', { language: LANGUAGE_INFO[selectedLanguage].nativeName })}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('translations.noTranslationMessage', { language: LANGUAGE_INFO[selectedLanguage].nativeName })}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={Plus}
            onClick={handleEdit}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            {t('translations.createTranslation', { language: LANGUAGE_INFO[selectedLanguage].nativeName })}
          </Button>
        </div>
      )}

      {/* Save/Cancel Actions (only show when editing) */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            leftIcon={X}
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {tCommon('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={Save}
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {tCommon('actions.save')}
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={t('translations.deleteTranslation')}
        message={
          <div className="space-y-2">
            <p>{t('translations.deleteTranslationConfirm', { language: LANGUAGE_INFO[selectedLanguage].nativeName })}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('translations.deleteTranslationWarning')}
            </p>
          </div>
        }
        confirmLabel={t('translations.deleteTranslation')}
        cancelLabel={tCommon('actions.cancel')}
        isDestructive={true}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}

export default TranslationManager
