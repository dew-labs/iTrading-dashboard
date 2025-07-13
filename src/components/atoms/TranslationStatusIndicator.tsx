import React from 'react'
import { XCircle, AlertCircle, Languages } from 'lucide-react'
import Badge from './Badge'
import { useTranslation } from '../../hooks/useTranslation'
import { LANGUAGE_INFO } from '../../constants/languages'
import { cn } from '../../utils/theme'

interface TranslationStatusProps {
  hasEnglish: boolean
  hasPortuguese: boolean
  hasAnyTranslation: boolean
  totalTranslations: number
  completedTranslations: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'badges' | 'progress' | 'detailed'
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
  const { t: tCommon } = useTranslation()

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
            {tCommon('translations.notStarted')}
          </Badge>
        )}
        {hasAnyTranslation && !(hasEnglish && hasPortuguese) && (
          <Badge variant="draft" size={size === 'lg' ? 'md' : 'sm'}>
            <AlertCircle className={cn(currentSize.icon, 'mr-1')} />
            {tCommon('translations.inProgress')}
          </Badge>
        )}
      </div>
    )
  }

  // Render progress variant
  if (variant === 'progress') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex items-center gap-1">
          <div className={cn(
            'w-3 h-3 rounded-full',
            status === 'complete' ? 'bg-green-500' : status === 'partial' ? 'bg-yellow-500' : 'bg-gray-300'
          )} />
          <span className={cn(
            currentSize.text,
            status === 'complete' ? 'text-green-600' : status === 'partial' ? 'text-yellow-600' : 'text-gray-500'
          )}>
            {status === 'complete' ? tCommon('translations.completed') :
             status === 'partial' ? tCommon('translations.inProgress') :
             tCommon('translations.notStarted')}
          </span>
        </div>
        <span className={cn(currentSize.text, 'text-gray-500')}>
          {completedTranslations} {tCommon('general.of')} {totalTranslations}
        </span>
      </div>
    )
  }

  // Render detailed variant
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Languages className={cn(currentSize.icon, 'text-gray-400')} />
        <span className={cn(currentSize.text, 'font-medium text-gray-900 dark:text-white')}>
          {tCommon('translations.translationProgress')}
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
        {completedTranslations} {tCommon('general.of')} {totalTranslations} {tCommon('translations.completed').toLowerCase()}
      </div>
    </div>
  )
}

export default TranslationStatusIndicator
