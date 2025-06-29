import React from 'react'
import { LoadingSpinner } from '../feedback'

interface EnhancedLoadingScreenProps {
  message?: string
  subtitle?: string
  variant?: 'default' | 'creative' | 'gradient'
}

const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({
  message = 'Loading',
  subtitle = 'Please wait while we prepare everything for you...',
  variant = 'creative'
}) => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden'>
      {/* Background animated elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 dark:from-teal-400/20 dark:to-cyan-400/20 rounded-full animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-teal-400/10 dark:from-cyan-400/20 dark:to-teal-400/20 rounded-full animate-pulse animation-delay-300'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-300/5 to-cyan-300/5 dark:from-teal-300/10 dark:to-cyan-300/10 rounded-full animate-ping animation-delay-700'></div>
      </div>

      {/* Main content */}
      <div className='text-center z-10 px-8'>
        {/* Enhanced spinner */}
        <div className='mb-8'>
          <LoadingSpinner size='xl' variant={variant} className='mx-auto' />
        </div>

        {/* Enhanced text */}
        <div className='space-y-4'>
          <h2 className='text-3xl font-semibold text-gray-800 dark:text-gray-200 animate-pulse'>
            {message}
            <span className='inline-block animate-bounce ml-1'>.</span>
            <span className='inline-block animate-bounce ml-1 animation-delay-100'>.</span>
            <span className='inline-block animate-bounce ml-1 animation-delay-200'>.</span>
          </h2>

          <p className='text-xl text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed'>{subtitle}</p>
        </div>
      </div>

      {/* Floating particles */}
      <div className='absolute inset-0 pointer-events-none'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-30 animate-float-${i + 1}`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default EnhancedLoadingScreen
