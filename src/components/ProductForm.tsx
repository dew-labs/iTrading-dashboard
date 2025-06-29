import React, { useState, useEffect } from 'react'
import type { Product, ProductInsert } from '../types'
import RichTextEditor from './RichTextEditor'
import MainImageUpload from './MainImageUpload'

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: ProductInsert) => void
  onCancel: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ProductInsert>({
    name: '',
    price: 0,
    description: '',
    subscription: false,
    featured_image_url: null
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        description: product.description || '',
        subscription: product.subscription,
        featured_image_url: product.featured_image_url || null
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({
        ...formData,
        [name]: checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Main image and basic info grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Main Image Upload */}
        <div className='md:col-span-1'>
          <MainImageUpload
            imageUrl={formData.featured_image_url || null}
            onChange={url => setFormData({ ...formData, featured_image_url: url })}
            bucket='products'
            folder='featured-images'
            alt='Product featured image'
            label='Featured Image'
            size='lg'
          />
        </div>

        {/* Product Details */}
        <div className='md:col-span-2 space-y-4'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Product Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent'
              required
            />
          </div>

          <div>
            <label htmlFor='price' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Price ($)
            </label>
            <input
              type='number'
              id='price'
              name='price'
              value={formData.price}
              onChange={handleChange}
              step='0.01'
              min='0'
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent'
              required
            />
          </div>
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
            onChange={handleChange}
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
        <RichTextEditor
          label='Product Description'
          content={formData.description || ''}
          onChange={description => setFormData({ ...formData, description })}
          placeholder='Describe your product in detail - features, benefits, specifications...'
          height={450}
          bucket='products'
          folder='images'
        />
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white transition-colors'
        >
          {product ? 'Update' : 'Add'} Product
        </button>
      </div>
    </form>
  )
}

export default ProductForm
