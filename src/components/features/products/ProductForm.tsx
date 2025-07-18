import React, { useMemo, useCallback, useState } from 'react'
import { DollarSign, Package, Save, X, Link2, Languages, CheckCircle } from 'lucide-react'
import type { Product, ProductInsert } from '../../../types'
import type { Image } from '../../../types/images'
import type { UploadResult } from '../../../hooks/useFileUpload'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField, Button } from '../../atoms'
import { MainImageUpload } from '../images'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import TranslationManager from '../translations/TranslationManager'
import { SUPPORTED_LANGUAGE_CODES } from '../../../constants/languages'
import { VALIDATION } from '../../../constants/ui'
import { getStorageUrl } from '../../../utils/storage'
import { formatPrice } from '../../../utils/format'

// Move schema outside component to prevent re-renders
const PRODUCT_FORM_SCHEMA = {
  price: {
    required: true,
    min: VALIDATION.PRICE_MIN
  },
  affiliate_link: {
    required: false,
    // Use a simple URL regex or remove pattern if not needed
    pattern: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[^\s]*)?$/i
  }
} as const

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: ProductInsert, featuredImage?: (Partial<Image> & { file?: File }) | null) => void
  onCancel: () => void
  images?: Image[] | null
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel, images }) => {
  const { t: tForm } = useFormTranslation()
  const { t: tCommon } = useTranslation()
  const [featuredImage, setFeaturedImage] = useState<(Partial<Image> & { publicUrl?: string; file?: File }) | null>(null)
  const [priceDisplay, setPriceDisplay] = useState<string>('0')
  // Memoize initial data to prevent re-renders
  const initialData = useMemo(() => ({
  price: 0,
  affiliate_link: '',
}), [])

  // Enhanced form validation with our new hook
  const {
    data: formData,
    errors,
    isValidating,
    updateField,
    handleBlur,
    handleSubmit
  } = useFormValidation({
    schema: PRODUCT_FORM_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  React.useEffect(() => {
    if (product && images) {
      const existing = images.find(img => img.record_id === product.id && img.type === 'featured')
      const publicUrl = getStorageUrl('products', existing?.path)
      setFeaturedImage(publicUrl ? { ...existing, publicUrl } : { ...existing })
    } else {
      setFeaturedImage(null)
    }
    // Set form fields for edit mode
    if (product) {
      updateField('price', product.price)
      setPriceDisplay(formatPrice(product.price))
      updateField('affiliate_link', product.affiliate_link || '')
    } else {
      setPriceDisplay('0')
    }
  }, [product, images, updateField])

  // Handle price input change
  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    // Allow empty string for controlled input
    if (value === '') {
      updateField('price', 0)
      setPriceDisplay('')
      return
    }
    // Only allow valid numbers
    const num = parseFloat(value)
    if (!isNaN(num)) {
      updateField('price', num)
      setPriceDisplay(value)
    }
  }, [updateField])

  // Format price on blur
  const handlePriceBlur = useCallback(() => {
    setPriceDisplay(formatPrice(formData.price))
  }, [formData.price])

  // Show raw value on focus
  const handlePriceFocus = useCallback(() => {
    setPriceDisplay(formData.price ? formData.price.toString() : '')
  }, [formData.price])

  const handleAffiliateLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('affiliate_link', e.target.value)
  }, [updateField])

  const handleImageUpload = useCallback(
    (uploadResult: UploadResult | null, file?: File) => {
      if (uploadResult && file) {
        setFeaturedImage({
          ...uploadResult,
          publicUrl: uploadResult.url,
          file,
          table_name: 'products',
          record_id: product?.id || '',
          type: 'featured',
          alt_text: 'Featured image',
          file_size: file.size,
          mime_type: file.type,
        })
      } else {
        setFeaturedImage(null)
      }
    },
    [product?.id]
  )

  const handleFormSubmit = useCallback((data: typeof formData) => {
    onSubmit(data as ProductInsert, featuredImage)
  }, [onSubmit, featuredImage])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Sidebar - Settings & Media */}
        <div className="xl:col-span-1 space-y-6">
          {/* Product Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tCommon('content.productSettings')}</h3>
            </div>
            <div className="space-y-4">
              <FormField
                label={tForm('labels.price')}
                type='text'
                name='price'
                value={priceDisplay}
                onChange={handlePriceChange}
                onBlur={e => { handleBlur('price')(e); handlePriceBlur(); }}
                onFocus={handlePriceFocus}
                placeholder={tForm('placeholders.productPrice')}
                step={VALIDATION.PRICE_STEP}
                disabled={isValidating}
                {...(errors.price && { error: errors.price })}
                icon={<DollarSign className='w-5 h-5' />}
                helperText={tForm('helpers.productPriceHelper') + ' (e.g. 1,000 or 324.12)'}
              />
              <FormField
                label={tForm('labels.affiliateLink')}
                name='affiliate_link'
                value={formData.affiliate_link}
                onChange={handleAffiliateLinkChange}
                onBlur={handleBlur('affiliate_link')}
                placeholder={tForm('placeholders.affiliateLink')}
                disabled={isValidating}
                {...(errors.affiliate_link && { error: errors.affiliate_link })}
                icon={<Link2 className='w-5 h-5' />}
                helperText={tForm('helpers.affiliateLinkHelper')}
              />
            </div>
          </div>
          {/* Main Image Upload Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tForm('labels.featuredImage') || 'Featured Image'}</h3>
            </div>
            <MainImageUpload
              label={tForm('labels.featuredImage') || 'Featured Image'}
              imageUrl={featuredImage?.publicUrl || featuredImage?.path || null}
              onChange={handleImageUpload}
              bucket='products'
              folder='feature_images'
              size='lg'
              disabled={isValidating}
              recommendationText='Use square images (1:1 ratio) for best display'
              alt={tCommon('accessibility.productFeaturedImage')}
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
                {product && (
                  <div id="translation-status-container" className="flex items-center">
                    {/* Translation status will be rendered here by TranslationManager */}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {product ? (
                <TranslationManager
                  contentType="products"
                  contentId={product.id}
                  defaultLanguage="en"
                  requiredLanguages={SUPPORTED_LANGUAGE_CODES}
                  onLanguageChange={() => {}}
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
                      {tCommon('content.contentEditorDescription', { type: 'product' })}
                    </p>
                    {/* Features preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{tCommon('content.productDetailsEditor')}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tCommon('content.nameAndDescription')}</div>
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
                        <span className="font-medium">{tCommon('content.completeSettingsToEnableEditing', { type: 'product' })}</span>
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
          leftIcon={Save}
          className="px-8"
        >
          {isValidating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              {tCommon('feedback.saving')}
            </>
          ) : (
            tCommon('actions.save')
          )}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm
