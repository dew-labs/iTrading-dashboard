import type { Image } from '../types/images'

/**
 * Groups images by table_name and record_id for efficient lookup.
 *
 * @param images Array of images to group
 * @returns Nested object: { [table_name]: { [record_id]: Image[] } }
 */
export function groupImagesByRecord(images: Image[]): Record<string, Record<string, Image[]>> {
  return images.reduce((acc, img) => {
    if (typeof img.table_name !== 'string' || typeof img.record_id !== 'string') return acc
    if (!acc[img.table_name]) acc[img.table_name] = {}
    if (!acc[img.table_name]![img.record_id]) acc[img.table_name]![img.record_id] = []
    acc[img.table_name]![img.record_id]!.push(img)
    return acc
  }, {} as Record<string, Record<string, Image[]>>)
}
