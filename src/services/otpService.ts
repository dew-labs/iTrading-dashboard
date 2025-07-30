import { supabase } from '../lib/supabase'

/**
 * Send OTP to user's email for admin invitation
 */
export const sendInvitationOTP = async (
  email: string,
  role: string,
  fullName?: string
): Promise<{success: boolean; error?: string}> => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: {
          full_name: fullName,
          role,
          status: 'invited',
          invited_by: 'admin'
        }
      }
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP'
    }
  }
}

export type VerifyOTPResult =
  | { success: true; user: { id: string; email: string } }
  | { success: false; error: string }

/**
 * Verify OTP and authenticate user
 * Also updates user status from 'invited' to 'active'
 */
export const verifyOTP = async (
  email: string,
  token: string
): Promise<VerifyOTPResult> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })
    if (error) throw error
    if (!data.user || !data.user.id || !data.user.email) throw new Error('User not found')

    // Update user status from 'invited' to 'active' after successful verification
    const { error: updateError } = await supabase
      .from('users')
      .update({ status: 'active' })
      .eq('id', data.user.id)
      .eq('status', 'invited') // Only update if current status is 'invited'

    if (updateError) {
      console.error('Failed to update user status to active:', updateError)
      // Don't fail the entire verification if status update fails
      // The user can still proceed with account setup
    }

    return { success: true, user: { id: data.user.id, email: data.user.email } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid OTP code'
    }
  }
}

/**
 * Resend OTP to user
 */
export const resendOTP = async (email: string): Promise<{success: boolean; error?: string}> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend OTP'
    }
  }
}
