import React, { useMemo, useCallback, useState } from 'react'
import { X, Save, Plus, Building2, Calendar, MapPin, Languages } from 'lucide-react'
import type { Broker, BrokerInsert, Image } from '../../../types'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField } from '../../atoms'
import { MainImageUpload } from '../images'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import { supabase } from '../../../lib/supabase'
import type { UploadResult } from '../../../hooks/useFileUpload'
import TranslationManager from '../translations/TranslationManager'
import { SUPPORTED_LANGUAGE_CODES } from '../../../constants/languages'
import type { LanguageCode } from '../../../types/translations'

// Move schema outside component to prevent re-renders
// Only description is handled in translations now
const BROKER_FORM_SCHEMA = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Broker name must be between 2 and 100 characters'
  },
  headquarter: {
    maxLength: 100,
    message: 'Headquarter must be less than 100 characters'
  },
  established_in: {
    min: 1800,
    max: new Date().getFullYear(),
    custom: (value: number | null) => !value || (value >= 1800 && value <= new Date().getFullYear()),
    message: 'Please enter a valid year between 1800 and current year'
  }
} as const

interface BrokerFormProps {
  broker?: Broker | null
  onSubmit: (data: BrokerInsert, logoImage?: (Partial<Image> & { file?: File }) | null) => void
  onCancel: () => void
  images?: Image[] | null
}

const BrokerForm: React.FC<BrokerFormProps> = ({ broker, onSubmit, onCancel, images }) => {
  const { t: tForm } = useFormTranslation()
  const { t } = useTranslation()
  const [_currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en')

  const [logoImage, setLogoImage] = useState<
    (Partial<Image> & { publicUrl?: string; file?: File }) | null
  >(null)

  // Memoize initial data to prevent re-renders (description is handled in translations)
  const initialData = useMemo(() => ({
    name: '',
    headquarter: '',
    established_in: null as number | null,
    is_visible: true
  }), [])

  // Enhanced form validation with our new hook
  const {
    data: formData,
    errors,
    isValidating,
    updateField,
    handleBlur,
    handleChange,
    handleSubmit,
    reset
  } = useFormValidation({
    schema: BROKER_FORM_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  React.useEffect(() => {
    if (broker) {
      reset({
        name: broker.name,
        headquarter: broker.headquarter || '',
        established_in: broker.established_in || null,
        is_visible: broker.is_visible !== false
      })
      const existingLogo = images?.find(
        img => img.record_id === broker.id && img.type === 'logo'
      )
      if (existingLogo) {
        const { data: urlData } = supabase.storage
          .from('brokers')
          .getPublicUrl(existingLogo.path)
        setLogoImage({ ...existingLogo, publicUrl: urlData.publicUrl })
      } else {
        setLogoImage(null)
      }
    } else {
      reset(initialData)
      setLogoImage(null)
    }
  }, [broker, reset, images, initialData])

  const handleLogoUpload = useCallback(
    (uploadResult: UploadResult | null, file?: File) => {
      if (uploadResult && file) {
        const { url: publicUrl, path, id: storageObjectId } = uploadResult
        setLogoImage(prev => ({
          ...prev,
          path,
          publicUrl,
          storage_object_id: storageObjectId,
          table_name: 'brokers',
          record_id: broker?.id || '',
          type: 'logo',
          alt_text: `${broker?.name || 'Broker'} logo`,
          file_size: file.size,
          mime_type: file.type,
          file
        }))
      } else {
        setLogoImage(null)
      }
    },
    [broker?.id, broker?.name]
  )

  const handleEstablishedYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateField('established_in', value ? parseInt(value) : null)
  }, [updateField])

  const handleFormSubmit = useCallback((data: typeof formData) => {
    // Description is now handled by the translation system
    const brokerData: BrokerInsert = {
      ...data
    }
    onSubmit(brokerData, logoImage)
  }, [onSubmit, logoImage])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      {/* Enhanced layout for better organization */}
      <div className='grid grid-cols-1 xl:grid-cols-4 gap-6'>
        {/* Left column - Logo and basic info */}
        <div className='xl:col-span-1 space-y-6'>
          {/* Logo upload section */}
          <div>
            <MainImageUpload
              label={tForm('labels.logo')}
              imageUrl={logoImage?.publicUrl || logoImage?.path || null}
              onChange={handleLogoUpload}
              bucket='brokers'
              folder='logos'
              size='lg'
              disabled={isValidating}
              recommendationText={tForm('hints.logoRecommendation')}
              alt='Broker logo'
            />
          </div>

          {/* Basic info fields using enhanced FormField components */}
          <div className='space-y-4'>
            <FormField
              label={tForm('labels.name')}
              name='name'
              value={formData.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              placeholder={tForm('placeholders.enterBrokerName')}
              required
              disabled={isValidating}
              {...(errors.name && { error: errors.name })}
              icon={<Building2 className='w-5 h-5' />}
              helperText='Enter the official name of the brokerage'
            />

            <FormField
              label={tForm('labels.headquarter')}
              name='headquarter'
              value={formData.headquarter || ''}
              onChange={handleChange('headquarter')}
              onBlur={handleBlur('headquarter')}
              placeholder={tForm('placeholders.enterHeadquarter')}
              disabled={isValidating}
              {...(errors.headquarter && { error: errors.headquarter })}
              icon={<MapPin className='w-5 h-5' />}
              helperText='Primary business location'
            />

            <FormField
              label={tForm('labels.establishedYear')}
              type='number'
              name='established_in'
              value={formData.established_in?.toString() || ''}
              onChange={handleEstablishedYearChange}
              onBlur={handleBlur('established_in')}
              placeholder={tForm('placeholders.enterEstablishedYear')}
              min={1800}
              max={new Date().getFullYear()}
              disabled={isValidating}
              {...(errors.established_in && { error: errors.established_in })}
              icon={<Calendar className='w-5 h-5' />}
              helperText='Year the brokerage was founded'
            />
          </div>
        </div>

        {/* Right column - Content & Translations */}
        <div className="xl:col-span-3 space-y-6">
          {/* Content & Translations Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content & Translations</h3>
                </div>
                {broker && (
                  <div id="translation-status-container" className="flex items-center">
                    {/* Translation status will be rendered here by TranslationManager */}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {broker ? (
                <TranslationManager
                  contentType="brokers"
                  contentId={broker.id}
                  defaultLanguage="en"
                  requiredLanguages={SUPPORTED_LANGUAGE_CODES}
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
                      Content & Translation Management
                    </h4>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                      The content editor and translation tools will become available once you save this broker.
                      You'll be able to create and manage content in multiple languages.
                    </p>

                    {/* Features preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start space-x-3 text-left">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Multi-language Support</div>
                          <div className="text-gray-500 dark:text-gray-400">Manage broker description in multiple languages</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 text-left">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Translation Status</div>
                          <div className="text-gray-500 dark:text-gray-400">Track translation progress and completeness</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center'
          disabled={isValidating}
        >
          <X className='w-4 h-4 mr-2' />
          {t('actions.cancel')}
        </button>
        <button
          type='submit'
          disabled={isValidating}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
        >
          {isValidating ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-b-gray-900 mr-2'></div>
              {broker ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {broker ? (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  {t('actions.update')} {t('entities.brokers')}
                </>
              ) : (
                <>
                  <Plus className='w-4 h-4 mr-2' />
                  {t('actions.add')} {t('entities.brokers')}
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default BrokerForm
