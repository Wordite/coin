import type { MediaFile } from '@/pages/MediaLibrary/model'
import { create } from 'zustand'

interface ContentItem {
  type: 'content' | 'images' | 'markdown' | 'complex'
  name: string
  value?: string
  description?: string
  images?: MediaFile[]
  multiple?: boolean
  maxSelection?: number
  withImage?: boolean
  validation?: Record<string, any>
}

interface Section {
  url: string
  name: string
  data: ContentItem[]
}

interface PageEditorState {
  // Data structure
  sections: Section[]
  currentSection: Section | null
  
  // Content data - now properly structured
  content: Record<string, string> // For text content
  images: Record<string, MediaFile[]> // For image content
  markdown: Record<string, string> // For markdown content
  
  // API configuration
  url: string
  
  // Actions
  setSections: (sections: Section[]) => void
  setCurrentSection: (section: Section) => void
  
  // Content management actions
  setContentField: (fieldName: string, value: string) => void
  setImageField: (fieldName: string, images: MediaFile[]) => void
  setMarkdownField: (fieldName: string, value: string) => void
  
  // Legacy actions for backward compatibility
  setContent: (content: Record<string, any>) => void
  setImages: (images: Record<string, MediaFile[]>) => void
  setMarkdown: (markdown: string) => void
  
  setUrl: (url: string) => void
  
  // Data operations
  exportData: () => void
  reset: () => void
  
  // Computed values - now based on actual data state
  getCurrentSectionData: () => ContentItem[]
  getCompletionPercentage: () => number
  getCompletedFields: () => number
  getTotalFields: () => number
  
  // Helper methods for content management
  initializeSectionData: (section: Section) => void
  isFieldCompleted: (fieldName: string, item: ContentItem) => boolean
}

