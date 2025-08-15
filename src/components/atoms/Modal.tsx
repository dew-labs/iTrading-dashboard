import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  disableScroll?: boolean
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg', disableScroll = false }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Small delay to ensure DOM is ready for animation
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      // Wait for animation to complete before hiding
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

  // Handle ESC key
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

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl',
    full: 'max-w-[95vw]'
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking on the backdrop, not on the modal content
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const modalContent = (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4'
      onClick={handleBackdropClick}
    >
      {/* Enhanced background overlay with smooth fade in/out */}
      <div
        className={`absolute inset-0 backdrop-blur-md bg-black/30 dark:bg-black/50 transition-all duration-200 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Modal with smooth scale and slide animation */}
            <div
        className={`relative z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full ${sizeClasses[size]} max-h-[85vh] overflow-hidden transform transition-all duration-200 ease-out ${
          isAnimating
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Sticky Header */}
          <div className='sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>{title}</h3>
              <button
                onClick={handleClose}
                className='text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-150 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 active:scale-95'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={`p-6 ${disableScroll ? 'pb-10' : 'overflow-y-auto max-h-[calc(85vh-5rem)]'}`}>{children}</div>
        </div>
    </div>
  )

  // Render modal using portal to escape parent container constraints
  return createPortal(modalContent, document.body)
}

export default Modal
