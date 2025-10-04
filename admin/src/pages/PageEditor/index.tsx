import { Button, Spinner } from '@heroui/react'
import { usePageEditorStore } from '@/app/store/pageEditor'
import { ContentEditCard } from '@/widgets/ContentEditCard'
import { PageEditorHeader } from '@/widgets/PageEditorHeader'
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { sectionApi } from '../../services/sectionApi'
import { Notify } from '../../services/notify'
import type { MediaFile } from '../MediaLibrary/model'
import type { SectionType, Section } from '../../entities/section/types'

interface ContentItem {
  type: 'content' | 'images' | 'markdown' | 'complex'
  name: string
  value?: string
  description?: string
  images?: MediaFile[]
  multiple?: boolean
  withImage?: boolean
  maxSelection?: number
  validation?: Record<string, any>
  textFieldsCount?: number
}

interface EditorSection {
  url: string
  name: string
  data: ContentItem[]
}

type SectionFromDB = Section

const PageEditor = () => {
  const { page } = useParams<{ page: string }>()
  const navigate = useNavigate()
  const { 
    content, 
    images, 
    markdown, 
    reset,
    setCurrentSection,
    setUrl,
    initializeSectionData,
    getCurrentSectionData
  } = usePageEditorStore()

  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [currentSection, setCurrentSectionState] = useState<SectionFromDB | null>(null)
  const [currentEditorSection, setCurrentEditorSection] = useState<EditorSection | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (page && sections.length > 0 && sectionTypes.length > 0) {
      handlePageChange()
    }
  }, [page, sections, sectionTypes])

  const loadData = async () => {
    try {
      const [typesData, sectionsData] = await Promise.all([
        sectionApi.getSectionTypes(),
        sectionApi.getSections()
      ])
      setSectionTypes(typesData)
      setSections(sectionsData)
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    }
  }

  const handlePageChange = () => {
    const section = sections.find(s => s.link === page)
    if (section) {
      setCurrentSectionState(section)
      const editorSection = createEditorSectionFromSection(section)
      setCurrentEditorSection(editorSection)
      setCurrentSection(editorSection)
      setUrl(editorSection.url)
      initializeSectionData(editorSection)
      setError(null)
    } else {
      setError(`Section with link "${page}" not found`)
    }
  }

  const createEditorSectionFromSection = (section: SectionFromDB): EditorSection => {
    if (!section.sectionType) {
      throw new Error('Section type not found')
    }

    const data: ContentItem[] = section.sectionType.fields.map(field => {
      const baseItem: ContentItem = {
        type: field.type.toLowerCase() as 'content' | 'images' | 'markdown' | 'complex',
        name: field.name,
        description: field.description || '',
        multiple: field.multiple,
        withImage: field.withImage,
        maxSelection: field.maxSelection,
        images: [],
        validation: field.validation || {},
        textFieldsCount: field.textFieldsCount,
      }

      if (field.type === 'CONTENT' || field.type === 'MARKDOWN') {
        baseItem.value = section.content[field.name] || field.defaultValue || ''
      }

      if (field.type === 'IMAGES') {
        baseItem.images = section.content[field.name] || []
      }

      if (field.type === 'CONTENT' && field.withImage) {
        baseItem.images = section.content[`${field.name}_images`] || []
      }

      if (field.type === 'COMPLEX') {
        // Для COMPLEX типа сохраняем массив объектов с двумя инпутами и картинкой
        const complexContent = section.content[field.name];
        if (complexContent && Array.isArray(complexContent)) {
          baseItem.value = JSON.stringify(complexContent);
        } else {
          baseItem.value = JSON.stringify([]);
        }
      }

      return baseItem
    })

    return {
      url: section.link,
      name: section.name,
      data
    }
  }

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    
    if (currentEditorSection) {
      setCurrentEditorSection({
        ...currentEditorSection,
        url: newUrl
      })
    }
    
    Notify.success(`URL changed to: ${newUrl}`)
    Notify.info('URL will be saved when you click "Save Section"')
  }

  const handleSectionNameChange = (newName: string) => {
    if (!currentEditorSection) return
    
    setCurrentEditorSection(prev => prev ? { ...prev, name: newName } : null)
    
    // Update the store's current section as well
    const updatedEditorSection = { ...currentEditorSection, name: newName }
    setCurrentSection(updatedEditorSection)
    
    Notify.success(`Section name changed to: ${newName}`)
    Notify.info('Section name will be saved when you click "Save Section"')
  }

  const handleSaveSection = async () => {
    if (!currentEditorSection || !currentSection?.sectionTypeId) return

    console.log('PageEditor: handleSaveSection called')
    
    try {
      setLoading(true)
      
      // Подготовка данных для сохранения
      
      const contentData: Record<string, any> = {}

      currentEditorSection.data.forEach(item => {
        if (item.type === 'images') {
          contentData[item.name] = images[item.name] || []
        } else if (item.type === 'content' && item.withImage) {
          contentData[item.name] = content[item.name] || ''
          contentData[`${item.name}_images`] = images[`${item.name}_images`] || []
        } else if (item.type === 'content') {
          contentData[item.name] = content[item.name] || ''
        } else if (item.type === 'markdown') {
          contentData[item.name] = markdown[item.name] || ''
        } else if (item.type === 'complex') {

          const complexData = content[item.name];
          if (complexData && typeof complexData === 'string') {
            try {
              contentData[item.name] = JSON.parse(complexData);
            } catch (e) {
              console.error('Failed to parse complex field data:', e);
              contentData[item.name] = [];
            }
          } else {
            contentData[item.name] = complexData || [];
          }
        }
      })



      const sectionData = {
        name: currentEditorSection.name,
        link: currentEditorSection.url,
        content: contentData,
        sectionTypeId: currentSection.sectionTypeId
      }

      await sectionApi.updateSection(currentSection.id, sectionData)
      
      Notify.success('Section saved successfully!')
      
      await loadData()
    } catch (err) {
      console.error('PageEditor: Error saving section:', err)
      setError('Failed to save section')
      
      Notify.error('Failed to save section. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentSectionData = getCurrentSectionData()

  if (error) {
    return (
      <section className='dark bg-background text-foreground min-h-screen p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-6">Section Not Found</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <Button
              color="primary"
              onPress={() => navigate('/contents')}
            >
              Back to Contents
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (!currentEditorSection) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <section className='dark bg-background text-foreground min-h-screen p-6 space-y-8'>
      <div className='max-w-7xl mx-auto'>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Page Editor</h1>
            <p className="text-gray-400 mt-2">
              Edit your website content and images here. All changes will be saved automatically.
            </p>
          </div>
          <Button
            color="primary"
            variant="flat"
            onPress={() => navigate('/contents')}
          >
            Back to Contents
          </Button>
        </div>

        <PageEditorHeader 
          content={content}
          testDataLength={currentSectionData.length}
          images={images}
          markdown={markdown}
          sectionName={currentEditorSection?.name || ''}
          onSave={handleSaveSection}
          onReset={reset}
          onUrlChange={handleUrlChange}
          onSectionNameChange={handleSectionNameChange}
        />
        
        <div className='space-y-6'>
          {currentSectionData.map((item, index) => (
            <ContentEditCard
              key={index}
              item={item}
              content={content}
              images={images}
              markdown={markdown}
              index={index}
            />
          ))}
        </div>

        <div className='flex gap-6 pt-8'>
          <Button
            color='success'
            size='lg'
            className='px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300 bg-success-600 text-black'
            startContent={
              loading ? <Spinner size="sm" /> : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )
            }
            onPress={handleSaveSection}
            isDisabled={loading}
          >
            {loading ? 'Saving...' : 'Save Section'}
          </Button>
          <Button
            color='default'
            size='lg'
            className='px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300 bg-default-700 text-default-100 border border-default-600'
            variant='bordered'
            startContent={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
            onPress={reset}
          >
            Reset to Default
          </Button>
        </div>
      </div>
    </section>
  )
}

export { PageEditor }
