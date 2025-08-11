import React from 'react'

interface SkeletonCardProps {
  className?: string
  showBadge?: boolean
  showTrend?: boolean
  animated?: boolean
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showBadge = true,
  showTrend = true,
  animated = true
}) => {
  const baseAnimation = animated ? 'animate-pulse' : ''

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 ${baseAnimation}`}></div>
        <div className={`h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg ${baseAnimation}`}></div>
      </div>
      
      <div className={`h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 mb-3 ${baseAnimation}`}></div>
      
      {showBadge && (
        <div className={`h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20 mb-3 ${baseAnimation}`}></div>
      )}
      
      {showTrend && (
        <div className="flex items-center space-x-2">
          <div className={`h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded ${baseAnimation}`}></div>
          <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ${baseAnimation}`}></div>
        </div>
      )}
    </div>
  )
}

export default SkeletonCard