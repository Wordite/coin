import { api } from '../app/api'
import type { Documentation, CreateDocumentationDto, UpdateDocumentationDto } from '../entities/documentation'

export class DocsApi {
  async getAll(): Promise<Documentation[]> {
    const response = await api.get('/docs/content')
    return response.data
  }

  async getPublished(): Promise<Documentation[]> {
    const response = await api.get('/docs/content/public')
    return response.data
  }

  async getById(id: string): Promise<Documentation> {
    const response = await api.get(`/docs/content/${id}`)
    return response.data
  }

  async getBySlug(slug: string): Promise<Documentation> {
    const response = await api.get(`/docs/content/slug/${slug}`)
    return response.data
  }

  async create(data: CreateDocumentationDto): Promise<Documentation> {
    const endpoint = data.type === 'CATEGORY' ? '/docs/content/category' : '/docs/content/document'
    const response = await api.post(endpoint, data)
    return response.data
  }

  async update(id: string, data: UpdateDocumentationDto): Promise<Documentation> {
    const response = await api.put(`/docs/content/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/docs/content/${id}`)
    return response.data
  }

  async reorder(items: Array<{ id: string; order: number; categoryId?: string }>): Promise<void> {
    console.log('📤 Sending reorder request:', { items })
    try {
      await api.put('/docs/content/reorder', { items })
    } catch (error) {
      console.error('❌ PUT reorder failed, trying POST alternative:', error)
      // Попробуем альтернативный endpoint
      await api.post('/docs/content/reorder-alt', { items })
    }
  }

  // Синхронизировать с файловой системой
  // (Удалено из UI)

  // Двунаправленная синхронизация
  async syncBidirectional(): Promise<{ 
    message: string; 
    filesToDb: { synced: number; updated: number };
    dbToFiles: { created: number; updated: number };
  }> {
    const response = await api.post('/docs/content/sync-bidirectional')
    return response.data
  }

  async getCategories(): Promise<Documentation[]> {
    const response = await api.get('/docs/content/categories')
    return response.data
  }

  async getDocumentsByCategory(categoryId: string): Promise<Documentation[]> {
    const response = await api.get(`/docs/content/category/${categoryId}`)
    return response.data
  }

  async getFsStructure(): Promise<Record<string, Array<{ title: string; slug: string; file: string; relativePath: string }>>> {
    const response = await api.get('/docs/content/fs-structure')
    return response.data
  }

  // File-only API
  async fsReadDocument(path: string) {
    const response = await api.get('/docs/content/fs/document', { params: { path } })
    return response.data
  }
  async fsCreateDocument(payload: { categorySlug?: string | null, slug?: string, title?: string, description?: string, content?: string, published?: boolean, order?: number, extension?: '.mdx' | '.md' }) {
    const response = await api.post('/docs/content/fs/document', payload)
    return response.data
  }
  async fsUpdateDocument(payload: { relativePath: string, newCategorySlug?: string | null, newSlug?: string, title?: string, description?: string, content?: string, published?: boolean, order?: number }) {
    const response = await api.put('/docs/content/fs/document', payload)
    return response.data
  }
  async fsDeleteDocument(path: string) {
    const response = await api.delete('/docs/content/fs/document', { params: { path } })
    return response.data
  }
  async fsCreateCategory(slug: string) {
    const response = await api.post('/docs/content/fs/category', { slug })
    return response.data
  }
  async fsUpdateCategory(oldSlug: string, newSlug: string) {
    const response = await api.put('/docs/content/fs/category', { oldSlug, newSlug })
    return response.data
  }
  async fsDeleteCategory(slug: string) {
    const response = await api.delete('/docs/content/fs/category', { params: { slug } })
    return response.data
  }
}

export const docsApi = new DocsApi()