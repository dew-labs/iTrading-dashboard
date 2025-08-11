import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { useTranslation } from '../../../hooks/useTranslation'
import { toast } from '../../../utils/toast'
import { FormContainer, FormErrorBanner } from '../../molecules'
import { Button } from '../../atoms'

interface AuthFormProps {
  mode: 'login'
  onToggleMode: () => void
}

const AuthForm: React.FC<AuthFormProps> = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { signIn, loading } = useAuthStore()

  // Handle success message from onboarding or other flows
  useEffect(() => {
    const state = location.state as { message?: string; email?: string } | null
    if (state?.message) {
      setSuccessMessage(state.message)
      // Pre-fill email if provided
      if (state.email) {
        setFormData(prev => ({ ...prev, email: state.email || '' }))
      }
    }
  }, [location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null) // Clear any existing errors

    try {
      const { error } = await signIn(formData.email, formData.password)
      if (error) {
        setFormError(error)
        toast.error(error)
      } else {
        toast.success(t('auth.welcomeBack'))
      }
    } catch {
      const errorMessage = t('messages.unexpectedError')
      setFormError(errorMessage)
      toast.error(errorMessage)
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

        {/* Success message from onboarding */}
        {successMessage && (
          <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6'>
            <div className='flex items-center'>
              <CheckCircle className='w-5 h-5 text-green-600 dark:text-green-400 mr-2' />
              <span className='text-sm text-green-700 dark:text-green-300'>{successMessage}</span>
            </div>
          </div>
        )}

        <FormContainer>
          {/* Display form error if any */}
          <FormErrorBanner 
            error={formError} 
            onDismiss={() => setFormError(null)}
            className='mb-6'
          />

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
                  disabled={loading}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'
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
                  disabled={loading}
                  className='w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  placeholder={t('auth.enterPassword')}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
            </div>

            <Button
              type='submit'
              variant='primary'
              loading={loading}
              loadingText={t('auth.signingIn')}
              fullWidth
              className='shadow-lg'
              {...(formError && { 'aria-describedby': 'form-error-description' })}
            >
              {t('auth.signIn')}
            </Button>
          </form>
        </FormContainer>

        <div className='mt-6 text-center'>
          <p className='text-gray-500 dark:text-gray-400 text-sm'>{t('auth.adminAccessOnly')}</p>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
