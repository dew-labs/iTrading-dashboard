import { supabase, supabaseAdmin } from '../lib/supabase'
import type { UserRole } from '../types'

// No longer needed since inviteByEmail doesn't require a temporary password
// The user will set their own password when accepting the invitation

/**
 * Invite a new user to the system
 * Only moderator and admin roles are allowed
 */
export const inviteUser = async (
  email: string,
  role: UserRole = 'moderator',
  fullName?: string
): Promise<{success: boolean; error?: string}> => {
  try {
    // Validate role - only allow moderator and admin
    if (role !== 'moderator' && role !== 'admin') {
      const error = 'Only moderator and admin roles are allowed for user creation'
      return { success: false, error }
    }

    // Check if admin client is available
    if (!supabaseAdmin) {
      const error = 'Admin operations require service role key. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env.local file.'
      return { success: false, error }
    }

    // Use Supabase's inviteByEmail function to send invitation
    // This sends an email invitation to the user who must accept it to create their account
    const redirectUrl = import.meta.env.VITE_SUPABASE_INVITE_REDIRECT_URL || 'http://localhost:5173/onboarding'

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role,
        status: 'invited'
      },
      redirectTo: redirectUrl
    })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      const error = 'No user data returned from invitation'
      throw new Error(error)
    }

    // The trigger should handle creating the user profile with the available metadata
    return {
      success: true
    }
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
 * Regular users are no longer created through invite system
 */
export const grantDefaultPermissions = async (
  userId: string,
  role: UserRole
): Promise<{success: boolean; error?: string}> => {
  try {
    // Skip permission granting for invited users as they get permissions from role_permissions table
    // Regular users are no longer created through invite system
    if (role === 'moderator' || role === 'admin') {
      return { success: true }
    }

    // If we reach here, it means someone tried to create a user with 'user' role
    return { success: false, error: 'Regular users cannot be created through invite system' }
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

    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) throw updateError

    return { url: publicUrl }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar'
    return { error: errorMessage }
  }
}
