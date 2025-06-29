import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from './useTranslation'
import { toast } from '../utils/toast'

interface UseChangePasswordReturn {
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

/**
 * Custom hook for handling password changes
 * Provides loading states and error handling
 */
export const useChangePassword = (): UseChangePasswordReturn => {
  const { t } = useTranslation()
  const { changePassword: authChangePassword } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)

    try {
      const { error } = await authChangePassword(newPassword)

      if (error) {
        toast.error(error)
        return { success: false, error }
      }

      toast.success(t('forms.changePassword.successMessage'))
      return { success: true }
    } catch (error) {
      const errorMessage = 'Failed to change password. Please try again.'
      console.error('Password change error:', error)
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    changePassword,
    loading
  }
}
