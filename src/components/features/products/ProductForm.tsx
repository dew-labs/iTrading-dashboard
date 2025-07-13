import React, { useMemo, useCallback } from 'react'
import { DollarSign, Package, Save, X, Plus, Zap, Clock } from 'lucide-react'
import type { Product, ProductInsert } from '../../../types'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField } from '../../atoms'
import { Select } from '../../molecules'
import { MainImageUpload } from '../images'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import type { UploadResult } from '../../../hooks/useFileUpload'
import { VALIDATION } from '../../../constants/ui'
import { FORM_OPTIONS } from '../../../constants/components'

// Move schema outside component to prevent re-renders
const PRODUCT_FORM_SCHEMA = {
  name: {
    required: true,
    minLength: VALIDATION.REQUIRED_FIELD_MIN_LENGTH,
    maxLength: VALIDATION.REQUIRED_FIELD_MAX_LENGTH
  },
  price: {
    required: true,
    min: VALIDATION.PRICE_MIN
  }
} as const

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: ProductInsert) => void
  onCancel: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  // Memoize initial data to prevent re-renders
  const initialData = useMemo(() => ({
    name: '',
    price: 0,
    description: '',
    subscription: false,
    featured_image_url: null as string | null
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
    schema: PRODUCT_FORM_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  const { t: tForm } = useFormTranslation()
  const { t: tCommon } = useTranslation()

  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price,
        description: product.description || '',
        subscription: product.subscription || false,
        featured_image_url: product.featured_image_url || null
      })
    }
  }, [product, reset])

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateField('description', e.target.value)
  }, [updateField])

  const handleImageChange = useCallback(
    (result: UploadResult | null) => {
      updateField('featured_image_url', result?.url ?? null)
    },
    [updateField]
  )

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateField('price', value ? parseFloat(value) : 0)
  }, [updateField])

  // Create type options
  const typeOptions = useMemo(() =>
    FORM_OPTIONS.productType.map(option => ({
      value: option.value,
      label: option.labelKey === 'oneTimePurchase' ? tCommon('content.oneTime') : tCommon('content.subscription'),
      icon: option.icon === 'Package' ? <Package className='w-4 h-4' /> : <Zap className='w-4 h-4' />
    })), [tCommon])

  const handleFormSubmit = useCallback((data: typeof formData) => {
    onSubmit(data as ProductInsert)
  }, [onSubmit])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6' noValidate>
      {/* Product name field using enhanced FormField */}
              <FormField
          label={tForm('labels.name')}
        name='name'
        value={formData.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        placeholder={tForm('placeholders.productName')}
        required
        disabled={isValidating}
        {...(errors.name && { error: errors.name })}
        icon={<Package className='w-5 h-5' />}
                      helperText={tForm('helpers.productNameHelper')}
      />

      {/* Enhanced layout */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left column - Image and basic info */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Featured image upload */}
          <MainImageUpload
            label={tForm('labels.image')}
            imageUrl={formData.featured_image_url || null}
            onChange={handleImageChange}
            bucket='products'
            folder='featured-images'
            size='lg'
            disabled={isValidating}
            recommendationText='Use square images (1:1 ratio) for best display'
            alt='Product featured image'
          />

          {/* Price and type */}
          <div className='space-y-4'>
            <FormField
              label={tForm('labels.price')}
              type='number'
              name='price'
              value={formData.price.toString()}
              onChange={handlePriceChange}
              onBlur={handleBlur('price')}
              placeholder={tForm('placeholders.productPrice')}
              step={VALIDATION.PRICE_STEP}
              disabled={isValidating}
              {...(errors.price && { error: errors.price })}
              icon={<DollarSign className='w-5 h-5' />}
              helperText={tForm('helpers.productPriceHelper')}
            />

            <Select
              label={tForm('labels.type')}
              required
              value={formData.subscription.toString()}
              onChange={value => updateField('subscription', value === 'true')}
              options={typeOptions}
              disabled={isValidating}
            />
          </div>
        </div>

        {/* Right column - Description */}
        <div className='lg:col-span-2'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Description
            </label>
            <textarea
              name='description'
              value={formData.description || ''}
              onChange={handleDescriptionChange}
              onBlur={handleBlur('description')}
              placeholder={tForm('placeholders.productDescription')}
              rows={10}
              disabled={isValidating}
              className={`w-full px-4 py-3 border rounded-lg resize-vertical transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                isValidating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Provide a detailed description of your product to help customers understand its value
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isValidating}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
        >
          <X className='w-4 h-4 mr-2' />
          Cancel
        </button>
        <button
          type='submit'
          disabled={isValidating}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
        >
          {isValidating ? (
            <>
              <Clock className='w-4 h-4 mr-2 animate-spin' />
              {product ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {product ? (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  Update Product
                </>
              ) : (
                <>
                  <Plus className='w-4 h-4 mr-2' />
                  Create Product
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
