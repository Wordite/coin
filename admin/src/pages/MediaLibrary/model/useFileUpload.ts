import { useState, useCallback } from 'react'
import type { MediaFile } from './api'
import { mediaAPI } from './api'

interface UploadState {
  isUploading: boolean
  progress: number
  uploadedFiles: MediaFile[]
  error: string | null
}

export const useFileUpload = (onUploadComplete?: (files: MediaFile[]) => void) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    uploadedFiles: [],
    error: null,
  })

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      uploadedFiles: [],
    }))

    let progressInterval: number | null = null

    try {
      // Simulate progress for better UX
      progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }))
      }, 200)

      // Upload files using mediaAPI
      const uploadedFiles: MediaFile[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        try {
          const uploadedFile = await mediaAPI.uploadFile(file)
          uploadedFiles.push(uploadedFile)

          // Update progress
          const fileProgress = ((i + 1) / files.length) * 90
          setUploadState(prev => ({
            ...prev,
            progress: fileProgress,
          }))
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          throw new Error(`Failed to upload ${file.name}`)
        }
      }

      if (progressInterval) {
        clearInterval(progressInterval)
      }

      // Complete upload
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedFiles,
        error: null,
      }))

      // Call callback if provided
      if (onUploadComplete) {
        onUploadComplete(uploadedFiles)
      }

      return uploadedFiles
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
      }))

      throw error
    }
  }, [onUploadComplete])

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      uploadedFiles: [],
      error: null,
    })
  }, [])

  const clearError = useCallback(() => {
    setUploadState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...uploadState,
    uploadFiles,
    resetUpload,
    clearError,
  }
} 