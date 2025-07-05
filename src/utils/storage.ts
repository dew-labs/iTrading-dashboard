import { supabase } from '../lib/supabase'

/**
 * Generates a public URL for a Supabase storage object.
 *
 * @param bucketName The name of the storage bucket (which should correspond to the table name).
 * @param path The path to the file within the bucket.
 * @returns The public URL for the file, or null if the path is not provided.
 */
export const getStorageUrl = (bucketName: string, path: string | null | undefined): string | null => {
  if (!path) {
    return null
  }
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
}
