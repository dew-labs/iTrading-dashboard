import React, { useMemo, useCallback, useState } from 'react'
import { FileText, Calendar, Scale, Lock, CheckCircle, Save, X, Plus, Languages, Edit2, PenTool } from 'lucide-react'
import type { PostInsert, Image } from '../../../types'
import type { PostWithAuthor } from '../../../hooks/usePosts'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import { useImageValidation } from '../../../hooks/useImageValidation'
import { Button } from '../../atoms'
import { Select, FormContainer, FormErrorBanner } from '../../molecules'
import { MainImageUpload } from '../images'
import { supabase } from '../../../lib/supabase'
import type { UploadResult } from '../../../hooks/useFileUpload'
import TranslationManager from '../translations/TranslationManager'
import { CONTENT_LANGUAGE_CODES } from '../../../constants/languages'
import type { LanguageCode } from '../../../types/translations'
import { VALIDATION } from '../../../constants/ui'
import { FORM_OPTIONS } from '../../../constants/components'

// Move schema outside component to prevent re-renders
const POST_FORM_SCHEMA = {
  // Only non-translatable fields need validation here
  // title, excerpt, content are now handled in translations
  views: {
    min: VALIDATION.PRICE_MIN // Using PRICE_MIN (0) for views as it should be non-negative
  }
} as const

interface PostFormProps {
  post?: PostWithAuthor | null
  onSubmit: (
    data: PostInsert,
    thumbnailImage?: (Partial<Image> & { file?: File }) | null
  ) => void
  onCancel: () => void
  images?: Image[] | null
}

// Reading time is now calculated from content in translations

