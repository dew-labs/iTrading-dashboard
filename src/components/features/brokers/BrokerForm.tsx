import React, { useMemo, useCallback, useState } from 'react'
import { X, Save, Plus, Building2, Calendar, MapPin, Languages, CheckCircle } from 'lucide-react'
import type { Broker, BrokerInsert, Image } from '../../../types'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField, Button } from '../../atoms'
import { MainImageUpload } from '../images'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import { supabase } from '../../../lib/supabase'
import type { UploadResult } from '../../../hooks/useFileUpload'
import TranslationManager from '../translations/TranslationManager'
import { SUPPORTED_LANGUAGE_CODES } from '../../../constants/languages'
import type { LanguageCode } from '../../../types/translations'
import { VALIDATION } from '../../../constants/ui'

// Move schema outside component to prevent re-renders
// Only description is handled in translations now
const BROKER_FORM_SCHEMA = {
  name: {
    required: true,
    minLength: VALIDATION.REQUIRED_FIELD_MIN_LENGTH,
    maxLength: VALIDATION.REQUIRED_FIELD_MAX_LENGTH
  },
  headquarter: {
    maxLength: VALIDATION.HEADQUARTER_MAX_LENGTH
  },
  established_in: {
    min: VALIDATION.YEAR_MIN,
    max: VALIDATION.YEAR_MAX,
    custom: (value: number | null) => !value || (value >= VALIDATION.YEAR_MIN && value <= VALIDATION.YEAR_MAX)
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
  const { t: tCommon } = useTranslation()
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Left Sidebar - Settings & Media */}
        <div className="xl:col-span-1 space-y-6">

          {/* Broker Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.brokerSettings')}</h3>
            </div>

            <div className="space-y-4">
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
                helperText={tForm('helpers.brokerNameHelper')}
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
                helperText={tForm('helpers.brokerLocationHelper')}
              />

              <FormField
                label={tForm('labels.establishedYear')}
                type='number'
                name='established_in'
                value={formData.established_in?.toString() || ''}
                onChange={handleEstablishedYearChange}
                onBlur={handleBlur('established_in')}
                placeholder={tForm('placeholders.enterEstablishedYear')}
                disabled={isValidating}
                {...(errors.established_in && { error: errors.established_in })}
                icon={<Calendar className='w-5 h-5' />}
                helperText={tForm('helpers.brokerEstablishedHelper')}
              />
            </div>
          </div>

          {/* Logo Upload Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.brokerLogo')}</h3>
            </div>

            <MainImageUpload
              label=""
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
                      {tCommon('content.contentTranslationManagement')}
                    </h4>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                      {tCommon('content.contentEditorDescription', { type: 'broker' })}
                    </p>

                    {/* Features preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{tCommon('content.brokerDetailsEditor')}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tCommon('content.descriptionAndDetails')}</div>
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
                        <span className="font-medium">{tCommon('content.completeSettingsToEnableEditing', { type: 'broker' })}</span>
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
          disabled={isValidating}
          {...(!isValidating && { leftIcon: broker ? Save : Plus })}
          className="px-8"
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              {broker ? tCommon('feedback.updating') : tCommon('feedback.creating')}
            </>
          ) : (
            <>
              {broker ? `${tCommon('actions.update')} ${tCommon('entities.brokers')}` : `${tCommon('actions.add')} ${tCommon('entities.brokers')}`}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default BrokerForm
