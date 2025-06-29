import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldOff, Home, ArrowLeft, Mail } from 'lucide-react'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'

// Theme imports
import { getButtonClasses, getTypographyClasses, cn } from '../utils/theme'

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation()

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4'>
      <div className='max-w-lg w-full text-center'>
        <div className='mb-8'>
          <div className='mx-auto w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg'>
            <ShieldOff className='w-16 h-16 text-red-600' />
          </div>
        </div>

        <div className='mb-8'>
          <h1 className={cn(getTypographyClasses('h1'), 'text-4xl mb-4')}>{t('unauthorized.title')}</h1>

          <p className={cn(getTypographyClasses('large'), 'mb-6')}>
            {t('unauthorized.subtitle')}
          </p>

          <p className={getTypographyClasses('muted')}>
            {t('unauthorized.contactAdmin')}
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <button onClick={() => navigate(-1)} className={getButtonClasses('secondary', 'lg')}>
            <ArrowLeft className='w-5 h-5 mr-2' />
            {tCommon('actions.back')}
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={getButtonClasses('primary', 'lg')}
          >
            <Home className='w-5 h-5 mr-2' />
            {t('unauthorized.goToDashboard')}
          </button>
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
          <div className='flex items-center justify-center mb-4'>
            <Mail className='w-6 h-6 text-gray-400 mr-2' />
            <h3 className={getTypographyClasses('h3')}>{t('unauthorized.needHelp')}</h3>
          </div>
          <p className={getTypographyClasses('base')}>
            {t('unauthorized.supportText')}{' '}
            <a
              href='mailto:support@example.com'
              className='text-gray-900 underline hover:text-gray-700 transition-colors font-medium'
            >
              {t('unauthorized.supportEmail')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