const PostForm: React.FC<PostFormProps> = ({ post, onSubmit, onCancel, images }) => {
  const { t: tForm } = useFormTranslation()
  const { t: tCommon } = useTranslation()
  const [_currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en')

  const [thumbnailImage, setThumbnailImage] = useState<
    (Partial<Image> & { publicUrl?: string; file?: File }) | null
  >(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Validate thumbnail image URL
  const { isValid: isThumbnailValid } = useImageValidation(thumbnailImage?.publicUrl)

  // Memoize initial data to prevent re-renders (only non-translatable fields)
  const initialData = useMemo(() => ({
    type: 'news' as PostWithAuthor['type'],
    status: 'draft' as PostWithAuthor['status'],
    author_id: null as string | null,
    views: 0
  }), [])

  // Enhanced form validation with our new hook
  const {
    data: formData,
    errors: _errors,
    isValidating,
    updateField,
    handleBlur: _handleBlur,
    handleChange: _handleChange,
    handleSubmit,
    reset
  } = useFormValidation({
    schema: POST_FORM_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  React.useEffect(() => {
    if (post) {
      reset({
        type: post.type,
        status: post.status,
        author_id: post.author_id,
        views: post.views || 0
      })

      const existingThumbnail = images?.find(
        img => img.record_id === post.id && img.type === 'thumbnail'
      )
      if (existingThumbnail?.path) {
        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(existingThumbnail.path)

        // Only set the thumbnail if we have a valid path and URL
        if (urlData.publicUrl) {
          setThumbnailImage({ ...existingThumbnail, publicUrl: urlData.publicUrl })
        } else {
          setThumbnailImage(null)
        }
      } else {
        setThumbnailImage(null)
      }
    } else {
      reset(initialData)
      setThumbnailImage(null)
    }
  }, [post, reset, images, initialData])

  const handleThumbnailUpload = useCallback(
    (uploadResult: UploadResult | null, file?: File) => {
      if (uploadResult && file) {
        const { url: publicUrl, path, id: storageObjectId } = uploadResult
        setThumbnailImage(prev => ({
          ...prev,
          path,
          publicUrl,
          storage_object_id: storageObjectId,
          table_name: 'posts',
          record_id: post?.id || '',
          type: 'thumbnail',
          alt_text: `Post thumbnail`,
          file_size: file.size,
          mime_type: file.type,
          file
        }))
      } else {
        setThumbnailImage(null)
      }
    },
    [post?.id]
  )

  // Create type options with Badge component icons
  const typeOptions = useMemo(() =>
    FORM_OPTIONS.postType.map(option => ({
      value: option.value,
      label: tCommon(`content.${option.labelKey}`),
      icon: option.icon === 'FileText' ? <FileText className='w-4 h-4' /> :
            option.icon === 'Calendar' ? <Calendar className='w-4 h-4' /> :
            option.icon === 'Scale' ? <Scale className='w-4 h-4' /> : <Lock className='w-4 h-4' />
    })), [tCommon])

  // Create status options with Badge component icons
  const statusOptions = useMemo(() =>
    FORM_OPTIONS.postStatus.map(option => ({
      value: option.value,
      label: tCommon(`status.${option.labelKey}`),
      icon: option.icon === 'PenTool' ? <PenTool className='w-4 h-4' /> : <CheckCircle className='w-4 h-4' />
    })), [tCommon])

  const handleFormSubmit = useCallback(async (data: typeof formData) => {
    setSubmitError(null) // Clear any existing errors
    
    try {
      await onSubmit(
        data as PostInsert,
        thumbnailImage
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while saving the post'
      setSubmitError(errorMessage)
    }
  }, [onSubmit, thumbnailImage])

  return (
    <FormContainer>
      {/* Display form error if any */}
      <FormErrorBanner 
        error={submitError} 
        onDismiss={() => setSubmitError(null)}
        className='mb-6'
      />

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Left Sidebar - Settings & Media */}
        <div className="xl:col-span-1 space-y-6">

          {/* Post Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.postSettings')}</h3>
            </div>

            <div className="space-y-4">
              {/* Type Selection */}
              <Select
                label={tForm('labels.type')}
                required
                value={formData.type || 'news'}
                onChange={value => updateField('type', value as PostWithAuthor['type'])}
                options={typeOptions}
                disabled={isValidating}
              />

              {/* Status Selection */}
              <Select
                label={tForm('labels.status')}
                required
                value={formData.status || 'draft'}
                onChange={value => updateField('status', value as PostWithAuthor['status'])}
                options={statusOptions}
                disabled={isValidating}
              />


            </div>
          </div>

          {/* Thumbnail Upload Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.thumbnailImage')}</h3>
            </div>

            <MainImageUpload
              label=""
              imageUrl={isThumbnailValid ? (thumbnailImage?.publicUrl || thumbnailImage?.path || null) : null}
              onChange={handleThumbnailUpload}
              bucket="posts"
              folder="thumbnails"
              size="lg"
              disabled={isValidating}
              recommendationText={tForm('hints.thumbnailRecommendation')}
              alt={tCommon('accessibility.postThumbnail')}
            />
          </div>
        </div>

        {/* Right Main Content - Translations */}
        <div className="xl:col-span-3 space-y-6">

          {/* Content & Translations Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.contentAndTranslations')}</h3>
                </div>
                {post && (
                  <div id="translation-status-container" className="flex items-center">
                    {/* Translation status will be rendered here by TranslationManager */}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {post ? (
                <TranslationManager
                  contentType="posts"
                  contentId={post.id}
                  defaultLanguage="en"
                  requiredLanguages={CONTENT_LANGUAGE_CODES}
                  onLanguageChange={setCurrentLanguage}
                  className="border-0 p-0 bg-transparent"
                />
              ) : (
                <div className="text-center py-20 px-6">
                  <div className="relative">
                    {/* Visual indicator */}
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full">
                      <Languages className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Main heading */}
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {tCommon('content.contentTranslationManagement')}
                    </h4>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                      {tCommon('content.contentEditorDescription', { type: 'post' })}
                    </p>

                    {/* Features preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Edit2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{tCommon('content.richContentEditor')}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tCommon('content.titleExcerptContent')}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{tCommon('content.multiLanguageSupport')}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tCommon('content.englishAndPortuguese')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Call to action */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-center space-x-2 text-blue-800 dark:text-blue-200">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{tCommon('content.completeSettingsToEnableEditing', { type: 'post' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          leftIcon={X}
          disabled={isValidating}
          className="px-6"
        >
          {tCommon('actions.cancel')}
        </Button>

        <Button
          type="submit"
          variant="primary"
          loading={isValidating}
          loadingText={post ? tCommon('feedback.updating') : tCommon('feedback.creating')}
          leftIcon={post ? Save : Plus}
          className="px-8"
          {...(submitError && { 'aria-describedby': 'form-error-description' })}
        >
          {post ? `${tCommon('actions.update')} ${tCommon('entities.post')}` : `${tCommon('actions.create')} ${tCommon('entities.post')}`}
        </Button>
      </div>
      </form>
    </FormContainer>
  )
}

export default PostForm
