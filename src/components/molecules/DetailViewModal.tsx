import React from 'react'
import { ImageIcon } from 'lucide-react'
import { Modal } from '../atoms'
import { useImages } from '../../hooks/useImages'
import { useTranslation } from '../../hooks/useTranslation'

interface DetailViewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  tableName: string
  recordId: string
  children: React.ReactNode
}

const DetailViewModal: React.FC<DetailViewModalProps> = ({
  isOpen,
  onClose,
  title,
  tableName: _tableName,
  recordId,
  children
}) => {
  const { t } = useTranslation()
  const { images } = useImages()

  // Find images for this record
  const recordImages = images?.filter(
    (image) => image.record_id === recordId
  ) || []

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size='lg'>
      <div className='space-y-6'>
        {/* Record details */}
        <div>{children}</div>

        {/* Images section */}
        <div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            {t('entities.images')}
          </h3>
          {recordImages.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
              {recordImages.map((image) => (
                <div key={image.id} className='relative group'>
                  <div className='w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 group-hover:shadow-lg transition-shadow duration-200 flex items-center justify-center'>
                    <ImageIcon className='w-8 h-8 text-gray-400' />
                  </div>
                  <div className='absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs'>
                    {image.type || 'image'}
                  </div>
                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-2 rounded-b-lg'>
                    <div className='text-xs truncate'>
                      {image.path.split('/').pop()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <ImageIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
              <p>{t('messages.noImagesAssociated')}</p>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className='flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors'
          >
            {t('actions.close')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DetailViewModal
