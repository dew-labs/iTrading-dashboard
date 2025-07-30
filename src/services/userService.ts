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
    // Validate role - allow all valid roles
    if (!['user', 'moderator', 'admin'].includes(role)) {
      const error = 'Invalid user role specified'
      return { success: false, error }
    }

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
 * Update user role
 */
export const updateUserRole = async (
  userId: string,
  newRole: UserRole
): Promise<{success: boolean; error?: string}> => {
  try {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user role'
    return { success: false, error: errorMessage }
  }
}

/**
 * Grant default permissions based on role
 * Supports all user roles including regular users
 */
export const grantDefaultPermissions = async (
  _userId: string,
  role: UserRole
): Promise<{success: boolean; error?: string}> => {
  try {
    // All users get permissions from role_permissions table based on their role
    // This includes regular users, moderators, and admins
    if (['user', 'moderator', 'admin'].includes(role)) {
      return { success: true }
    }

    // If we reach here, it means an invalid role was provided
    return { success: false, error: 'Invalid user role specified' }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to grant default permissions'
    console.error('Error granting default permissions:', errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Bulk update user status
 */
export const bulkUpdateUserStatus = async (
  userIds: string[],
  status: 'active' | 'inactive' | 'suspended'
): Promise<{success: boolean; error?: string}> => {
  try {
    const { error } = await supabase.from('users').update({ status }).in('id', userIds)

    if (error) throw error

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update users'
    return { success: false, error: errorMessage }
  }
}

/**
 * Upload user avatar
 */
export const uploadUserAvatar = async (
  userId: string,
  file: File
): Promise<{url?: string; error?: string}> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from('users').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

    if (uploadError) throw uploadError

    // Get public URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('users').getPublicUrl(filePath)

    return { url: publicUrl }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar'
    return { error: errorMessage }
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
