import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Edit2,
  ExternalLink,
  CreditCard,
  DollarSign,
  TrendingUp,
  Bitcoin,
  Coins
} from 'lucide-react'
import { useTranslation, usePageTranslation } from '../../../hooks/useTranslation'
import { useContentTranslation } from '../../../hooks/useContentTranslation'
import { Button, LanguageBadgeSelector, Badge } from '../../atoms'
import { RichTextRenderer } from '../../common'
import { CONTENT_LANGUAGE_CODES, SUPPORTED_LANGUAGE_CODES } from '../../../constants/languages'
import type { Broker, Image } from '../../../types'
import type { LanguageCode } from '../../../types/translations'
import type { Database } from '../../../types/database'
import { getTypographyClasses, cn } from '../../../utils/theme'
import RecordImage from '../images/RecordImage'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'

type BrokerAccountType = Database['public']['Tables']['broker_account_types']['Row']

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
      requiredLanguages: CONTENT_LANGUAGE_CODES
    }
  )

  // Get broker account types
  const { data: accountTypes, isLoading: accountTypesLoading } = useQuery({
    queryKey: ['broker-account-types', broker.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broker_account_types')
        .select('*')
        .eq('broker_id', broker.id)
        .order('account_type')

      if (error) {
        console.error('Error fetching broker account types:', error)
        return []
      }
      return data as BrokerAccountType[]
    },
    enabled: isOpen && !!broker.id
  })

  // Get broker category
  const { data: brokerCategory } = useQuery({
    queryKey: ['broker-category', broker.category_id],
    queryFn: async () => {
      if (!broker.category_id) return null

      const { data, error } = await supabase
        .from('broker_categories')
        .select('*')
        .eq('id', broker.category_id)
        .single()

      if (error) {
        console.error('Error fetching broker category:', error)
        return null
      }
      return data
    },
    enabled: isOpen && !!broker.category_id
  })

  // Helper function to get category icon and styling
  const getCategoryDisplay = useCallback((categoryName: string) => {
    const name = categoryName.toLowerCase()

    if (name.includes('fx') || name.includes('cfd') || name.includes('forex')) {
      return {
        icon: TrendingUp,
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700/50'
      }
    } else if (name.includes('crypto') || name.includes('bitcoin') || name.includes('digital')) {
      return {
        icon: Bitcoin,
        className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700/50'
      }
    } else if (name.includes('commodity') || name.includes('metal') || name.includes('gold')) {
      return {
        icon: Coins,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700/50'
      }
    } else {
      return {
        icon: Building2,
        className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600'
      }
    }
  }, [])

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
      return selectedTranslation as { id: string; language_code: string; description?: string; affiliate_link?: string }
    }

    // Fallback to English if available
    const englishTranslation = translations.find(t => t.language_code === 'en')
    if (englishTranslation) {
      return englishTranslation as { id: string; language_code: string; description?: string; affiliate_link?: string }
    }

    // Fallback to first available translation
    return translations[0] as { id: string; language_code: string; description?: string; affiliate_link?: string }
  }, [translations, selectedLanguage])

  // Get available languages for this broker
  const availableLanguages = useMemo(() => {
    if (!translations || translations.length === 0) return []
    return translations.map(t => t.language_code as LanguageCode)
  }, [translations])

  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 200)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 200)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  if (!isVisible) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const modalContent = (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4'
      aria-labelledby='modal-title'
      role='dialog'
      aria-modal='true'
      onClick={handleBackdropClick}
    >
      {/* Enhanced background overlay with blur */}
      <div
        className={`absolute inset-0 backdrop-blur-md bg-black/30 dark:bg-black/50 transition-all duration-200 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden='true'
        onClick={handleBackdropClick}
      />

      <div
        className={`relative z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-200 ease-out ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
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
                  <div className='flex flex-col space-y-2 mt-2'>
                    {(broker.headquarter || broker.established_in) && (
                      <div className='flex items-center gap-4 text-gray-300'>
                        {broker.headquarter && (
                          <div className='flex items-center'>
                            <MapPin className='w-4 h-4 mr-1 flex-shrink-0' />
                            <span className='text-sm truncate'>{broker.headquarter}</span>
                          </div>
                        )}
                        {broker.established_in && (
                          <div className='flex items-center'>
                            <Calendar className='w-4 h-4 mr-1 flex-shrink-0' />
                            <span className='text-sm'>{t('brokers.est')} {broker.established_in}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {brokerCategory && (
                      <div className='flex items-center'>
                        {(() => {
                          const { icon: Icon, className } = getCategoryDisplay(brokerCategory.name)
                          return (
                            <Badge
                              variant='secondary'
                              size='sm'
                              className={cn('inline-flex items-center', className)}
                            >
                              <Icon className='w-3 h-3 mr-1' />
                              {brokerCategory.name}
                            </Badge>
                          )
                        })()}
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
                  onClick={handleClose}
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


                {/* Account Types Section */}
                {accountTypes && accountTypes.length > 0 && (
                  <div className='pt-6 border-t border-gray-200 dark:border-gray-700'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                      <CreditCard className='w-5 h-5 mr-2 text-purple-600 dark:text-purple-400' />
                      {t('brokers.accountTypes')}
                    </h3>
                    {accountTypesLoading ? (
                      <div className='flex items-center justify-center py-8'>
                        <div className='w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin'></div>
                        <span className='ml-2 text-sm text-gray-500 dark:text-gray-400'>Loading account types...</span>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {accountTypes.map((accountType, index) => (
                          <div key={accountType.id || index} className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600'>
                            <div className='space-y-3'>
                              <div className='flex items-center justify-between'>
                                <h4 className='text-sm font-semibold text-gray-900 dark:text-white flex items-center'>
                                  <DollarSign className='w-4 h-4 mr-1 text-purple-600 dark:text-purple-400' />
                                  {accountType.account_type}
                                </h4>
                              </div>

                              {accountType.spreads && (
                                <div className='flex items-start justify-between'>
                                  <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                                    {t('brokers.spreads')}:
                                  </span>
                                  <span className='text-xs text-gray-900 dark:text-white text-right'>
                                    {accountType.spreads}
                                  </span>
                                </div>
                              )}

                              {accountType.commission && (
                                <div className='flex items-start justify-between'>
                                  <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                                    {t('brokers.commission')}:
                                  </span>
                                  <span className='text-xs text-gray-900 dark:text-white text-right'>
                                    {accountType.commission}
                                  </span>
                                </div>
                              )}

                              {accountType.min_deposit && (
                                <div className='flex items-start justify-between'>
                                  <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
                                    {t('brokers.minDeposit')}:
                                  </span>
                                  <span className='text-xs text-gray-900 dark:text-white text-right font-medium'>
                                    {accountType.min_deposit}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Affiliate Link Section */}
                {currentTranslation?.affiliate_link && (
                  <div className='pt-6 border-t border-gray-200 dark:border-gray-700'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                      <ExternalLink className='w-5 h-5 mr-2 text-orange-600 dark:text-orange-400' />
                      {t('brokers.affiliateLink')}
                    </h3>
                    <div className='bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600'>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1 min-w-0'>
                          <span className='text-sm text-gray-500 dark:text-gray-400 block mb-1'>
                            {t('brokers.partnerLink')}
                          </span>
                          <a
                            href={currentTranslation.affiliate_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-sm text-blue-600 dark:text-blue-400 hover:underline break-all'
                          >
                            {currentTranslation.affiliate_link}
                          </a>
                        </div>
                        <a
                          href={currentTranslation.affiliate_link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='ml-3 flex-shrink-0 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors'
                        >
                          <ExternalLink className='w-3 h-3 mr-1' />
                          {t('brokers.visitSite')}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default BrokerViewModal
