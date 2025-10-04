import { api } from '../app/api'

export interface DocFile {
  filePath: string
  title: string
  description: string
  sidebar_position: number
  content: string
  frontmatter: any
}

export interface DocCategory {
  name: string
  files: string[]
}

export interface CreateFileData {
  filePath: string
  title: string
  content: string
  description?: string
  sidebar_position?: number
  category?: string
}

export interface UpdateFileData {
  title?: string
  content?: string
  description?: string
  sidebar_position?: number
  frontmatter?: any
}

class DocsContentApiService {
  async getContent(): Promise<DocCategory[]> {
    const response = await api.get('/docs/content')
    return response.data
  }

  async getFile(filePath: string): Promise<DocFile> {
    const response = await api.get(`/docs/file/${filePath}`)
    return response.data
  }

  async createFile(data: CreateFileData): Promise<{ message: string }> {
    const response = await api.post('/docs/file', data)
    return response.data
  }

  async updateFile(filePath: string, data: UpdateFileData): Promise<{ message: string }> {
    const response = await api.put(`/docs/file/${filePath}`, data)
    return response.data
  }

  async deleteFile(filePath: string): Promise<{ message: string }> {
    const response = await api.delete(`/docs/file/${filePath}`)
    return response.data
  }

  async renameFile(filePath: string, newPath: string): Promise<{ message: string }> {
    const response = await api.post(`/docs/file/${filePath}/rename`, { newPath })
    return response.data
  }

  async moveFile(filePath: string, newCategory: string): Promise<{ message: string }> {
    const response = await api.post(`/docs/file/${filePath}/move`, { newCategory })
    return response.data
  }

  async createCategory(name: string): Promise<{ message: string }> {
    const response = await api.post('/docs/category', { name })
    return response.data
  }

  async deleteCategory(name: string): Promise<{ message: string }> {
    const response = await api.delete(`/docs/category/${name}`)
    return response.data
  }

  async renameCategory(name: string, newName: string): Promise<{ message: string }> {
    const response = await api.post(`/docs/category/${name}/rename`, { newName })
    return response.data
  }

  async rebuildDocs(): Promise<{ message: string }> {
    const response = await api.post('/docs/rebuild')
    return response.data
  }
}

export const docsContentApi = new DocsContentApiService()
