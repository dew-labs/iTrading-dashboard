import React from 'react'
import { Edit2, Trash2, Eye, Building2, Calendar, MapPin, FileText } from 'lucide-react'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { formatDateDisplay } from '../../../utils/format'
import type { Broker, Image } from '../../../types'
import RecordImage from '../../../components/features/images/RecordImage'

interface BrokerCardProps {
  broker: Broker
  image?: Image | null
  onView: (broker: Broker) => void
  onEdit: (broker: Broker) => void
  onDelete: (broker: Broker) => void
}

const BrokerCard: React.FC<BrokerCardProps> = ({ broker, image, onView, onEdit, onDelete }) => {
  const { t } = usePageTranslation()

  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden'>
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
                {broker.name || broker.headquarter || t('brokers.unknownBroker')}
              </h3>
              {broker.established_in && (
                <div className='flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  <Calendar className='w-4 h-4 mr-1' />
                  <span>
                    {t('brokers.est')} {broker.established_in}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex space-x-1'>
            <button
              onClick={() => onView(broker)}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
              title={t('brokers.tooltips.viewBroker')}
            >
              <Eye className='w-4 h-4' />
            </button>
            <button
              onClick={() => onEdit(broker)}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors'
              title={t('brokers.tooltips.editBroker')}
            >
              <Edit2 className='w-4 h-4' />
            </button>
            <button
              onClick={() => onDelete(broker)}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
              title={t('brokers.tooltips.deleteBroker')}
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Headquarter info */}
        {broker.headquarter && (
          <div className='flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3'>
            <MapPin className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
            <span>{broker.headquarter}</span>
          </div>
        )}

        {/* Description */}
        <div className='text-sm text-gray-600 dark:text-gray-300 line-clamp-3'>
          {broker.description ? (
            <div
              dangerouslySetInnerHTML={{
                __html:
                  broker.description.length > 150
                    ? broker.description.substring(0, 150) + '...'
                    : broker.description
              }}
            />
          ) : (
            <span className='italic text-gray-400 dark:text-gray-500'>{t('brokers.noDescriptionAvailable')}</span>
          )}
        </div>
      </div>

      {/* Footer with metadata */}
      <div className='px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600'>
        <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
          <div className='flex items-center'>
            <FileText className='w-3 h-3 mr-1' />
            <span>
              {t('brokers.added')} {formatDateDisplay(broker.created_at || new Date().toISOString())}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrokerCard
