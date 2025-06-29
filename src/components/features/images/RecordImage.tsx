import React from 'react'
import { useRecordImage } from '../../../hooks/useImages'
import { Image as ImageIcon } from 'lucide-react'

interface RecordImageProps {
  tableName: string
  recordId: string
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
  tableName,
  recordId,
  className = 'w-12 h-12 rounded-lg object-cover',
  fallbackClassName = 'w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center',
  alt = 'Record image',
  showFallback = true,
  fallbackIcon
}) => {
  const { image, loading, error } = useRecordImage(tableName, recordId)

  if (loading) {
    return (
      <div className={fallbackClassName}>
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
    <img
      src={image.image_url}
      alt={image.alt_text || alt}
      className={className}
      onError={e => {
        // Hide the image if it fails to load
        const target = e.target as HTMLImageElement
        target.style.display = 'none'

        // Show fallback if parent allows it
        if (showFallback && target.parentElement) {
          const fallback = document.createElement('div')
          fallback.className = fallbackClassName

          const icon = document.createElement('div')
          if (fallbackIcon) {
            // For custom fallback icon, we'll just show the default image icon
            icon.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-1/2 h-1/2 text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>'
          } else {
            icon.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-1/2 h-1/2 text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>'
          }
          fallback.appendChild(icon)

          target.parentElement.appendChild(fallback)
        }
      }}
    />
  )
}

export default RecordImage