export const usePageEditorStore = create<PageEditorState>((set, get) => ({
  sections: [],
  currentSection: null,
  content: {},
  images: {},
  markdown: {},
  url: '',
  
  setSections: (sections: Section[]) => set({ sections }),
  setCurrentSection: (section: Section) => set({ currentSection: section }),
  
  // New content management actions
  setContentField: (fieldName: string, value: string) => {
    set((state) => ({
      content: { ...state.content, [fieldName]: value }
    }))
  },
  
  setImageField: (fieldName: string, images: MediaFile[]) => {
    set((state) => ({
      images: { ...state.images, [fieldName]: images }
    }))
  },
  
  setMarkdownField: (fieldName: string, value: string) => {
    set((state) => ({
      markdown: { ...state.markdown, [fieldName]: value }
    }))
  },
  
  // Legacy actions for backward compatibility
  setContent: (content: Record<string, any>) => set((state) => ({ 
    content: { ...state.content, ...content } 
  })),
  setImages: (images: Record<string, MediaFile[]>) => set((state) => ({ 
    images: { ...state.images, ...images } 
  })),
  setMarkdown: (markdown: string) => set({ markdown: { default: markdown } }),
  
  setUrl: (url: string) => set({ url }),
  
  exportData: () => {
    const { content, images, markdown, currentSection } = get()
    const exportData = {
      section: currentSection,
      content,
      images,
      markdown,
      exportDate: new Date().toISOString(),
      totalFields: currentSection?.data.length || 0,
      completedFields: get().getCompletedFields()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `page-editor-${currentSection?.url || 'data'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  },
  
  reset: () => set((state) => {
    // Если есть текущая секция, сбрасываем данные к значениям по умолчанию
    if (state.currentSection) {
      const newContent: Record<string, string> = {}
      const newImages: Record<string, MediaFile[]> = {}
      const newMarkdown: Record<string, string> = {}
      
      state.currentSection.data.forEach((item) => {
        if (item.type === 'content') {
          // Для content полей загружаем значение по умолчанию из item.value
          if (item.value) {
            newContent[item.name] = item.value
          }
          // Для content полей с withImage загружаем изображения по умолчанию
          if (item.withImage && item.images) {
            newImages[`${item.name}_images`] = item.images
          }
        } else if (item.type === 'images') {
          // Для IMAGES полей загружаем изображения по умолчанию
          if (item.images) {
            newImages[item.name] = item.images
          }
        } else if (item.type === 'markdown') {
          // Для markdown полей загружаем значение по умолчанию
          if (item.value) {
            newMarkdown[item.name] = item.value
          }
              } else if (item.type === 'complex') {
        // Для complex полей загружаем значение по умолчанию
        if (item.value) {
          newContent[item.name] = item.value
        }
      }
      })
      
      return {
        content: newContent,
        images: newImages,
        markdown: newMarkdown
      }
    }
    
    // Если нет текущей секции, просто очищаем данные
    return {
      content: {},
      images: {},
      markdown: {}
    }
  }),
  
  getCurrentSectionData: () => {
    const { currentSection } = get()
    return currentSection?.data || []
  },
  
  getTotalFields: () => {
    const { currentSection } = get()
    return currentSection?.data?.length || 0
  },
  
  getCompletedFields: () => {
    const { content, images, markdown, currentSection } = get()
    if (!currentSection?.data) return 0
    
    let completedCount = 0
    
    currentSection.data.forEach((item) => {
      if (get().isFieldCompleted(item.name, item)) {
        completedCount++
      }
    })
    
    return completedCount
  },
  
  getCompletionPercentage: () => {
    const totalFields = get().getTotalFields()
    const completedFields = get().getCompletedFields()
    
    if (totalFields === 0) return 0
    return Math.round((completedFields / totalFields) * 100)
  },
  
  // Helper methods
  initializeSectionData: (section: Section) => {
    const newContent: Record<string, string> = {}
    const newImages: Record<string, MediaFile[]> = {}
    const newMarkdown: Record<string, string> = {}
    
    section.data.forEach((item) => {
      if (item.type === 'content') {
        // Для content полей загружаем значение из item.value
        if (item.value) {
          newContent[item.name] = item.value
        }
        // Для content полей с withImage загружаем изображения из item.images
        if (item.withImage && item.images) {
          newImages[`${item.name}_images`] = item.images
        }
      } else if (item.type === 'images') {
        // Для IMAGES полей загружаем изображения из item.images
        if (item.images) {
          newImages[item.name] = item.images
        }
      } else if (item.type === 'markdown') {
        // Для markdown полей загружаем значение из item.value
        if (item.value) {
          newMarkdown[item.name] = item.value
        }
      } else if (item.type === 'complex') {
        // Для complex полей загружаем значение из item.value
        if (item.value) {
          newContent[item.name] = item.value
        }
      }
    })
    
    set({
      content: newContent,
      images: newImages,
      markdown: newMarkdown
    })
  },
  
  isFieldCompleted: (fieldName: string, item: ContentItem) => {
    const { content, images, markdown } = get()
    
    switch (item.type) {
      case 'content':
        if (item.withImage) {
          // Для content полей с withImage проверяем и текст, и изображения
          const hasText = !!(content[fieldName] && content[fieldName].trim().length > 0)
          const hasImages = !!(images[`${fieldName}_images`] && images[`${fieldName}_images`].length > 0)
          return hasText || hasImages // Поле считается заполненным, если есть текст ИЛИ изображения
        }
        // Для обычных content полей проверяем только текст
        return !!(content[fieldName] && content[fieldName].trim().length > 0)
      case 'images':
        return !!(images[fieldName] && images[fieldName].length > 0)
      case 'markdown':
        return !!(markdown[fieldName] && markdown[fieldName].trim().length > 0)
      case 'complex':
        // Для complex полей проверяем, есть ли данные в content
        const complexData = content[fieldName];
        if (complexData && typeof complexData === 'string') {
          try {
            const parsed = JSON.parse(complexData);
            return Array.isArray(parsed) && parsed.length > 0;
          } catch (e) {
            return false;
          }
        }
        return false;
      default:
        return false
    }
  }
}))
