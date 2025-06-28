import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import type { Broker, BrokerInsert } from '../types'
import RichTextEditor from './RichTextEditor'
import MainImageUpload from './MainImageUpload'
import Button from './Button'
import Input from './Input'
import { useFormTranslation, useTranslation } from '../hooks/useTranslation'

interface BrokerFormProps {
  broker?: Broker | null
  onSubmit: (data: BrokerInsert) => void
  onCancel: () => void
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convert empty strings to null for optional fields
    const submittedData: BrokerInsert = {
      name: formData.name,
      established_in: formData.established_in || null,
      headquarter: formData.headquarter || null,
      description: formData.description || null,
      logo_url: formData.logo_url || null
    }
    onSubmit(submittedData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Main image and basic info grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Main Image Upload */}
        <div className='md:col-span-1'>
          <MainImageUpload
            imageUrl={formData.logo_url || null}
            onChange={url => setFormData({ ...formData, logo_url: url })}
            bucket='brokers'
            folder='logos'
            alt={tForm('labels.logo')}
            label={tForm('labels.logo')}
            size='lg'
            recommendationText={tForm('hints.logoRecommendation')}
          />
        </div>

        {/* Broker Details */}
        <div className='md:col-span-2 space-y-4'>
          <Input
            label={tForm('labels.name')}
            name='name'
            value={formData.name}
            onChange={handleChange}
            placeholder={tForm('placeholders.enterBrokerName')}
            required
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label={tForm('labels.establishedYear')}
              type='number'
              name='established_in'
              value={formData.established_in || ''}
              onChange={e =>
                setFormData({
                  ...formData,
                  established_in: e.target.value ? parseInt(e.target.value) : null
                })
              }
              placeholder={tForm('placeholders.enterEstablishedYear')}
              min='1900'
              max={new Date().getFullYear()}
            />

            <Input
              label={tForm('labels.headquarter')}
              name='headquarter'
              value={formData.headquarter || ''}
              onChange={handleChange}
              placeholder={tForm('placeholders.enterHeadquarter')}
            />
          </div>
        </div>
      </div>

      {/* Large editor section */}
      <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
        <RichTextEditor
          label={tForm('labels.description')}
          content={formData.description || ''}
          onChange={description => setFormData({ ...formData, description })}
          placeholder={tForm('placeholders.brokerDescriptionPlaceholder')}
          height={450}
          bucket='brokers'
          folder='images'
        />
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <Button type='button' variant='secondary' size='md' leftIcon={X} onClick={onCancel}>
          {t('actions.cancel')}
        </Button>
        <Button type='submit' variant='primary' size='md' leftIcon={Save}>
          {broker ? t('actions.update') : t('actions.add')} {t('entities.brokers')}
        </Button>
      </div>
    </form>
  )
}

export default BrokerForm
