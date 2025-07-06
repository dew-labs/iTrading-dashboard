import React from 'react'
import { useRecordImage } from '../../../hooks/useImages'
import { Image as ImageIcon } from 'lucide-react'
import { blurhashToDataUri } from '@unpic/placeholder'
import { getStorageUrl } from '../../../utils/storage'
import type { Image } from '../../../types'

interface RecordImageProps {
  image?: Image | null
  tableName?: string
  recordId?: string
  className?: string
  fallbackClassName?: string
  alt?: string
  showFallback?: boolean
  fallbackIcon?: React.ReactNode
}

/**
 * RecordImage component displays the first image associated with a specific record
 * from the centralized images table
 */
const RecordImage: React.FC<RecordImageProps> = ({
  image: imageProp,
  tableName,
  recordId,
  className = 'w-12 h-12 rounded-lg object-cover',
  fallbackClassName = 'w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center',
  alt = 'Record image',
  showFallback = true,
  fallbackIcon
}) => {
  const shouldFetch = !!(!imageProp && tableName && recordId)
  // Always call the hook, but only use its result if imageProp is not provided
  const recordImageResult = useRecordImage(tableName, recordId, {
    enabled: shouldFetch
  })
  const image = imageProp ?? recordImageResult.image
  const loading = imageProp ? false : recordImageResult.loading
  const error = imageProp ? null : recordImageResult.error
  const [imgLoaded, setImgLoaded] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)

  const imageUrl = image ? getStorageUrl(image.table_name, image.path) : null

  if (loading) {
    if (image?.blurhash) {
      return (
        <div className={fallbackClassName} aria-busy="true" aria-label="Loading image placeholder">
          <img
            src={blurhashToDataUri(image.blurhash, 32, 32)}
            alt="Blurhash placeholder"
            style={{ width: '100%', height: '100%', borderRadius: '0.5rem', objectFit: 'cover' }}
            aria-hidden="true"
          />
        </div>
      )
    }
    return (
      <div className={fallbackClassName} aria-busy="true" aria-label="Loading image placeholder">
        <div className='animate-pulse bg-gray-200 w-full h-full rounded-lg' />
      </div>
    )
  }

  if (error || !image || !imageUrl || imageError) {
    if (!showFallback) return null

    return (
      <div className={fallbackClassName}>
        {fallbackIcon || <ImageIcon className='w-1/2 h-1/2 text-gray-400' />}
      </div>
    )
  }

  return (
    <div className='relative'>
      {!imgLoaded && image.blurhash && (
        <img
          src={blurhashToDataUri(image.blurhash, 32, 32)}
          alt="Blurhash placeholder"
          style={{ width: '100%', height: '100%', borderRadius: '0.5rem', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
          aria-hidden="true"
        />
      )}
      <img
        src={imageUrl}
        alt={image.alt_text || alt}
        className={className}
        style={!imgLoaded && image.blurhash ? { opacity: 0, position: 'absolute', zIndex: 2 } : {}}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export default RecordImage
