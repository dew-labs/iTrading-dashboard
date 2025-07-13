import { useState, useEffect, useCallback } from 'react'

interface UseImageValidationResult {
  isValid: boolean
  isLoading: boolean
  error: string | null
  validateImage: (url: string) => Promise<boolean>
}

/**
 * Hook to validate if an image URL exists and can be loaded
 * @param initialUrl - Optional initial URL to validate
 * @returns Object with validation state and methods
 */
export const useImageValidation = (initialUrl?: string | null): UseImageValidationResult => {
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateImage = useCallback(async (url: string): Promise<boolean> => {
    if (!url || url.trim() === '') {
      setIsValid(false)
      setError(null)
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create a promise that resolves when image loads or rejects on error
      const imageExists = await new Promise<boolean>((resolve) => {
        const img = new Image()

        img.onload = () => {
          resolve(true)
        }

        img.onerror = () => {
          resolve(false)
        }

        // Set a timeout to avoid hanging
        setTimeout(() => {
          resolve(false)
        }, 10000) // 10 second timeout

        img.src = url
      })

      setIsValid(imageExists)
      if (!imageExists) {
        setError('Image could not be loaded')
      }

      return imageExists
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'Failed to validate image')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Validate initial URL on mount
  useEffect(() => {
    if (initialUrl) {
      validateImage(initialUrl)
    } else {
      setIsValid(false)
      setError(null)
    }
  }, [initialUrl, validateImage])

  return {
    isValid,
    isLoading,
    error,
    validateImage
  }
}

export default useImageValidation
