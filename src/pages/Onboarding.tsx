import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, X, AlertCircle, CheckCircle, Lock, User, Gavel } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from '../utils/toast'
import { useTranslation } from '../hooks/useTranslation'

// Components
import { FormField, Button } from '../components/atoms'

// Helper function to get role icon
const getRoleIcon = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return <Shield className='w-3 h-3 mr-1' />
    case 'moderator':
      return <Gavel className='w-3 h-3 mr-1' />
    case 'user':
    default:
      return <User className='w-3 h-3 mr-1' />
  }
}

const Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitationData, setInvitationData] = useState<{
    email?: string
    role?: string
    fullName?: string
  } | null>(null)

  // Password validation
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    matches: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  // Handle invitation authentication using Supabase's session handling
  useEffect(() => {
    const handleAuthStateChange = async () => {
      // First check if we have a current session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        setError(t('onboarding.invalidInvitationMessage'))
        return
      }

      if (session?.user) {
        // Check if this is an invitation flow
        const userData = session.user.user_metadata || {}
        const isInvitation = userData.status === 'invited' || userData.role

        if (isInvitation) {
          setInvitationData({
            email: session.user.email || '',
            role: userData.role || 'moderator',
            fullName: userData.full_name || ''
          })
        } else {
          setError(t('onboarding.invalidInvitationMessage'))
        }
      } else {
        setError(t('onboarding.invalidInvitationMessage'))
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = session.user.user_metadata || {}
        const isInvitation = userData.status === 'invited' || userData.role

        if (isInvitation) {
          setInvitationData({
            email: session.user.email || '',
            role: userData.role || 'moderator',
            fullName: userData.full_name || ''
          })
        }
      }
    })

    // Check immediately on mount
    handleAuthStateChange()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) return

    setIsLoading(true)
    setError(null)

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (updateError) {
        throw updateError
      }

      // Update user status in the users table
      const { data: user } = await supabase.auth.getUser();
      if (user?.user?.id) {
        const { error: statusError } = await supabase
          .from('users')
          .update({ status: 'active' })
          .eq('id', user.user.id);
        if (statusError) {
          // Optionally handle/log this error, but don't block the flow
          console.error('Failed to update user status:', statusError);
        }
      }

      toast.success(
        'Account Setup Complete: Your account has been successfully created. You can now sign in.'
      )

      // Sign out the user so they can sign in with their new password
      await supabase.auth.signOut()

      // Redirect to login page
      navigate('/login', {
        replace: true,
        state: {
          message: 'Account created successfully. Please sign in with your new password.',
          email: invitationData?.email
        }
      })

    } catch (error) {
      console.error('Error setting up account:', error)
      setError(error instanceof Error ? error.message : 'Failed to set up account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  if (error && !invitationData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4'>
        <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md text-center'>
          <div className='mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6'>
            <AlertCircle className='w-8 h-8 text-red-600 dark:text-red-400' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
            {t('onboarding.invalidInvitation')}
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mb-6'>{error}</p>
          <Button
            onClick={() => navigate('/login')}
            variant='primary'
            size='md'
            fullWidth
          >
            {t('onboarding.goToLogin')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg'>
            <Shield className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            {t('onboarding.title')}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            {invitationData?.fullName
              ? `Welcome, ${invitationData.fullName}! Please set your password to complete your account setup.`
              : t('onboarding.welcome')
            }
          </p>
        </div>

        {/* Invitation Details */}
        {invitationData && (
          <div className='bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Email:</span>
              <span className='text-sm text-gray-900 dark:text-white font-mono'>
                {invitationData.email}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Role:</span>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 capitalize'>
                {getRoleIcon(invitationData.role || 'user')}
                {invitationData.role}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Error Message */}
          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
              <div className='flex items-center'>
                <AlertCircle className='w-5 h-5 text-red-600 dark:text-red-400 mr-2' />
                <span className='text-sm text-red-700 dark:text-red-300'>{error}</span>
              </div>
            </div>
          )}

          {/* Password Field */}
          <FormField
            label={t('onboarding.newPassword')}
            type='password'
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder='Enter your password'
            required
            isPasswordField
            showPasswordToggle
            icon={<Lock className='w-5 h-5' />}
            size='lg'
          />

          {/* Confirm Password Field */}
          <FormField
            label={t('onboarding.confirmPassword')}
            type='password'
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder='Confirm your password'
            required
            isPasswordField
            showPasswordToggle
            icon={<Lock className='w-5 h-5' />}
            size='lg'
          />

          {/* Password Requirements */}
          <div className='bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4'>
            <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
              {t('onboarding.passwordRequirements')}
            </p>
            <div className='space-y-2'>
              <PasswordRequirement
                met={passwordValidation.minLength}
                text={t('onboarding.minLength')}
              />
              <PasswordRequirement
                met={passwordValidation.hasUppercase}
                text={t('onboarding.uppercase')}
              />
              <PasswordRequirement
                met={passwordValidation.hasLowercase}
                text={t('onboarding.lowercase')}
              />
              <PasswordRequirement
                met={passwordValidation.hasNumber}
                text={t('onboarding.number')}
              />
              <PasswordRequirement
                met={passwordValidation.matches}
                text={t('onboarding.passwordsMatch')}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type='submit'
            variant='primary'
            size='lg'
            fullWidth
            disabled={!isPasswordValid}
            loading={isLoading}
            loadingText={t('onboarding.settingUp')}
          >
            {t('onboarding.completeSetup')}
          </Button>
        </form>

        {/* Footer */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {t('onboarding.alreadyHaveAccount')}{' '}
            <button
              onClick={() => navigate('/login')}
              className='text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-medium transition-colors'
            >
              {t('onboarding.signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

// Password Requirement Component
interface PasswordRequirementProps {
  met: boolean
  text: string
}

const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ met, text }) => (
  <div className='flex items-center'>
    {met ? (
      <CheckCircle className='w-4 h-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0' />
    ) : (
      <X className='w-4 h-4 text-red-500 dark:text-red-400 mr-2 flex-shrink-0' />
    )}
    <span className={`text-sm ${met
      ? 'text-green-700 dark:text-green-300'
      : 'text-red-700 dark:text-red-300'}`}>
      {text}
    </span>
  </div>
)

export default Onboarding
