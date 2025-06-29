import React from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { useImages } from '../../hooks/useImages'
import { Modal } from '../atoms'

interface DetailViewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  tableName: string
  recordId: string
  children: React.ReactNode
}

/**
 * DetailViewModal component displays a modal with record details and associated images
 */
const DetailViewModal: React.FC<DetailViewModalProps> = ({
  isOpen,
  onClose,
  title,
  tableName,
  recordId,
  children
}) => {
  const { images, loading: imagesLoading } = useImages(tableName, recordId)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className='space-y-6'>
        {/* Record Details */}
        <div>{children}</div>

        {/* Images Section */}
        <div>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <ImageIcon className='w-5 h-5 mr-2' />
            Associated Images
          </h3>

          {imagesLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900' />
              <span className='ml-2 text-gray-600'>Loading images...</span>
            </div>
          ) : images.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {images.map(image => (
                <div key={image.id} className='space-y-2'>
                  <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
                    <img
                      src={image.image_url}
                      alt={image.alt_text || 'Record image'}
                      className='w-full h-full object-cover hover:scale-105 transition-transform duration-200'
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0EyIDIgMCAwIDAgMTkgNUg1QTIgMiAwIDAgMCAzIDdWOE0yMSA5TDEzLjUgMTUuNUMxMy4xIDEzLjMgMTEuNiAxNiA5IDE2SDdNMjEgOVYxOUEyIDIgMCAwIDEgMTkgMjFIOUMxNS40IDIxIDE5IDEyLjQgMTkgOE0zIDhWMTlBMiAyIDAgMCAwIDUgMjFIOSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K'
                      }}
                    />
                  </div>
                  {image.alt_text && (
                    <p className='text-sm text-gray-600 truncate'>{image.alt_text}</p>
                  )}
                  <div className='text-xs text-gray-400 space-y-1'>
                    {image.file_size && <div>Size: {(image.file_size / 1024).toFixed(1)} KB</div>}
                    {image.mime_type && <div>Type: {image.mime_type}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <ImageIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
              <p>No images associated with this record</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default DetailViewModal
