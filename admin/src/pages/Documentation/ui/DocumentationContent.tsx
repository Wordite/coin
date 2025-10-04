import { useState, useEffect, useCallback } from 'react'
import { useDisclosure, Button, Card, CardBody } from '@heroui/react'
import { docsApi } from '@/services/docsApi'
import { DocumentationForm } from '@/widgets/DocumentationForm'
import { Notify } from '@/services/notify'
import { DocumentationHeader } from './DocumentationHeader'
import { EmptyState } from './EmptyState'
import {
  FolderIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import type { Documentation, CreateDocumentationDto } from '@/entities/documentation'

type FsDoc = { title: string; slug: string; file: string; relativePath: string }

export const DocumentationContent: React.FC = () => {
  const [docs, setDocs] = useState<Documentation[]>([])
  const [categories, setCategories] = useState<Documentation[]>([])
  const [fsStructure, setFsStructure] = useState<Record<string, FsDoc[]>>({ root: [] })
  const [saving, setSaving] = useState(false)
  const [currentFsPath, setCurrentFsPath] = useState<string | null>(null)
  const [editingDoc, setEditingDoc] = useState<Documentation | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [formData, setFormData] = useState<CreateDocumentationDto>({
    title: '',
    slug: '',
    content: '',
    description: '',
    isPublished: true,
    order: 0,
    type: 'DOCUMENT',
  })

  useEffect(() => {
    loadDocs()
  }, [])

  const loadDocs = useCallback(async () => {
    try {
      console.log('🔄 Loading docs...')
      // Load filesystem structure (single source of truth)
      const structure = await docsApi.getFsStructure()
      setFsStructure(structure)
      // Synthesize categories from folder names so формы могли показывать список
      const syntheticCategories: Documentation[] = Object.keys(structure)
        .filter((k) => k !== 'root')
        .map(
          (slug) =>
            ({
              id: slug,
              title: slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
              slug,
              content: '',
              description: `Documents in ${slug
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())} category`,
              isPublished: true,
              order: 0,
              type: 'CATEGORY',
              createdAt: new Date(),
              updatedAt: new Date(),
            } as unknown as Documentation)
        )
      setCategories(syntheticCategories)
      setDocs([]) // DB no longer used as source
    } catch (err) {
      Notify.error('Failed to load documentation')
      console.error(err)
    }
  }, [])

  const handleCreateCategory = () => {
    setEditingDoc(null)
    setIsCreating(true)
    setFormData({
      title: '',
      slug: '',
      content: '',
      description: '',
      isPublished: true,
      order: 0,
      type: 'CATEGORY',
    })
    onOpen()
  }

  const handleCreateDocument = (categoryId?: string) => {
    setEditingDoc(null)
    setIsCreating(true)
    setFormData({
      title: '',
      slug: '',
      content: '',
      description: '',
      isPublished: true,
      order: 0,
      type: 'DOCUMENT',
      categoryId: categoryId,
    })
    onOpen()
  }

  const handleEdit = (doc: Documentation) => {
    console.log('✏️ handleEdit called for:', doc.title, doc.type)
    setEditingDoc(doc)
    setIsCreating(false)
    setFormData({
      title: doc.title,
      slug: doc.slug,
      content: doc.content,
      description: doc.description || '',
      isPublished: doc.isPublished,
      order: doc.order,
      type: doc.type,
      categoryId: doc.categoryId,
    })
    // Для файловых операций нужно найти relativePath из fsStructure
    if (doc.type === 'DOCUMENT') {
      // Ищем файл в fsStructure по slug
      for (const [categorySlug, docs] of Object.entries(fsStructure)) {
        const foundDoc = docs.find((d) => d.slug === doc.slug)
        if (foundDoc) {
          console.log('📁 Found file path:', foundDoc.relativePath)
          setCurrentFsPath(foundDoc.relativePath)
          break
        }
      }
    }
    onOpen()
  }

  const handleEditFs = (doc: Documentation, relativePath: string) => {
    setCurrentFsPath(relativePath)
    handleEdit(doc)
  }

  const handleSave = async () => {
    console.log('🚀 handleSave called!')
    try {
      setSaving(true)

      console.log('💾 Saving document:', { isCreating, editingDoc: editingDoc?.id, formData })
      console.log('🔍 Current fsPath:', currentFsPath)

      // Map categoryId -> slug
      const getCategorySlugById = (id?: string) => categories.find((c) => c.id === id)?.slug

      if (isCreating) {
        console.log('📝 Creating new item:', formData.type)
        if (formData.type === 'CATEGORY') {
          // Для категорий используем title как основу для slug (имя папки)
          const categorySlug = (formData.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
          console.log('📁 Creating category:', categorySlug)
          await docsApi.fsCreateCategory(categorySlug)
          Notify.success('Category folder created')
        } else {
          const categorySlug = getCategorySlugById(formData.categoryId)
          console.log('📄 Creating document:', {
            categorySlug,
            slug: formData.slug,
            title: formData.title,
          })
          await docsApi.fsCreateDocument({
            categorySlug: categorySlug ?? null,
            slug: formData.slug,
            title: formData.title,
            description: formData.description,
            content: formData.content,
            published: formData.isPublished,
            order: formData.order,
            extension: '.mdx',
          })
          Notify.success('Document file created')
        }
      } else if (editingDoc) {
        console.log('✏️ Updating existing item:', editingDoc.type, editingDoc.id)
        // File-only update
        if (editingDoc.type === 'CATEGORY') {
          const oldSlug = getCategorySlugById(editingDoc.id)
          // Для категорий используем title как основу для slug (имя папки)
          const newSlug = (formData.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
          if (oldSlug && newSlug && oldSlug !== newSlug) {
            await docsApi.fsUpdateCategory(oldSlug, newSlug)
          }
          Notify.success('Category updated')
        } else {
          if (!currentFsPath) {
            console.error('❌ No currentFsPath for document update')
            Notify.error('Cannot determine file path for this document')
          } else {
            console.log('📄 Updating document:', {
              currentFsPath,
              newCategorySlug: getCategorySlugById(formData.categoryId),
              newSlug: formData.slug,
              title: formData.title,
            })
            await docsApi.fsUpdateDocument({
              relativePath: currentFsPath,
              newCategorySlug: getCategorySlugById(formData.categoryId) ?? null,
              newSlug: formData.slug,
              title: formData.title,
              description: formData.description,
              content: formData.content,
              published: formData.isPublished,
              order: formData.order,
            })
            Notify.success('Document updated')
          }
        }
      }

      // Сбросить состояние формы
      setEditingDoc(null)
      setCurrentFsPath(null)
      setIsCreating(false)
      setFormData({
        title: '',
        slug: '',
        content: '',
        description: '',
        isPublished: true,
        order: 0,
        type: 'DOCUMENT',
      })

      onClose()
      loadDocs()
    } catch (err) {
      Notify.error('Failed to save documentation')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, relativePath?: string) => {
    if (!confirm('Are you sure you want to delete this documentation?')) {
      return
    }

    try {
      if (relativePath) {
        await docsApi.fsDeleteDocument(relativePath)
      } else {
        await docsApi.delete(id)
      }
      Notify.success('Deleted successfully')
      loadDocs()
    } catch (err) {
      Notify.error('Failed to delete documentation')
      console.error(err)
    }
  }

  const handleDeleteCategory = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this category folder?')) {
      return
    }
    try {
      await docsApi.fsDeleteCategory(slug)
      Notify.success('Category folder deleted')
      loadDocs()
    } catch (err) {
      Notify.error('Failed to delete category folder')
      console.error(err)
    }
  }

  // File-only actions (reserved for later manual Refresh if needed)

  // Рендерим по реальной FS-структуре, маппим на БД объекты (для id действий)
  const categoriesList = Object.keys(fsStructure).filter((k) => k !== 'root')
  const getDbCategoryBySlug = (slug: string) => categories.find((c) => c.slug === slug)
  const getDbDocBySlug = (slug: string) => undefined // DB disabled
  const documentsWithoutCategory = fsStructure.root || []

  console.log('🔍 Debug structure:', {
    totalDocs: docs.length,
    categoriesCount: categoriesList.length,
    documentsWithoutCategoryCount: documentsWithoutCategory.length,
    categories: categoriesList.map((slug) => ({
      slug,
      id: getDbCategoryBySlug(slug)?.id,
      title: getDbCategoryBySlug(slug)?.title,
      docsCount: (fsStructure[slug] || []).length,
    })),
    allDocs: docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      categoryId: doc.categoryId,
    })),
  })

  return (
    <div className='space-y-8'>
      <DocumentationHeader 
        onCreateCategory={handleCreateCategory}
        onCreateDocument={() => handleCreateDocument()}
      />

      {/* Content Section */}
      <div className='space-y-6'>
        {/* Сначала показываем категории с их документами */}
        {categoriesList.map((categorySlug) => {
          const category = getDbCategoryBySlug(categorySlug)
          const categoryDocsFs = (fsStructure[categorySlug] || []) as FsDoc[]

          return (
            <Card key={categorySlug} className='border-l-4 border-l-primary bg-content1 shadow-lg hover:shadow-xl transition-all duration-200'>
              <CardBody className='p-6'>
                {/* Заголовок категории */}
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center gap-4'>
                    <div className='p-2 bg-primary/10 rounded-lg'>
                      <FolderIcon className='w-6 h-6 text-primary' />
                    </div>
                    <div>
                      <h3 className='text-xl font-semibold text-foreground'>
                        {category?.title || categorySlug}
                      </h3>
                      <p className='text-sm text-foreground-500'>
                        {categoryDocsFs.length} document{categoryDocsFs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
      </div>

                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant='light' size='sm'>
                        <EllipsisVerticalIcon className='w-4 h-4' />
                      </Button>
                    </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key='edit'
                          startContent={<PencilIcon className='w-4 h-4' />}
                          onPress={() => category && handleEdit(category)}
                        >
                          Edit Category
                        </DropdownItem>
                        <DropdownItem
                          key='add-document'
                          startContent={<PlusIcon className='w-4 h-4' />}
                          onPress={() => handleCreateDocument(category?.id)}
                        >
                          Add Document
                        </DropdownItem>
                        <DropdownItem
                          key='delete'
                          className='text-danger'
                          color='danger'
                          startContent={<TrashIcon className='w-4 h-4' />}
                          onPress={() => handleDeleteCategory(categorySlug)}
                        >
                          Delete Category
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  {/* Документы в категории (по FS) */}
                  <div className='space-y-3'>
                    {categoryDocsFs.map((fsDoc) => (
                      <Card key={fsDoc.slug} className='ml-6 bg-content2 shadow-md hover:shadow-lg transition-all duration-200 border border-divider'>
                        <CardBody className='p-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div className='p-1.5 bg-secondary/10 rounded-md'>
                                <DocumentTextIcon className='w-4 h-4 text-secondary' />
                              </div>
                              <div>
                                <h4 className='font-medium text-foreground'>{fsDoc.title}</h4>
                                <p className='text-xs text-foreground-500'>{fsDoc.file}</p>
                              </div>
                            </div>

                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly variant='light' size='sm'>
                                  <EllipsisVerticalIcon className='w-4 h-4' />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu>
                                <>
                                  <DropdownItem
                                    key='edit-file'
                                    startContent={<PencilIcon className='w-4 h-4' />}
                                    onPress={() => {
                                      docsApi
                                        .fsReadDocument(fsDoc.relativePath)
                                        .then((data) => {
                                          // Создаем временный объект документа для редактирования
                                          const tempDoc: Documentation = {
                                            id: '', // Нет DB записи
                                            title: data.frontmatter?.title || fsDoc.title,
                                            slug: data.frontmatter?.slug || fsDoc.slug,
                                            content: data.content,
                                            description: data.frontmatter?.description || '',
                                            isPublished: data.frontmatter?.published !== false,
                                            order: data.frontmatter?.sidebar_position || 0,
                                            type: 'DOCUMENT',
                                            categoryId: categorySlug, // Используем slug категории как ID
                                            createdAt: new Date().toISOString(),
                                            updatedAt: new Date().toISOString(),
                                          }
                                          console.log('📁 Setting up edit for file in category:', {
                                            categorySlug,
                                            tempDocCategoryId: tempDoc.categoryId,
                                            relativePath: fsDoc.relativePath,
                                          })
                                          setCurrentFsPath(fsDoc.relativePath)
                                          setEditingDoc(tempDoc)
                                          setIsCreating(false)
                                          setFormData({
                                            title: tempDoc.title,
                                            slug: tempDoc.slug,
                                            content: tempDoc.content,
                                            description: tempDoc.description,
                                            isPublished: tempDoc.isPublished,
                                            order: tempDoc.order,
                                            type: 'DOCUMENT',
                                            categoryId: tempDoc.categoryId,
                                          })
                                          onOpen()
                                        })
                                        .catch(() =>
                                          Notify.error('Failed to open file for editing')
                                        )
                                    }}
                                  >
                                    Edit File
                                  </DropdownItem>
                                  <DropdownItem
                                    key='delete-file'
                                    className='text-danger'
                                    color='danger'
                                    startContent={<TrashIcon className='w-4 h-4' />}
                                    onPress={() => handleDelete('', fsDoc.relativePath)}
                                  >
                                    Delete File
                                  </DropdownItem>
                                </>
                              </DropdownMenu>
                            </Dropdown>
              </div>
            </CardBody>
          </Card>
                    ))}

                    {/* Если нет документов в категории */}
                    {categoryDocsFs.length === 0 && (
                      <div className='ml-4 p-4 text-center text-foreground-500 border border-dashed rounded-lg bg-content2/50'>
                        No documents in this category yet
                      </div>
                    )}
                </div>
              </CardBody>
            </Card>
            )
          })}

        {/* Затем показываем документы без категории */}
        {(documentsWithoutCategory?.length || 0) > 0 && (
          <Card className='bg-content1 shadow-lg hover:shadow-xl transition-all duration-200'>
            <CardBody className='p-6'>
              {/* Заголовок секции */}
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-2 bg-green-500/10 rounded-lg'>
                    <DocumentTextIcon className='w-6 h-6 text-green-500' />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-foreground'>Standalone Documents</h3>
                    <p className='text-sm text-foreground-500'>Documents not assigned to any category</p>
                  </div>
                </div>
              </div>

              {/* Документы */}
              <div className='space-y-3'>

            {(documentsWithoutCategory || []).map((fsDoc) => (
              <Card key={fsDoc.slug} className='bg-content2 shadow-md hover:shadow-lg transition-all duration-200 border border-divider'>
                <CardBody className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='p-1.5 bg-secondary/10 rounded-md'>
                        <DocumentTextIcon className='w-4 h-4 text-secondary' />
                  </div>
                  <div>
                        <h4 className='font-medium text-foreground'>{fsDoc.title}</h4>
                        <p className='text-xs text-foreground-500'>{fsDoc.file}</p>
                  </div>
                </div>

                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly variant='light' size='sm'>
                          <EllipsisVerticalIcon className='w-4 h-4' />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <>
                          <DropdownItem
                            key='edit-file'
                            startContent={<PencilIcon className='w-4 h-4' />}
                            onPress={() => {
                              docsApi
                                .fsReadDocument(fsDoc.relativePath)
                                .then((data) => {
                                  // Создаем временный объект документа для редактирования
                                  const tempDoc: Documentation = {
                                    id: '', // Нет DB записи
                                    title: data.frontmatter?.title || fsDoc.title,
                                    slug: data.frontmatter?.slug || fsDoc.slug,
                                    content: data.content,
                                    description: data.frontmatter?.description || '',
                                    isPublished: data.frontmatter?.published !== false,
                                    order: data.frontmatter?.sidebar_position || 0,
                                    type: 'DOCUMENT',
                                    categoryId: '', // Пустая строка для "No Category"
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                  }
                                  console.log('📄 Setting up edit for file without category:', {
                                    tempDocCategoryId: tempDoc.categoryId,
                                    relativePath: fsDoc.relativePath,
                                  })
                                  setCurrentFsPath(fsDoc.relativePath)
                                  setEditingDoc(tempDoc)
                                  setIsCreating(false)
                                  setFormData({
                                    title: tempDoc.title,
                                    slug: tempDoc.slug,
                                    content: tempDoc.content,
                                    description: tempDoc.description,
                                    isPublished: tempDoc.isPublished,
                                    order: tempDoc.order,
                                    type: 'DOCUMENT',
                                    categoryId: tempDoc.categoryId,
                                  })
                                  onOpen()
                                })
                                .catch(() => Notify.error('Failed to open file for editing'))
                            }}
                          >
                            Edit File
                          </DropdownItem>
                          <DropdownItem
                            key='delete-file'
                            className='text-danger'
                            color='danger'
                            startContent={<TrashIcon className='w-4 h-4' />}
                            onPress={() => handleDelete('', fsDoc.relativePath)}
                          >
                            Delete File
                          </DropdownItem>
                        </>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </CardBody>
              </Card>
            ))}
              </div>
            </CardBody>
          </Card>
        )}

        {categoriesList.length === 0 && (documentsWithoutCategory?.length || 0) === 0 && (
          <EmptyState 
            onCreateCategory={handleCreateCategory}
            onCreateDocument={() => handleCreateDocument()}
          />
        )}
      </div>

      <DocumentationForm
        isOpen={isOpen}
        onClose={onClose}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        saving={saving}
        isCreating={isCreating}
        categories={categories}
      />
    </div>
  )
}
