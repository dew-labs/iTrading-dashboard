import React from 'react'
import {
  X,
  Calendar,
  Package,
  Edit2
} from 'lucide-react'
import { useTranslation, usePageTranslation } from '../../../hooks/useTranslation'
import { formatDateDisplay, formatPrice } from '../../../utils/format'
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
        <span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
          &#8203;
        </span>
        <div className='relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full z-50'>
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
                  onClick={onClose}
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
                {/* Product Price & Affiliate Link */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-lg font-semibold text-green-600 dark:text-green-400'>${formatPrice(product.price)}</span>
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
    </div>
  )
}

export default ProductViewModal
