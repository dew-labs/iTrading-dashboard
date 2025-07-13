import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { useTranslation } from '../../../hooks/useTranslation'
import { LoadingSpinner } from '../../feedback'
import { toast } from '../../../utils/toast'

interface AuthFormProps {
  mode: 'login'
  onToggleMode: () => void
}

const AuthForm: React.FC<AuthFormProps> = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, loading } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await signIn(formData.email, formData.password)
      if (error) {
        toast.error(error)
      } else {
        toast.success(t('auth.welcomeBack'))
      }
    } catch {
      toast.error(t('messages.unexpectedError'))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
            <span className='text-white font-bold text-xl'>i</span>
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>{t('auth.adminDashboard')}</h1>
          <p className='text-gray-600 dark:text-gray-300 mt-2'>{t('auth.signInToAccess')}</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6' noValidate>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              {t('auth.emailAddress')}
            </label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
                placeholder={t('auth.enterEmail')}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              {t('general.password')}
            </label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                className='w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
                placeholder={t('auth.enterPassword')}
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              >
                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg'
          >
            {loading ? (
              <div className='flex items-center space-x-2'>
                <LoadingSpinner size='sm' className='text-white' />
                <span>{t('auth.signingIn')}</span>
              </div>
            ) : (
              t('auth.signIn')
            )}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-gray-500 dark:text-gray-400 text-sm'>{t('auth.adminAccessOnly')}</p>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
