import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Calendar,
  Package,
  Edit2
} from 'lucide-react'
import { useTranslation, usePageTranslation } from '../../../hooks/useTranslation'
import { formatDateDisplay } from '../../../utils/format'
import { getTypographyClasses, cn } from '../../../utils/theme'
import type { ProductWithTranslations, Image } from '../../../types'
import RecordImage from '../images/RecordImage'
import { Button } from '../../atoms'

interface ProductViewModalProps {
  isOpen: boolean
  onClose: () => void
  product: ProductWithTranslations
  image?: Image | null
  onEdit?: () => void
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({
  isOpen,
  onClose,
  product,
  image,
  onEdit
}) => {
  const { t: tCommon, i18n } = useTranslation()
  const { t } = usePageTranslation()

  // Helper to get translation for current language, fallback to English, then base
  const getTranslation = (product: ProductWithTranslations) => {
    const lang = i18n.language || 'en';
    if (!product.translations || product.translations.length === 0) return { name: '', description: '' };
    const translation =
      product.translations.find(tr => tr.language_code === lang) ||
      product.translations.find(tr => tr.language_code === 'en');
    return {
      name: translation?.name || '',
      description: translation?.description || ''
    };
  };
  const { name, description } = getTranslation(product);

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

  // Handle ESC key
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
                    fallbackClassName='w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'
                    className='w-16 h-16 rounded-xl object-cover border-2 border-white/20'
                    fallbackIcon={<Package className='w-8 h-8 text-white' />}
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <h1 className={cn(
                    getTypographyClasses('h1'),
                    'text-2xl lg:text-3xl font-bold leading-tight text-white truncate'
                  )}>
                    {name || t('products.untitledProduct')}
                  </h1>
                  <div className='flex flex-col space-y-1 mt-2'>
                    <div className='flex items-center text-gray-300'>
                      <Calendar className='w-4 h-4 mr-1 flex-shrink-0' />
                      <span className='text-sm'>{t('products.createdDate')}: {product.created_at ? formatDateDisplay(product.created_at) : t('general.notAvailable')}</span>
                    </div>
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
          {/* Content */}
          <div className='flex-1 overflow-y-auto max-h-[calc(95vh-8rem)]'>
            <div className='px-8 py-6'>
              <div className='space-y-8'>
                {/* Product Affiliate Link */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4'>
                  <div className='flex items-center gap-2'>
                  </div>
                  {product.affiliate_link && (
                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-gray-700 dark:text-gray-300'>{t('products.affiliateLinkShort')}:</span>
                      <a
                        href={product.affiliate_link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 dark:text-blue-400 underline break-all'
                      >
                        {product.affiliate_link}
                      </a>
                    </div>
                  )}
                </div>
                {/* Description */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    {tCommon('general.description')}
                  </label>
                  <div className='text-gray-900 dark:text-gray-100 prose prose-sm max-w-none min-h-[2rem]'>
                    {description ? (
                      <div dangerouslySetInnerHTML={{ __html: description }} />
                    ) : (
                      <span className='italic text-gray-400 dark:text-gray-500'>{t('products.noDescription')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ProductViewModal
