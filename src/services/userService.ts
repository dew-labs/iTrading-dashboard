import { supabase } from '../lib/supabase'
import type { UserRole, DatabaseUser } from '../types'

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
): Promise<{success: boolean; error?: string; tempPassword?: string}> => {
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

    if (!authData.user) {
      throw new Error('No user data returned from signup')
    }

    /**
     * Retry mechanism to handle timing gap between auth.users creation and public.users trigger
     *
     * Problem: After signup, there's a brief moment where:
     * 1. User exists in auth.users (signup successful)
     * 2. Trigger is still executing to create profile in public.users
     * 3. API call to check profile returns 406 "Not Acceptable" due to RLS policies
     *
     * Solution: Implement exponential backoff retry mechanism:
     * - Attempt 1: Wait 1000ms (1s)
     * - Attempt 2: Wait 1500ms (1.5s)
     * - Attempt 3: Wait 2250ms (2.25s)
     * - Attempt 4: Wait 3375ms (3.375s)
     * - Attempt 5: Wait 5000ms (5s - capped)
     *
     * Total wait time: ~13 seconds maximum before falling back to manual creation
     */
    const checkUserExists = async (
      userId: string,
      maxRetries: number = 5
    ): Promise<DatabaseUser | null> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

          if (!checkError && existingUser) {
            console.warn(`✅ User profile found on attempt ${attempt}`)
            return existingUser
          }

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking user existence:', checkError)
            // For non-"not found" errors, continue retrying
          }

          // Wait progressively longer between attempts (exponential backoff)
          const waitTime = Math.min(1000 * Math.pow(1.5, attempt - 1), 5000) // Cap at 5 seconds
          console.warn(
            `⏳ User profile not found on attempt ${attempt}/${maxRetries}, waiting ${waitTime}ms...`
          )

          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }
        } catch (error) {
          console.error(`Attempt ${attempt} failed:`, error)
          if (attempt === maxRetries) {
            throw error
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }

      return null
    }

    // Check if the user was created in public.users by the trigger
    const existingUser = await checkUserExists(authData.user.id)

    if (!existingUser) {
      console.warn('⚠️ Trigger failed to create user profile, creating manually...')
      // Manually create the user if trigger failed after all retries
      const { error: manualError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: email,
        role: role,
        status: 'invited',
        full_name: fullName || null
      })

      if (manualError) {
        console.error('Manual user creation failed:', manualError)
        throw new Error(`Failed to create user profile: ${manualError.message}`)
      }

      console.warn('✅ User profile created manually')
    } else if (fullName && existingUser.full_name !== fullName) {
      // Update user with additional info if needed
      await supabase
        .from('users')
        .update({
          full_name: fullName,
          status: 'invited'
        })
        .eq('id', authData.user.id)
    }

    // Grant default permissions for regular users
    await grantDefaultPermissions(authData.user.id, role)

    // Success message handled by component

    return {
      success: true,
      ...(import.meta.env.DEV && { tempPassword })
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
 * Grant default read permissions for regular users
 */
export const grantDefaultPermissions = async (
  userId: string,
  role: UserRole
): Promise<{success: boolean; error?: string}> => {
  try {
    // Only grant default permissions for regular users
    if (role !== 'user') {
      return { success: true }
    }

    // Default read permissions for all resources
    const defaultPermissions = [
      { user_id: userId, resource: 'posts', action: 'read' },
      { user_id: userId, resource: 'products', action: 'read' },
      { user_id: userId, resource: 'banners', action: 'read' },
      { user_id: userId, resource: 'users', action: 'read' },
      { user_id: userId, resource: 'notifications', action: 'read' }
    ]

    const { error } = await supabase.from('user_permissions').insert(defaultPermissions)

    if (error) throw error

    console.warn('Default read permissions granted for user:', userId)
    return { success: true }
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
