export interface Documentation {
  id: string
  title: string
  slug: string
  content: string
  description?: string
  isPublished: boolean
  order: number
  type: 'CATEGORY' | 'DOCUMENT'
  categoryId?: string
  category?: Documentation
  documents?: Documentation[]
  filePath?: string
  frontmatter?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateDocumentationDto {
  title: string
  slug: string
  content: string
  description?: string
  isPublished?: boolean
  order?: number
  type?: 'CATEGORY' | 'DOCUMENT'
  categoryId?: string
  filePath?: string
  frontmatter?: Record<string, any>
}

export interface UpdateDocumentationDto {
  title?: string
  slug?: string
  content?: string
  description?: string
  isPublished?: boolean
  order?: number
  type?: 'CATEGORY' | 'DOCUMENT'
  categoryId?: string
  filePath?: string
  frontmatter?: Record<string, any>
}

export interface CategoryConfig {
  label: string
  position: number
  link?: {
    type: 'generated-index' | 'doc'
    description?: string
    slug?: string
  }
}