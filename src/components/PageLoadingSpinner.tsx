import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface PageLoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const PageLoadingSpinner: React.FC<PageLoadingSpinnerProps> = ({
  message = 'Loading content...',
  size = 'lg'
}) => {
  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
      <div className='text-center'>
        {/* Background decoration */}
        <div className='relative'>
          {/* Subtle background circles */}
          <div className='absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full opacity-30 animate-pulse'></div>
          <div className='absolute -bottom-8 -right-8 w-12 h-12 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full opacity-40 animate-pulse animation-delay-300'></div>

          {/* Enhanced spinner */}
          <div className='relative z-10 mb-6'>
            <LoadingSpinner size={size} variant='gradient' className='mx-auto' />
          </div>

          {/* Loading message */}
          <div className='relative z-10'>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>{message}</h3>
            <div className='flex items-center justify-center space-x-1'>
              <div className='w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-bounce'></div>
              <div className='w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-bounce animation-delay-100'></div>
              <div className='w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-bounce animation-delay-200'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageLoadingSpinner
