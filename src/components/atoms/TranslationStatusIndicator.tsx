import React from 'react'
import { Languages, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import Badge from './Badge'
import { cn } from '../../utils/theme'
import { LANGUAGE_INFO } from '../../constants/languages'

interface TranslationStatusProps {
  hasEnglish: boolean
  hasPortuguese: boolean
  hasAnyTranslation: boolean
  totalTranslations: number
  completedTranslations: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badges' | 'compact' | 'detailed'
  className?: string
}

const TranslationStatusIndicator: React.FC<TranslationStatusProps> = ({
  hasEnglish,
  hasPortuguese,
  hasAnyTranslation,
  totalTranslations,
  completedTranslations,
  size = 'md',
  variant = 'badges',
  className = ''
}) => {
  // Determine overall translation status
  const getOverallStatus = () => {
    if (hasEnglish && hasPortuguese) return 'complete'
    if (hasAnyTranslation) return 'partial'
    return 'none'
  }

  const status = getOverallStatus()

  // Size classes
  const sizeClasses = {
    sm: {
      badge: 'text-xs px-2 py-1',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      badge: 'text-sm px-2.5 py-1',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      badge: 'text-base px-3 py-1.5',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  }

  const currentSize = sizeClasses[size]

  // Render badges variant
  if (variant === 'badges') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {hasEnglish && (
          <Badge variant="published" size={size === 'lg' ? 'md' : 'sm'}>
            <span className="mr-1">{LANGUAGE_INFO.en.flag}</span>
            EN
          </Badge>
        )}
        {hasPortuguese && (
          <Badge variant="published" size={size === 'lg' ? 'md' : 'sm'}>
            <span className="mr-1">{LANGUAGE_INFO.pt.flag}</span>
            PT
          </Badge>
        )}
        {!hasAnyTranslation && (
          <Badge variant="inactive" size={size === 'lg' ? 'md' : 'sm'}>
            <XCircle className={cn(currentSize.icon, 'mr-1')} />
            No translations
          </Badge>
        )}
        {hasAnyTranslation && !(hasEnglish && hasPortuguese) && (
          <Badge variant="draft" size={size === 'lg' ? 'md' : 'sm'}>
            <AlertCircle className={cn(currentSize.icon, 'mr-1')} />
            Partial
          </Badge>
        )}
      </div>
    )
  }

  // Render compact variant
  if (variant === 'compact') {
    const getStatusIcon = () => {
      switch (status) {
        case 'complete':
          return <CheckCircle className={cn(currentSize.icon, 'text-green-500')} />
        case 'partial':
          return <AlertCircle className={cn(currentSize.icon, 'text-yellow-500')} />
        default:
          return <XCircle className={cn(currentSize.icon, 'text-gray-400')} />
      }
    }

    return (
      <div className={cn('flex items-center gap-2', className)}>
        {getStatusIcon()}
        <div className="flex items-center gap-1">
          <span className={cn(
            'font-medium',
            currentSize.text,
            status === 'complete' ? 'text-green-600' :
            status === 'partial' ? 'text-yellow-600' :
            'text-gray-500'
          )}>
            {totalTranslations}
          </span>
          <Languages className={cn(currentSize.icon, 'text-gray-400')} />
        </div>
      </div>
    )
  }

  // Render detailed variant
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Languages className={cn(currentSize.icon, 'text-gray-400')} />
        <span className={cn(currentSize.text, 'font-medium text-gray-900 dark:text-white')}>
          Translations
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className={cn(
            'w-2 h-2 rounded-full',
            hasEnglish ? 'bg-green-500' : 'bg-gray-300'
          )} />
          <span className={cn(
            currentSize.text,
            hasEnglish ? 'text-green-600' : 'text-gray-500'
          )}>
            {LANGUAGE_INFO.en.flag} EN
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn(
            'w-2 h-2 rounded-full',
            hasPortuguese ? 'bg-green-500' : 'bg-gray-300'
          )} />
          <span className={cn(
            currentSize.text,
            hasPortuguese ? 'text-green-600' : 'text-gray-500'
          )}>
            {LANGUAGE_INFO.pt.flag} PT
          </span>
        </div>
      </div>
      <div className={cn(currentSize.text, 'text-gray-500')}>
        {completedTranslations} of {totalTranslations} complete
      </div>
    </div>
  )
}

export default TranslationStatusIndicator
