import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Enhanced background overlay with better blur and gradient */}
      <div
        className='fixed inset-0 backdrop-blur-md bg-black/30 dark:bg-black/50 transition-all duration-300 ease-out'
        onClick={onClose}
      />

      {/* Modal container */}
      <div className='flex min-h-full items-center justify-center p-4'>
        {/* Modal with enhanced styling - increased to max-w-5xl for better editor space */}
        <div className='relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-5xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out scale-100'>
          {/* Sticky Header */}
          <div className='sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>{title}</h3>
              <button
                onClick={onClose}
                className='text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className='overflow-y-auto max-h-[calc(90vh-5rem)] p-6'>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
