import React from 'react'
import { useRecordImage } from '../../../hooks/useImages'
import { Image as ImageIcon } from 'lucide-react'
import { blurhashToDataUri } from '@unpic/placeholder'

interface RecordImageProps {
  image?: import('../../../types').Image | undefined
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
  // Always call the hook, but only use its result if imageProp is not provided
  const recordImageResult = useRecordImage(tableName!, recordId!)
  const image = imageProp ?? recordImageResult.image
  const loading = imageProp ? false : recordImageResult.loading
  const error = imageProp ? null : recordImageResult.error
  const [imgLoaded, setImgLoaded] = React.useState(false)

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

  if (error || !image) {
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
        src={image.image_url}
        alt={image.alt_text || alt}
        className={className}
        style={!imgLoaded && image.blurhash ? { opacity: 0, position: 'absolute', zIndex: 2 } : {}}
        onLoad={() => setImgLoaded(true)}
        onError={e => {
          const target = e.target as HTMLImageElement
          target.src =
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0EyIDIgMCAwIDAgMTkgNUg1QTIgMiAwIDAgMCAzIDdWOE0yMSA5TDEzLjUgMTUuNUMxMy4xIDEzLjMgMTEuNiAxNiA5IDE2SDdNMjEgOVYxOUEyIDIgMCAwIDEgMTkgMjFIOUMxNS40IDIxIDE5IDEyLjQgMTkgOE0zIDhWMTlBMiAyIDAgMCAwIDUgMjFIOSIgc3Ryb2tlPSIjNjM2MzYzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K'
        }}
      />
    </div>
  )
}

export default RecordImage
