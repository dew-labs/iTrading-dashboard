import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'
import { Button } from '../components/atoms'
import { usePageTranslation } from '../hooks/useTranslation'

const AccountCreated: React.FC = () => {
  const navigate = useNavigate()
  const { t } = usePageTranslation()

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center'>
        {/* Success Icon */}
        <div className='w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
          <CheckCircle className='w-10 h-10 text-white' />
        </div>

        {/* Success Message */}
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
          {t('accountCreated.title')}
        </h1>
        <p className='text-gray-600 dark:text-gray-300 mb-8'>
          {t('accountCreated.description')}
        </p>

        {/* Information */}
        <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6'>
          <p className='text-sm text-green-800 dark:text-green-200'>
            {t('accountCreated.userNote')}
          </p>
        </div>

        {/* Actions */}
        <div className='space-y-3'>
          <Button
            onClick={() => window.location.href = '/'} // Navigate to main website/homepage
            variant='primary'
            size='lg'
            fullWidth
          >
            <Home className='w-4 h-4 mr-2' />
            {t('accountCreated.goToWebsite')}
          </Button>
          
          <Button
            onClick={() => navigate('/login')}
            variant='ghost'
            size='md'
            fullWidth
          >
            {t('accountCreated.backToLogin')}
            <ArrowRight className='w-4 h-4 ml-2' />
          </Button>
        </div>

        {/* Footer Note */}
        <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {t('accountCreated.footerNote')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AccountCreated