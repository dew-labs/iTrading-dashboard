import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldOff, Home, ArrowLeft, Mail } from 'lucide-react'

// Theme imports
import { getButtonClasses, getTypographyClasses, cn } from '../utils/theme'

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4'>
      <div className='max-w-lg w-full text-center'>
        <div className='mb-8'>
          <div className='mx-auto w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg'>
            <ShieldOff className='w-16 h-16 text-red-600' />
          </div>
        </div>

        <div className='mb-8'>
          <h1 className={cn(getTypographyClasses('h1'), 'text-4xl mb-4')}>Access Denied</h1>

          <p className={cn(getTypographyClasses('large'), 'mb-6')}>
            You don't have permission to access this page.
          </p>

          <p className={getTypographyClasses('muted')}>
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          <button onClick={() => navigate(-1)} className={getButtonClasses('secondary', 'lg')}>
            <ArrowLeft className='w-5 h-5 mr-2' />
            Go Back
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={getButtonClasses('primary', 'lg')}
          >
            <Home className='w-5 h-5 mr-2' />
            Go to Dashboard
          </button>
        </div>

        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
          <div className='flex items-center justify-center mb-4'>
            <Mail className='w-6 h-6 text-gray-400 mr-2' />
            <h3 className={getTypographyClasses('h3')}>Need Help?</h3>
          </div>
          <p className={getTypographyClasses('base')}>
            Contact your system administrator or reach out to{' '}
            <a
              href='mailto:support@example.com'
              className='text-gray-900 underline hover:text-gray-700 transition-colors font-medium'
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
