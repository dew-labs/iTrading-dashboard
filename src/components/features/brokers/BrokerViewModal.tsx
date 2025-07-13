import React, { useMemo, useState, useEffect } from 'react'
import {
  X,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Edit2,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTranslation, usePageTranslation } from '../../../hooks/useTranslation'
import { useContentTranslation } from '../../../hooks/useContentTranslation'
import { formatDateDisplay } from '../../../utils/format'
import { Button, LanguageBadgeSelector, Badge } from '../../atoms'
import { RichTextRenderer } from '../../common'
import { SUPPORTED_LANGUAGE_CODES } from '../../../constants/languages'
import type { Broker, Image } from '../../../types'
import type { LanguageCode } from '../../../types/translations'
import { getTypographyClasses, cn } from '../../../utils/theme'
import RecordImage from '../images/RecordImage'

interface BrokerViewModalProps {
  isOpen: boolean
  onClose: () => void
  broker: Broker
  image?: Image | null
  onEdit?: () => void
}

const BrokerViewModal: React.FC<BrokerViewModalProps> = ({
  isOpen,
  onClose,
  broker,
  image,
  onEdit
}) => {
  const { t: tCommon, i18n } = useTranslation()
  const { t } = usePageTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(i18n.language as LanguageCode)

  // Get translations for this broker
  const { translations, loading: translationsLoading } = useContentTranslation(
    'brokers',
    broker.id,
    {
      enabled: isOpen && !!broker.id,
      defaultLanguage: selectedLanguage,
      requiredLanguages: SUPPORTED_LANGUAGE_CODES
    }
  )

  // Update selected language when i18n language changes
  useEffect(() => {
    if (i18n.language && SUPPORTED_LANGUAGE_CODES.includes(i18n.language as LanguageCode)) {
      setSelectedLanguage(i18n.language as LanguageCode)
    }
  }, [i18n.language])

  // Get current translation data
  const currentTranslation = useMemo(() => {
    if (!translations || translations.length === 0) return null

    // First try to find translation for selected language
    const selectedTranslation = translations.find(t => t.language_code === selectedLanguage)
    if (selectedTranslation) {
      return selectedTranslation as { id: string; language_code: string; description?: string }
    }

    // Fallback to English if available
    const englishTranslation = translations.find(t => t.language_code === 'en')
    if (englishTranslation) {
      return englishTranslation as { id: string; language_code: string; description?: string }
    }

    // Fallback to first available translation
    return translations[0] as { id: string; language_code: string; description?: string }
  }, [translations, selectedLanguage])

  // Get available languages for this broker
  const availableLanguages = useMemo(() => {
    if (!translations || translations.length === 0) return []
    return translations.map(t => t.language_code as LanguageCode)
  }, [translations])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto' aria-labelledby='modal-title' role='dialog' aria-modal='true'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        {/* Backdrop */}
        <div
          className='fixed inset-0 bg-gray-900/75 transition-opacity z-40'
          aria-hidden='true'
          onClick={onClose}
        />

        {/* Spacer element to trick the browser into centering the modal contents. */}
        <span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
          &#8203;
        </span>

        {/* Modal content */}
        <div className='relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50'>
          {/* Header */}
          <div className='bg-gradient-to-r from-gray-900 to-black dark:from-gray-700 dark:to-gray-800 px-8 py-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='flex-shrink-0'>
                  <RecordImage
                    image={image || null}
                    fallbackClassName='w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center'
                    className='w-16 h-16 rounded-xl object-cover border-2 border-white/20'
                    fallbackIcon={<Building2 className='w-8 h-8 text-white' />}
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <h1 className={cn(
                    getTypographyClasses('h1'),
                    'text-2xl lg:text-3xl font-bold leading-tight text-white truncate'
                  )}>
                    {broker.name || tCommon('content.unnamedBroker')}
                  </h1>
                  <div className='flex flex-col space-y-1 mt-2'>
                    {broker.headquarter && (
                      <div className='flex items-center text-gray-300'>
                        <MapPin className='w-4 h-4 mr-1 flex-shrink-0' />
                        <span className='text-sm truncate'>{broker.headquarter}</span>
                      </div>
                    )}
                    {broker.established_in && (
                      <div className='flex items-center text-gray-300'>
                        <Calendar className='w-4 h-4 mr-1 flex-shrink-0' />
                        <span className='text-sm'>{t('brokers.est')} {broker.established_in}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                {onEdit && (
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={onEdit}
                    className='bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30'
                  >
                    <Edit2 className='w-4 h-4 mr-2' />
                    {tCommon('actions.edit')}
                  </Button>
                )}
                <button
                  type='button'
                  className='bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors'
                  onClick={onClose}
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
            </div>
          </div>

          {/* Loading indicator for translations */}
          {translationsLoading && (
            <div className='px-8 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700'>
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                <span className='text-sm text-blue-600 dark:text-blue-400'>Loading translations...</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className='flex-1 overflow-y-auto max-h-[calc(95vh-8rem)]'>
            <div className='px-8 py-6'>
              <div className='space-y-8'>

                {/* Language selector */}
                {availableLanguages.length > 0 && (
                  <LanguageBadgeSelector
                    availableLanguages={availableLanguages}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    size='sm'
                    showLabel={false}
                    compact={false}
                  />
                )}

                {/* Broker description */}
                <div>
                  <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                    <FileText className='w-5 h-5 mr-2 text-blue-600 dark:text-blue-400' />
                    {tCommon('general.about')} {broker.name}
                  </h2>

                  <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-6 min-h-[120px]'>
                    {currentTranslation?.description ? (
                      <RichTextRenderer content={currentTranslation.description} />
                    ) : (
                      <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                        <FileText className='w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600' />
                        <p className='text-sm'>
                          {availableLanguages.length > 0
                            ? `No description available in ${selectedLanguage.toUpperCase()}`
                            : 'No description available for this broker.'
                          }
                        </p>
                        {availableLanguages.length > 0 && selectedLanguage !== 'en' && (
                          <button
                            onClick={() => setSelectedLanguage('en')}
                            className='text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2'
                          >
                            Try switching to English
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Broker details section */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200 dark:border-gray-700'>

                  {/* Broker Details */}
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                      <Building2 className='w-5 h-5 mr-2 text-blue-600 dark:text-blue-400' />
                      {t('brokers.brokerDetails')}
                    </h3>
                    <div className='space-y-4'>
                      <div className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600'>
                        <div className='space-y-3'>
                          <div className='flex items-start justify-between'>
                            <span className='text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]'>
                              {t('brokers.name')}:
                            </span>
                            <span className='text-sm text-gray-900 dark:text-white text-right font-medium'>
                              {broker.name || 'N/A'}
                            </span>
                          </div>

                          {broker.headquarter && (
                            <div className='flex items-start justify-between'>
                              <span className='text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]'>
                                {t('brokers.headquarter')}:
                              </span>
                              <span className='text-sm text-gray-900 dark:text-white text-right'>
                                {broker.headquarter}
                              </span>
                            </div>
                          )}

                          {broker.established_in && (
                            <div className='flex items-start justify-between'>
                              <span className='text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]'>
                                {t('brokers.established')}:
                              </span>
                              <span className='text-sm text-gray-900 dark:text-white text-right'>
                                {broker.established_in}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Information */}
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                      <Calendar className='w-5 h-5 mr-2 text-green-600 dark:text-green-400' />
                      {t('brokers.systemInfo')}
                    </h3>
                    <div className='space-y-4'>
                      <div className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600'>
                        <div className='space-y-3'>
                          <div className='flex items-start justify-between'>
                            <span className='text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]'>
                              {t('brokers.createdDate')}:
                            </span>
                            <span className='text-sm text-gray-900 dark:text-white text-right'>
                              {formatDateDisplay(broker.created_at || new Date().toISOString())}
                            </span>
                          </div>

                          <div className='flex items-start justify-between'>
                            <span className='text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]'>
                              {t('brokers.status')}:
                            </span>
                            <div className='text-right'>
                              <Badge
                                variant={broker.is_visible ? 'active' : 'inactive'}
                                size='sm'
                                className='inline-flex items-center'
                              >
                                {broker.is_visible ? (
                                  <Eye className='w-3 h-3 mr-1' />
                                ) : (
                                  <EyeOff className='w-3 h-3 mr-1' />
                                )}
                                {broker.is_visible ? t('brokers.visible') : t('brokers.hidden')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrokerViewModal
