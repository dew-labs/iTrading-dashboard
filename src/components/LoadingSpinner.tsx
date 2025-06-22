import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'default' | 'gradient' | 'pulse' | 'creative';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  // Default border spinner (like login button)
  if (variant === 'default') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Gradient spinner with enhanced effects
  if (variant === 'gradient') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 animate-spin">
          <div className="absolute inset-1 rounded-full bg-white"></div>
        </div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 animate-pulse"></div>
      </div>
    )
  }

  // Pulse variant with multiple circles
  if (variant === 'pulse') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-ping opacity-75"></div>
        <div className="absolute inset-1 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600"></div>
      </div>
    )
  }

  // Creative multi-element spinner
  if (variant === 'creative') {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-500 border-r-cyan-500 animate-spin"></div>

        {/* Middle ring */}
        <div className="absolute inset-1 rounded-full border-3 border-transparent border-t-cyan-400 border-l-teal-400 animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }}></div>

        {/* Inner dot */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse"></div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 animate-ping"></div>
      </div>
    )
  }

  // Fallback to default border spinner
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full border-2 border-current border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export default LoadingSpinner
