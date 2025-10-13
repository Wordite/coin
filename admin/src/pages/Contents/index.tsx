import React, { useState, useEffect } from 'react'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react'
import { sectionApi } from '../../services/sectionApi'
import { Notify } from '../../services/notify'
import type { Section, SectionType } from '../../entities/section/types'
import { useNavigate } from 'react-router'

const Contents: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([])
  const [sectionTypes, setSectionTypes] = useState<SectionType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSectionType, setSelectedSectionType] = useState<SectionType | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [sectionsData, typesData] = await Promise.all([
        sectionApi.getSections(),
        sectionApi.getSectionTypes(),
      ])

      console.log('Loaded sections:', sectionsData)
      console.log('Loaded section types:', typesData)

      setSections(sectionsData)
      setSectionTypes(typesData)
    } catch (err) {
      Notify.error('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) {
      return
    }

    try {
      await sectionApi.deleteSection(id)
      Notify.success('Section deleted successfully')
      loadData()
    } catch (err: any) {
      console.error('Delete error details:', err)

      // Показываем более детальную информацию об ошибке
      if (err.response?.data?.message) {
        Notify.error(`Delete failed: ${err.response.data.message}`)
      } else if (err.message) {
        Notify.error(`Delete failed: ${err.message}`)
      } else {
        Notify.error('Failed to delete section')
      }

      console.error(err)
    }
  }

  const getSectionTypeColor = (sectionTypeId?: string) => {
    if (!sectionTypeId) return 'default'
    const type = sectionTypes.find((t) => t.id === sectionTypeId)
    if (!type) return 'default'

    return type.color || 'default'
  }

  const handleEditSection = (section: Section) => {
    // Переходим в PageEditor для редактирования этой секции
    navigate(`/page-editor/${section.link}`)
  }

  const handleCreateSection = async () => {
    if (!selectedSectionType) return

    try {
      setIsCreating(true)

      // Создаем новую секцию с базовыми данными
      const newSection = await sectionApi.createSection({
        name: `${selectedSectionType.name} Section`,
        link: `${selectedSectionType.name.toLowerCase().replace(/\s+/g, '-')}-section`,
        content: {},
        sectionTypeId: selectedSectionType.id,
      })

      Notify.success('Section created successfully!')

      // Закрываем модальное окно и обновляем данные
      onOpenChange()
      setSelectedSectionType(null)
      await loadData()

      // Переходим к редактированию новой секции
      navigate(`/page-editor/${newSection.link}`)
    } catch (err: any) {
      console.error('Create section error:', err)
      Notify.error('Failed to create section. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectSectionType = (sectionType: SectionType) => {
    setSelectedSectionType(sectionType)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Contents</h1>
          <div className='text-sm text-gray-400 mt-1'>
            Sections are created in Section Types and can be edited here
          </div>
        </div>
        <Button color='primary' startContent={<PlusIcon className='h-4 w-4' />} onPress={onOpen}>
          Create New
        </Button>
      </div>

      {/* error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardBody>
            <p className="text-red-700">{error}</p>
          </CardBody>
        </Card>
      ) */}

      <Card>
        <CardHeader>
          <h2 className='text-lg font-medium text-white'>Available Sections</h2>
        </CardHeader>
        <Divider />
        <CardBody className='p-0'>
          {sections.length === 0 ? (
            <div className='px-6 py-8 text-center text-gray-500'>
              No sections found. Create section types first in Section Types, then they will appear
              here.
            </div>
          ) : (
            <div className='divide-y divide-gray-600'>
              {sections.map((section) => (
                <div key={section.id} className='px-6 py-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='text-xl font-medium text-white'>{section.name}</h3>
                        <Chip
                          size='sm'
                          color={getSectionTypeColor(section.sectionTypeId)}
                          variant='flat'
                        >
                          /{section.link}
                        </Chip>
                      </div>

                      <div className='flex items-center gap-4 text-sm text-gray-500'>
                        <span>Content fields: {Object.keys(section.content || {}).length}</span>
                        <span>
                          Last updated: {new Date(section.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 ml-4'>
                      <Button
                        color='primary'
                        variant='flat'
                        startContent={<PencilIcon className='h-4 w-4' />}
                        onPress={() => handleEditSection(section)}
                      >
                        Edit Content
                      </Button>
                      <Button
                        isIconOnly
                        variant='light'
                        color='danger'
                        onPress={() => handleDelete(section.id)}
                        title='Delete section'
                      >
                        <TrashIcon className='h-5 w-5' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className='mt-6 text-center text-sm text-gray-400'>
        <p>Click "Edit Content" to modify section content in the Page Editor</p>
        <p className='mt-1'>Click "Create New" to create a new section</p>
      </div>

      {/* Modal for selecting section type */}
      <Modal
        classNames={{ base: 'dark bg-background text-foreground' }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size='lg'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                <h3 className='text-lg font-semibold'>Create New Section</h3>
                <p className='text-sm text-gray-500'>
                  Choose a section type to create a new section
                </p>
              </ModalHeader>
              <ModalBody>
                {sectionTypes.length === 0 ? (
                  <div className='text-center py-8'>
                    <p className='text-white mb-4'>No section types available</p>
                    <p className='text-sm text-gray-400'>
                      Please create section types first in the Section Types page
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-3'>
                    {sectionTypes.map((sectionType) => (
                      <Card
                        key={sectionType.id}
                        className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                          selectedSectionType?.id === sectionType.id
                            ? 'ring-2 ring-primary-500 bg-primary-50'
                            : 'hover:bg-default-100'
                        }`}
                        isPressable
                        onPress={() => handleSelectSectionType(sectionType)}
                      >
                        <CardBody className='p-4'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <h4 className='font-medium text-white'>{sectionType.name}</h4>
                              <p className='text-sm text-gray-500 mt-1'>
                                {sectionType.description || 'No description available'}
                              </p>
                              <div className='flex items-center gap-2 mt-2'>
                                <Chip
                                  size='sm'
                                  color={(sectionType.color as any) || 'default'}
                                  variant='flat'
                                >
                                  {sectionType.fields?.length || 0} fields
                                </Chip>
                              </div>
                            </div>
                            {selectedSectionType?.id === sectionType.id && (
                              <div className='text-primary-500'>
                                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                                  <path
                                    fillRule='evenodd'
                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                    clipRule='evenodd'
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={handleCreateSection}
                  isDisabled={!selectedSectionType || isCreating}
                  isLoading={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Section'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Contents
