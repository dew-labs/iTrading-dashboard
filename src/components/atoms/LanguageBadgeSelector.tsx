import React from 'react'
import { LANGUAGE_INFO } from '../../constants/languages'
import type { LanguageCode } from '../../types/translations'
import { cn } from '../../utils/theme'
import { useTranslation } from '../../hooks/useTranslation'

interface LanguageBadgeSelectorProps {
  availableLanguages: LanguageCode[]
  selectedLanguage: LanguageCode
  onLanguageChange: (language: LanguageCode) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  compact?: boolean
}

const LanguageBadgeSelector: React.FC<LanguageBadgeSelectorProps> = ({
  availableLanguages,
  selectedLanguage,
  onLanguageChange,
  className = '',
  size = 'sm',
  showLabel = true,
  compact = false
}) => {
  const { t: tCommon } = useTranslation()

  if (availableLanguages.length <= 1) {
    return null
  }

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {showLabel && !compact && (
        <span className='text-sm text-gray-600 dark:text-gray-400 font-medium'>
          {tCommon('translations.availableLanguages')}:
        </span>
      )}
      <div className='flex items-center space-x-2'>
        {availableLanguages.map((langCode) => {
          const langInfo = LANGUAGE_INFO[langCode]
          const isSelected = langCode === selectedLanguage

          return (
            <button
              key={langCode}
              onClick={() => onLanguageChange(langCode)}
              className={cn(
                'inline-flex items-center rounded-full border font-medium transition-all duration-200',
                'hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1',
                size === 'sm' && 'px-3 py-1.5 text-xs',
                size === 'md' && 'px-3.5 py-2 text-xs',
                size === 'lg' && 'px-4 py-2.5 text-sm',
                isSelected
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
              title={tCommon('translations.switchToLanguage', { language: langInfo.name })}
              aria-label={tCommon('translations.switchToLanguage', { language: langInfo.name })}
              aria-pressed={isSelected}
            >
              <span className='mr-1.5'>{langInfo.flag}</span>
              {compact ? langInfo.code.toUpperCase() : langInfo.nativeName}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LanguageBadgeSelector
