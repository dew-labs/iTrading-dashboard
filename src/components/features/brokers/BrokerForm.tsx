import React, { useState, useEffect } from 'react'
import { X, Save, Plus, AlertCircle, Building2, Calendar, MapPin } from 'lucide-react'
import type { Broker, BrokerInsert } from '../../../types'
import { RichTextEditor } from '../posts'
import { MainImageUpload } from '../images'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'

interface BrokerFormProps {
  broker?: Broker | null
  onSubmit: (data: BrokerInsert) => void
  onCancel: () => void
}

interface FormErrors {
  name?: string
  established_in?: string
  headquarter?: string
  description?: string
}

const BrokerForm: React.FC<BrokerFormProps> = ({ broker, onSubmit, onCancel }) => {
  const { t: tForm } = useFormTranslation()
  const { t } = useTranslation()

  const [formData, setFormData] = useState<BrokerInsert>({
    name: '',
    established_in: null,
    headquarter: '',
    description: '',
    logo_url: null
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (broker) {
      setFormData({
        name: broker.name,
        established_in: broker.established_in || null,
        headquarter: broker.headquarter || '',
        description: broker.description || '',
        logo_url: broker.logo_url || null
      })
    }
  }, [broker])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Broker name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Broker name must be at least 2 characters long'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Broker name must be less than 100 characters'
    }

    // Established year validation
    if (formData.established_in !== null && formData.established_in !== undefined) {
      const currentYear = new Date().getFullYear()
      if (formData.established_in < 1800) {
        newErrors.established_in = 'Year must be after 1800'
      } else if (formData.established_in > currentYear) {
        newErrors.established_in = 'Year cannot be in the future'
      }
    }

    // Headquarter validation
    if (formData.headquarter && formData.headquarter.length > 100) {
      newErrors.headquarter = 'Headquarter must be less than 100 characters'
    }

    // Description validation
    if (formData.description && formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for submission
      const submitData: BrokerInsert = {
        name: formData.name.trim(),
        established_in: formData.established_in || null,
        headquarter: formData.headquarter?.trim() || null,
        description: formData.description?.trim() || null,
        logo_url: formData.logo_url || null
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Clear errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      })
    }
  }

  const handleEstablishedYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({
      ...formData,
      established_in: value ? parseInt(value) : null
    })

    // Clear errors when user starts typing
    if (errors.established_in) {
      const newErrors = { ...errors }
      delete newErrors.established_in
      setErrors(newErrors)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Broker name field - full width for emphasis */}
      <div>
        <label htmlFor='name' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
          <Building2 className='w-4 h-4 inline mr-1' />
          {tForm('labels.name')} *
        </label>
        <input
          type='text'
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${
            errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
          } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent`}
          placeholder={tForm('placeholders.enterBrokerName')}
          disabled={isSubmitting}
        />
        {errors.name && (
          <div className='flex items-center mt-1 text-sm text-red-600'>
            <AlertCircle className='w-4 h-4 mr-1' />
            {errors.name}
          </div>
        )}
      </div>

      {/* Enhanced layout for better organization */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left column - Logo and basic info */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Logo upload section */}
          <div>
            <MainImageUpload
              label={tForm('labels.logo')}
              imageUrl={formData.logo_url || null}
              onChange={(url) => setFormData({ ...formData, logo_url: url })}
              bucket='brokers'
              folder='logos'
              size='lg'
              disabled={isSubmitting}
              recommendationText={tForm('hints.logoRecommendation')}
              alt='Broker logo'
            />
          </div>

          {/* Basic info fields */}
          <div className='space-y-4'>
            <div>
              <label htmlFor='established_in' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                <Calendar className='w-4 h-4 inline mr-1' />
                {tForm('labels.establishedYear')}
              </label>
              <input
                type='number'
                id='established_in'
                name='established_in'
                value={formData.established_in || ''}
                onChange={handleEstablishedYearChange}
                className={`w-full px-3 py-2 border ${
                  errors.established_in ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent`}
                placeholder={tForm('placeholders.enterEstablishedYear')}
                min='1800'
                max={new Date().getFullYear()}
                disabled={isSubmitting}
              />
              {errors.established_in && (
                <div className='flex items-center mt-1 text-sm text-red-600'>
                  <AlertCircle className='w-4 h-4 mr-1' />
                  {errors.established_in}
                </div>
              )}
            </div>

            <div>
              <label htmlFor='headquarter' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                <MapPin className='w-4 h-4 inline mr-1' />
                {tForm('labels.headquarter')}
              </label>
              <input
                type='text'
                id='headquarter'
                name='headquarter'
                value={formData.headquarter || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.headquarter ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent`}
                placeholder={tForm('placeholders.enterHeadquarter')}
                disabled={isSubmitting}
              />
              {errors.headquarter && (
                <div className='flex items-center mt-1 text-sm text-red-600'>
                  <AlertCircle className='w-4 h-4 mr-1' />
                  {errors.headquarter}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Description editor */}
        <div className='lg:col-span-2'>
          <RichTextEditor
            label={tForm('labels.description')}
            content={formData.description || ''}
            onChange={(description) => {
              setFormData({ ...formData, description })
              // Clear errors when user starts typing
              if (errors.description) {
                const newErrors = { ...errors }
                delete newErrors.description
                setErrors(newErrors)
              }
            }}
            placeholder={tForm('placeholders.brokerDescriptionPlaceholder')}
            error={errors.description}
            disabled={isSubmitting}
            height={500}
            bucket='brokers'
            folder='images'
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center'
          disabled={isSubmitting}
        >
          <X className='w-4 h-4 mr-2' />
          {t('actions.cancel')}
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
        >
          {isSubmitting ? (
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
