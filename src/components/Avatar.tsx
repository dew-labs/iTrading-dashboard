import React from 'react'
import { User } from 'lucide-react'
import { cn } from '../utils/theme'

interface AvatarProps {
  /** Avatar image URL */
  src?: string | null
  /** Alt text for the avatar */
  alt?: string
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Fallback text (usually initials) */
  fallback?: string
  /** Whether the avatar should be clickable */
  clickable?: boolean
  /** Additional CSS classes */
  className?: string
  /** Online status indicator */
  showOnline?: boolean
  /** Custom ring color */
  ringColor?: string
  /** Custom background gradient for fallback */
  fallbackGradient?: string
  /** Square instead of circle */
  square?: boolean
  /** Click handler */
  onClick?: () => void
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  fallback,
  clickable = false,
  className = '',
  showOnline = false,
  ringColor = 'ring-white',
  fallbackGradient = 'from-teal-500 via-cyan-500 to-blue-500',
  square = false,
  onClick
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-xl'
  }

  const ringClasses = {
    xs: 'ring-1',
    sm: 'ring-1',
    md: 'ring-2',
    lg: 'ring-3',
    xl: 'ring-4'
  }

  const onlineIndicatorClasses = {
    xs: 'w-1.5 h-1.5 -bottom-0 -right-0',
    sm: 'w-2 h-2 -bottom-0 -right-0',
    md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
    lg: 'w-4 h-4 -bottom-1 -right-1',
    xl: 'w-5 h-5 -bottom-1 -right-1'
  }

  const baseClasses = cn(
    sizeClasses[size],
    square ? 'rounded-lg' : 'rounded-full',
    'object-cover shadow-lg',
    ringClasses[size],
    ringColor,
    'transition-all duration-300',
    clickable && 'cursor-pointer transform hover:scale-110 hover:shadow-xl',
    className
  )

  const fallbackClasses = cn(
    sizeClasses[size],
    square ? 'rounded-lg' : 'rounded-full',
    'bg-gradient-to-br',
    fallbackGradient,
    'flex items-center justify-center shadow-lg',
    ringClasses[size],
    ringColor,
    'transition-all duration-300',
    clickable && 'cursor-pointer transform hover:scale-110 hover:shadow-xl',
    className
  )

  const handleClick = () => {
    if (clickable && onClick) {
      onClick()
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide the broken image and show fallback
    const target = e.target as HTMLImageElement
    target.style.display = 'none'
    const parent = target.parentElement
    if (parent) {
      const fallbackDiv = document.createElement('div')
      fallbackDiv.className = fallbackClasses

      if (fallback) {
        fallbackDiv.innerHTML = `<span class="text-white font-bold tracking-wide">${fallback}</span>`
      } else {
        fallbackDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="text-white ${
          size === 'xs' ? 'w-3 h-3'
            : size === 'sm' ? 'w-4 h-4'
              : size === 'md' ? 'w-5 h-5'
                : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'
        }"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>`
      }

      if (clickable && onClick) {
        fallbackDiv.addEventListener('click', onClick)
      }

      parent.appendChild(fallbackDiv)
    }
  }

  return (
    <div className='relative flex-shrink-0' onClick={handleClick}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={baseClasses}
          onError={handleImageError}
        />
      ) : (
        <div className={fallbackClasses}>
          {fallback ? (
            <span className='text-white font-bold tracking-wide'>{fallback}</span>
          ) : (
            <User className={`text-white ${
              size === 'xs' ? 'w-3 h-3'
                : size === 'sm' ? 'w-4 h-4'
                  : size === 'md' ? 'w-5 h-5'
                    : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'
            }`} />
          )}
        </div>
      )}

      {/* Online indicator */}
      {showOnline && (
        <div className={cn(
          'absolute bg-green-400 border-2 border-white rounded-full shadow-sm',
          onlineIndicatorClasses[size]
        )}>
          <div className='absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75'></div>
          <div className='relative w-full h-full bg-green-400 rounded-full'></div>
        </div>
      )}
    </div>
  )
}

export default Avatar
