import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, Link, Edit2, Image as ImageIcon } from 'lucide-react'
import { Button, Badge } from '../../atoms'
import type { Banner, Image } from '../../../types'
import { getTypographyClasses, cn } from '../../../utils/theme'
import RecordImage from '../images/RecordImage'
import { useTranslation } from '../../../hooks/useTranslation'

interface BannerViewModalProps {
  isOpen: boolean
  onClose: () => void
  banner: Banner
  image?: Image | null
  onEdit?: () => void
}

const BannerViewModal: React.FC<BannerViewModalProps> = ({
  isOpen,
  onClose,
  banner,
  image,
  onEdit
}) => {
  const { t: tCommon } = useTranslation()

  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      setTimeout(() => setIsVisible(false), 200)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 200)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleClose])

  if (!isVisible) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const modalContent = (
    <div className='fixed inset-0 z-[100] overflow-y-auto'>
      <div
        className={`fixed inset-0 backdrop-blur-md bg-black/40 dark:bg-black/60 transition-all duration-200 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      <div className='flex min-h-full items-center justify-center p-4'>
        <div className={`relative bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 w-full max-w-4xl max-h-[95vh] overflow-hidden transform transition-all duration-200 ease-out ${
          isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}>
          <div className='sticky top-0 z-10 bg-gradient-to-r from-gray-50/95 to-white/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 mr-6'>
                <h1
                  className={cn(
                    getTypographyClasses('h1'),
                    'text-2xl leading-tight text-gray-900 dark:text-white mb-2'
                  )}
                >
                  {banner.name}
                </h1>
                <div className='flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400'>
                  <Badge
                    variant={banner.is_visible ? 'active' : 'inactive'}
                    size='sm'
                    showIcon
                  >
                    {tCommon(banner.is_visible ? 'status.active' : 'status.inactive')}
                  </Badge>
                  {banner.target_url && (
                    <div className='flex items-center'>
                      <Link className='w-4 h-4 mr-2' />
                      <a
                        href={banner.target_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hover:underline'
                      >
                        {banner.target_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

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
                  onClick={handleClose}
                  className='text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>
            </div>
          </div>

          <div className='overflow-y-auto max-h-[calc(95vh-8rem)]'>
            <div className='px-8 py-6'>
              <div className='space-y-6'>
                <RecordImage
                  image={image || null}
                  fallbackClassName='w-full h-48 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-inner'
                  className='w-full rounded-xl object-contain'
                  fallbackIcon={<ImageIcon className='w-12 h-12 text-gray-400' />}
                  alt={`Banner for ${banner.name}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default BannerViewModal
