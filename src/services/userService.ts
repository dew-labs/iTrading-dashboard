import { supabase } from '../lib/supabase'
import type { UserRole, Permission } from '../types'
import toast from 'react-hot-toast'

/**
 * Generate a secure temporary password
 */
const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

/**
 * Invite a new user to the system
 */
export const inviteUser = async (
  email: string,
  role: UserRole = 'user',
  fullName?: string
): Promise<{ success: boolean; error?: string; tempPassword?: string }> => {
  try {
    // Return the temp password for admin use
    // In production, this should be sent via email
    const tempPassword = generateTempPassword()

    // Create auth user with Supabase Admin API
    // Note: This requires service role key in production
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          full_name: fullName,
          role,
          status: 'invited'
        }
      }
    })

    if (authError) throw authError

    // The user profile will be created automatically by the database trigger
    // But we can update it with additional info if needed
    if (authData.user && fullName) {
      await supabase
        .from('users')
        .update({
          full_name: fullName,
          status: 'invited'
        })
        .eq('id', authData.user.id)
    }

    toast.success(`User invited successfully. ${import.meta.env.DEV ? `Temp password: ${tempPassword}` : 'Check email for instructions.'}`)

    return {
      success: true,
      ...(import.meta.env.DEV && { tempPassword })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to invite user'
    toast.error(errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Update user role
 */
export const updateUserRole = async (
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) throw error

    toast.success('User role updated successfully')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user role'
    toast.error(errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Grant a specific permission to a user
 */
export const grantPermission = async (
  userId: string,
  resource: string,
  action: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_permissions')
      .insert({ user_id: userId, resource, action })

    if (error) throw error

    toast.success('Permission granted successfully')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to grant permission'
    toast.error(errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Revoke a specific permission from a user
 */
export const revokePermission = async (
  userId: string,
  resource: string,
  action: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .match({ user_id: userId, resource, action })

    if (error) throw error

    toast.success('Permission revoked successfully')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to revoke permission'
    toast.error(errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Get all permissions for a user
 */
export const getUserPermissions = async (userId: string): Promise<Permission[]> => {
  try {
    // Get user's role first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Get role-based permissions
    const { data: rolePerms, error: roleError } = await supabase
      .from('role_permissions')
      .select('resource, action')
      .eq('role', userData.role)

    if (roleError) throw roleError

    // Get user-specific permissions
    const { data: userPerms, error: userError2 } = await supabase
      .from('user_permissions')
      .select('resource, action')
      .eq('user_id', userId)

    if (userError2) throw userError2

    // Combine and deduplicate permissions
    const allPermissions = [...(rolePerms || []), ...(userPerms || [])]
    const uniquePermissions = allPermissions.filter(
      (perm, index, self) =>
        index === self.findIndex(p => p.resource === perm.resource && p.action === perm.action)
    )

    return uniquePermissions
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return []
  }
}

/**
 * Bulk update user status
 */
export const bulkUpdateUserStatus = async (
  userIds: string[],
  status: 'active' | 'inactive' | 'suspended'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .in('id', userIds)

    if (error) throw error

    toast.success(`${userIds.length} users updated successfully`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update users'
    toast.error(errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Upload user avatar
 */
export const uploadUserAvatar = async (
  userId: string,
  file: File
): Promise<{ url?: string; error?: string }> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updateError) throw updateError

    toast.success('Avatar uploaded successfully')
    return { url: publicUrl }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar'
    toast.error(errorMessage)
    return { error: errorMessage }
  }
}
