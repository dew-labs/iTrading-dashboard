import React from 'react'
import {
  X,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Edit2
} from 'lucide-react'
import { usePageTranslation } from '../hooks/useTranslation'
import { formatDateDisplay } from '../utils/format'
import Button from './Button'
import RichTextRenderer from './RichTextRenderer'
import type { Broker } from '../types'
import { getTypographyClasses, cn } from '../utils/theme'

interface BrokerViewModalProps {
  isOpen: boolean
  onClose: () => void
  broker: Broker
  onEdit?: () => void
}

const BrokerViewModal: React.FC<BrokerViewModalProps> = ({
  isOpen,
  onClose,
  broker,
  onEdit
}) => {
  const { t } = usePageTranslation()

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Enhanced background overlay */}
      <div
        className='fixed inset-0 backdrop-blur-md bg-black/40 dark:bg-black/60 transition-all duration-300 ease-out'
        onClick={onClose}
      />

      {/* Modal container */}
      <div className='flex min-h-full items-center justify-center p-4'>
        {/* Enhanced modal with better dimensions for content reading */}
        <div className='relative bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 w-full max-w-6xl max-h-[95vh] overflow-hidden transform transition-all duration-300 ease-out scale-100'>

          {/* Enhanced Header with gradient and broker meta */}
          <div className='sticky top-0 z-10 bg-gradient-to-r from-gray-50/95 to-white/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 mr-6'>
                {/* Broker title and logo */}
                <div className='flex items-center space-x-4 mb-4'>
                  {broker.logo_url ? (
                    <img
                      src={broker.logo_url}
                      alt={`${broker.name} logo`}
                      className='w-16 h-16 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm'
                    />
                  ) : (
                    <div className='w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm'>
                      <Building2 className='w-8 h-8 text-white' />
                    </div>
                  )}
                  <div>
                    <h1 className={cn(
                      getTypographyClasses('h1'),
                      'text-2xl lg:text-3xl leading-tight text-gray-900 dark:text-white'
                    )}>
                      {broker.name}
                    </h1>
                    {broker.headquarter && (
                      <div className='flex items-center text-lg text-gray-600 dark:text-gray-400 mt-1'>
                        <MapPin className='w-5 h-5 mr-2' />
                        <span>{broker.headquarter}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Broker meta info */}
                <div className='flex flex-wrap items-center space-x-6 text-sm text-gray-600 dark:text-gray-400'>
                  {broker.established_in && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4' />
                      <span>
                        {t('brokers.est')} {broker.established_in}
                        {new Date().getFullYear() - broker.established_in > 0 &&
                          ` (${new Date().getFullYear() - broker.established_in} years)`
                        }
                      </span>
                    </div>
                  )}
                  <div className='flex items-center space-x-2'>
                    <FileText className='w-4 h-4' />
                    <span>{t('brokers.added')} {formatDateDisplay(broker.created_at || new Date().toISOString())}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className='flex items-center space-x-2'>
                {onEdit && (
                  <Button
                    variant='ghost'
                    size='sm'
                    leftIcon={Edit2}
                    onClick={onEdit}
                    className='text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                  >
                    Edit
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className='text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className='overflow-y-auto max-h-[calc(95vh-8rem)]'>
            <div className='px-8 py-6'>
              {/* Main content area - full width */}
              <div className='space-y-6'>
                {/* Logo image (larger view) */}
                {broker.logo_url && (
                  <div className='mb-8'>
                    <div className='relative group overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 p-8'>
                      <img
                        src={broker.logo_url}
                        alt={`${broker.name} logo`}
                        className='w-full max-w-md mx-auto h-48 object-contain group-hover:scale-105 transition-transform duration-500'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                    </div>
                  </div>
                )}

                {/* Broker description */}
                <div>
                  <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                    <FileText className='w-5 h-5 mr-2 text-blue-600 dark:text-blue-400' />
                      About {broker.name}
                  </h2>
                  {broker.description ? (
                    <RichTextRenderer content={broker.description} />
                  ) : (
                    <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
                      <FileText className='w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600' />
                      <p>No description available for this broker.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default BrokerViewModal
