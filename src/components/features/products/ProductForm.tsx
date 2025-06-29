import React from 'react'
import { Package, DollarSign, FileText } from 'lucide-react'
import type { Product, ProductInsert } from '../../../types'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField } from '../../atoms'
import { RichTextEditor } from '../posts'
import { MainImageUpload } from '../images'

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: ProductInsert) => void
  onCancel: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
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
  } = useFormValidation<{
    name: string
    price: number
    description: string
    subscription: boolean
    featured_image_url: string | null
  }>({
    schema: {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        message: 'Product name must be between 2 and 100 characters'
      },
      price: {
        required: true,
        min: 0,
        message: 'Price must be a positive number'
      }
    },
    initialData: {
      name: '',
      price: 0,
      description: '',
      subscription: false,
      featured_image_url: null
    },
    validateOnBlur: true,
    validateOnChange: false
  })

  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price,
        description: product.description || '',
        subscription: !!product.subscription,
        featured_image_url: product.featured_image_url || null
      })
    }
  }, [product, reset])

  const handleDescriptionChange = (description: string) => {
    updateField('description', description)
  }

  const handleImageChange = (url: string | null) => {
    updateField('featured_image_url', url)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateField('price', value === '' ? 0 : parseFloat(value) || 0)
  }

  const handleSubscriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('subscription', e.target.checked)
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as ProductInsert))} className='space-y-6'>
      {/* Main image and basic info grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Main Image Upload */}
        <div className='md:col-span-1'>
          <MainImageUpload
            imageUrl={formData.featured_image_url || null}
            onChange={handleImageChange}
            bucket='products'
            folder='featured-images'
            alt='Product featured image'
            label='Featured Image'
            size='lg'
            disabled={isValidating}
            recommendationText='Use high-quality product images for better customer engagement'
          />
        </div>

        {/* Product Details using enhanced FormField components */}
        <div className='md:col-span-2 space-y-4'>
          <FormField
            label='Product Name'
            name='name'
            value={formData.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            placeholder='Enter product name'
            required
            disabled={isValidating}
            {...(errors.name && { error: errors.name })}
            icon={<Package className='w-5 h-5' />}
            helperText='Choose a clear, descriptive name for your product'
          />

          <FormField
            label='Price ($)'
            type='number'
            name='price'
            value={formData.price.toString()}
            onChange={handlePriceChange}
            onBlur={handleBlur('price')}
            placeholder='0.00'
            step={0.01}
            min={0}
            required
            disabled={isValidating}
            {...(errors.price && { error: errors.price })}
            icon={<DollarSign className='w-5 h-5' />}
            helperText='Set the price in USD (use 0.00 format for cents)'
          />
        </div>
      </div>

      {/* Subscription checkbox inline */}
      <div className='flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='subscription'
            name='subscription'
            checked={formData.subscription ?? false}
            onChange={handleSubscriptionChange}
            disabled={isValidating}
            className='h-4 w-4 text-gray-900 dark:text-white focus:ring-gray-900 dark:focus:ring-gray-300 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700'
          />
          <label htmlFor='subscription' className='ml-2 block text-sm text-gray-700 dark:text-gray-300'>
            Subscription Product
          </label>
        </div>
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {formData.subscription ? 'Recurring billing' : 'One-time payment'}
        </span>
      </div>

      {/* Large editor section */}
      <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
            <FileText className='w-4 h-4 inline mr-1' />
            Product Description
          </label>
          <RichTextEditor
            content={formData.description || ''}
            onChange={handleDescriptionChange}
            placeholder='Describe your product in detail - features, benefits, specifications...'
            height={450}
            disabled={isValidating}
            bucket='products'
            folder='images'
          />
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Provide detailed information about your product's features, benefits, and specifications
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isValidating}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={isValidating}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isValidating ? (
            <div className='flex items-center space-x-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-b-gray-900'></div>
              <span>{product ? 'Updating...' : 'Creating...'}</span>
            </div>
          ) : (
            <span>{product ? 'Update' : 'Add'} Product</span>
          )}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
