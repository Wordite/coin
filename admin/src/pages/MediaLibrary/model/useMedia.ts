import { useState, useCallback, useEffect, useMemo } from 'react'
import { mediaAPI } from './api'
import type { MediaFile } from './api'

export const useMedia = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMediaFiles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const files = await mediaAPI.getAll()
      setMediaFiles(files)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media files')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadFile = useCallback(async (file: File): Promise<MediaFile | null> => {
    try {
      setError(null)
      const uploadedFile = await mediaAPI.uploadFile(file)
      setMediaFiles(prev => [uploadedFile, ...prev])
      return uploadedFile
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
      return null
    }
  }, [])

  const uploadMultipleFiles = useCallback(async (files: File[]): Promise<MediaFile[]> => {
    try {
      setError(null)
      const uploadedFiles = await mediaAPI.uploadMultipleFiles(files)
      setMediaFiles(prev => [...uploadedFiles, ...prev])
      return uploadedFiles
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files')
      return []
    }
  }, [])

  const deleteFile = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)
      await mediaAPI.deleteFile(id)
      setMediaFiles(prev => prev.filter(file => file.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file')
      return false
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Memoize the return object to prevent unnecessary re-renders
  const result = useMemo(() => ({
    mediaFiles,
    isLoading,
    error,
    fetchMediaFiles,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    clearError,
  }), [mediaFiles, isLoading, error, fetchMediaFiles, uploadFile, uploadMultipleFiles, deleteFile, clearError])

  useEffect(() => {
    fetchMediaFiles()
  }, [fetchMediaFiles])

  return result
} 