import React from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { blurhashToDataUri } from '@unpic/placeholder'
import { getStorageUrl } from '../../../utils/storage'
import type { Image } from '../../../types'

interface RecordImageProps {
  image?: Image | null
  className?: string
  fallbackClassName?: string
  alt?: string
  showFallback?: boolean
  fallbackIcon?: React.ReactNode
}

/**
 * RecordImage component displays an image for a record.
 * It expects the image data to be passed as a prop.
 */
const RecordImage: React.FC<RecordImageProps> = ({
  image,
  className = 'w-12 h-12 rounded-lg object-cover',
  fallbackClassName = 'w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center',
  alt = 'Record image',
  showFallback = true,
  fallbackIcon
}) => {
  const [imgLoaded, setImgLoaded] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)

  // Reset loading state when image changes
  React.useEffect(() => {
    setImgLoaded(false)
    setImageError(false)
  }, [image?.path])

  const imageUrl = image ? getStorageUrl(image.table_name, image.path) : null

  // If no image exists at all, show fallback
  if (!image || !imageUrl) {
    if (!showFallback) return null

    return (
      <div className={fallbackClassName}>
        {fallbackIcon || <ImageIcon className='w-1/2 h-1/2 text-gray-400' />}
      </div>
    )
  }

  // If image failed to load, show fallback
  if (imageError) {
    if (!showFallback) return null

    return (
      <div className={fallbackClassName}>
        {fallbackIcon || <ImageIcon className='w-1/2 h-1/2 text-gray-400' />}
      </div>
    )
  }

  return (
    <div className='relative'>
      {/* Show blurhash placeholder while loading if available */}
      {!imgLoaded && image.blurhash && (
        <img
          src={blurhashToDataUri(image.blurhash, 32, 32)}
          alt="Blurhash placeholder"
          className={className}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Show fallback icon while loading if no blurhash */}
      {!imgLoaded && !image.blurhash && (
        <div className={fallbackClassName} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          {fallbackIcon || <ImageIcon className='w-1/2 h-1/2 text-gray-400' />}
        </div>
      )}
      
      <img
        src={imageUrl}
        alt={image.alt_text || alt}
        className={className}
        style={!imgLoaded ? { opacity: 0, position: 'relative', zIndex: 2 } : { position: 'relative', zIndex: 2 }}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export default RecordImage
