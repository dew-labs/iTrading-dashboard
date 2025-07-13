import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, LANGUAGE_INFO, type LanguageCode } from '../../constants/languages'

interface LanguageSelectorProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showFlag?: boolean
  showText?: boolean
  variant?: 'default' | 'compact'
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  size = 'md',
  showFlag = true,
  showText = true,
  variant = 'default'
}) => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = LANGUAGE_INFO[i18n.language as LanguageCode] || LANGUAGE_INFO.en

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = async (languageCode: LanguageCode) => {
    try {
      await i18n.changeLanguage(languageCode)
      setIsOpen(false)
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  // Size classes
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1.5 text-sm',
      dropdown: 'w-40',
      flag: 'text-sm',
      text: 'text-sm'
    },
    md: {
      button: 'px-3 py-2 text-sm',
      dropdown: 'w-44',
      flag: 'text-base',
      text: 'text-sm'
    },
    lg: {
      button: 'px-4 py-2.5 text-base',
      dropdown: 'w-48',
      flag: 'text-lg',
      text: 'text-base'
    }
  }

  const currentSize = sizeClasses[size]

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${currentSize.button}`}
          title={`Switch to ${currentLanguage.name}`}
        >
          <Globe className='w-5 h-5 text-gray-600 dark:text-gray-300' />
        </button>

        {isOpen && (
          <div className={`absolute right-0 mt-2 ${currentSize.dropdown} bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50`}>
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  language.code === currentLanguage.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className={`${currentSize.flag} mr-3`}>{language.flag}</span>
                <span className={`${currentSize.text} font-medium`}>{language.nativeName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${currentSize.button} group`}
        title={`Current language: ${currentLanguage.name}`}
      >
        {showFlag && (
          <span className={`${currentSize.flag}`}>{currentLanguage.flag}</span>
        )}
        {showText && (
          <span className={`${currentSize.text} font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors`}>
            {currentLanguage.nativeName}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-all duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300 ${
            isOpen ? 'rotate-180 text-blue-500' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 ${currentSize.dropdown} bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50`}>
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                language.code === currentLanguage.code
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className={`${currentSize.flag} mr-3`}>{language.flag}</span>
              <div className='flex-1'>
                <span className={`${currentSize.text} font-medium block`}>{language.nativeName}</span>
                <span className='text-xs text-gray-500 dark:text-gray-400'>{language.name}</span>
              </div>
              {language.code === currentLanguage.code && (
                <div className='w-2 h-2 bg-blue-500 rounded-full ml-2'></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
