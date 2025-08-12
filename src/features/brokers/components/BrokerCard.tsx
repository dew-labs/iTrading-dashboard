import React from 'react'
import { Edit2, Trash2, Eye, Building2, Calendar, MapPin } from 'lucide-react'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { stripHtmlAndTruncate } from '../../../utils'
import type { Broker, Image } from '../../../types'
import type { BrokerWithTranslations, BrokerTranslation } from '../../../types/translations'
import RecordImage from '../../../components/features/images/RecordImage'

interface BrokerCardProps {
  broker: Broker | BrokerWithTranslations
  image?: Image | null
  onView: (broker: Broker | BrokerWithTranslations) => void
  onEdit: (broker: Broker | BrokerWithTranslations) => void
  onDelete: (broker: Broker | BrokerWithTranslations) => void
}

const BrokerCard: React.FC<BrokerCardProps> = ({ broker, image, onView, onEdit, onDelete }) => {
  const { t } = usePageTranslation()

  // Helper function to get description from translations
  const getDescription = () => {
    if ('translations' in broker && broker.translations && broker.translations.length > 0) {
      // Get the first available translation (preferably English)
      const translation = broker.translations.find((t: BrokerTranslation) => t.language_code === 'en') || broker.translations[0]
      return translation?.description || null
    }
    return null
  }

  const description = getDescription()

  return (
    <div
      className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer'
      onClick={() => onView(broker)}
    >
      {/* Header with logo and actions */}
      <div className='p-6 pb-4'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              <RecordImage
                image={image || null}
                fallbackClassName='w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center'
                className='w-12 h-12 rounded-lg object-cover border border-gray-200'
                fallbackIcon={<Building2 className='w-6 h-6 text-white' />}
              />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white truncate'>
                {broker.name}
              </h3>

              <div className='space-y-1 mt-1'>
                {broker.headquarter && (
                  <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                    <MapPin className='w-4 h-4 mr-1 flex-shrink-0' />
                    <span className='truncate'>{broker.headquarter}</span>
                  </div>
                )}

                {broker.established_in && (
                  <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                    <Calendar className='w-4 h-4 mr-1 flex-shrink-0' />
                    <span>{t('brokers.est')} {broker.established_in}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex space-x-1'>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView(broker)
              }}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
              title={t('brokers.tooltips.viewBroker')}
            >
              <Eye className='w-4 h-4' />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(broker)
              }}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors'
              title={t('brokers.tooltips.editBroker')}
            >
              <Edit2 className='w-4 h-4' />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(broker)
              }}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
              title={t('brokers.tooltips.deleteBroker')}
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Description from translations */}
        {description && (
          <div className='text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mt-3'>
            {stripHtmlAndTruncate(description, 150)}
          </div>
        )}
      </div>
    </div>
  )
}

export default BrokerCard
