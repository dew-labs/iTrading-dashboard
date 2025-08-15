import { supabase } from '../lib/supabase'
import { sendInvitationOTP } from './otpService'
import type { UserRole } from '../types'

/**
 * Invite a new user to the system
 * Supports all user roles including regular users
 */
export const inviteUser = async (
  email: string,
  role: UserRole = 'user',
  fullName?: string
): Promise<{success: boolean; error?: string}> => {
  try {
    // Use OTP service to send invitation with role information
    const { success, error } = await sendInvitationOTP(email, role, fullName)

    if (!success) {
      return { success: false, error: error || 'Failed to send OTP' }
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to invite user'
    return { success: false, error: errorMessage }
  }
}

/**
 * Update the authenticated user's password and full name
 * @param params.fullName - The new full name
 * @param params.password - The new password
 * @returns Success or error message
 */
export const updateUserProfile = async ({ fullName, password }: { fullName: string; password: string }): Promise<{ success: boolean; error?: string }> => {
  try {
    // Update password via Supabase Auth
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) throw passwordError;
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('User not found');
    // Update full_name in users table
    const { error: profileError } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', user.id);
    if (profileError) throw profileError;
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
};
