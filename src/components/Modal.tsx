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
        className='fixed inset-0 backdrop-blur-md bg-black/30 transition-all duration-300 ease-out'
        onClick={onClose}
      />

      {/* Modal container */}
      <div className='flex min-h-full items-center justify-center p-4'>
        {/* Modal with enhanced styling - increased to max-w-5xl for better editor space */}
        <div className='relative bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 w-full max-w-5xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>{title}</h3>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
