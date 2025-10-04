import { api } from '@/app/api'

export interface MediaFile {
  id: string
  createdAt: string
  updatedAt: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  width: number | null
  height: number | null
  alt: string | null
  description: string | null
}

export interface UploadResponse {
  success: boolean
  data?: MediaFile | MediaFile[]
  error?: string
}

// Utility function to build full image URLs
export const getImageUrl = (url: string): string => {
  // If URL is already absolute, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If URL starts with //, it's protocol-relative, make it absolute
  if (url.startsWith('//')) {
    return `http:${url}`
  }
  
  // Get backend URL from environment
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
  
  // Remove trailing /api or /api/ suffix if present to get base URL
  const baseUrl = backendUrl.replace(/\/api\/?$/, '')
  
  // Ensure URL starts with / if it doesn't
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  
  return `${baseUrl}${normalizedUrl}`
}

class MediaAPI {
  private baseUrl = '/media'

  async getAll(): Promise<MediaFile[]> {
    try {
      const response = await api.get<MediaFile[]>(this.baseUrl)
      return response.data
    } catch (error) {
      console.error('Error fetching media files:', error)
      throw new Error('Failed to fetch media files')
    }
  }

  async getById(id: string): Promise<MediaFile> {
    try {
      const response = await api.get<MediaFile>(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching media files:', error)
      throw new Error('Failed to fetch media file')
    }
  }

  async uploadFile(file: File): Promise<MediaFile> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<MediaFile>(`${this.baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return response.data
    } catch (error: any) {
      throw new Error('Failed to upload file')
    }
  }

  async uploadMultipleFiles(files: File[]): Promise<MediaFile[]> {
    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await api.post<MediaFile[]>(`${this.baseUrl}/upload-multiple`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return response.data
    } catch (error: any) {
      throw new Error('Failed to upload files')
    }
  }

  async deleteFile(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }
}

export const mediaAPI = new MediaAPI() 