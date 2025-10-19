import React, { useState, useCallback } from 'react'
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  Card,
  CardBody,
  Chip,
  Spinner,
  Input,
  Pagination,
  Select,
  SelectItem,
} from '@heroui/react'
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useMedia } from '@/pages/MediaLibrary/model'
import type { MediaFile } from '@/pages/MediaLibrary/model'
import { getImageUrl } from '@/pages/MediaLibrary/model'

type SortField = 'name' | 'size' | 'date' | 'type'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

interface ImagePickerProps {
  onSelect: (selectedImages: MediaFile[]) => void
  multiple?: boolean
  maxSelection?: number
  selectedImages?: MediaFile[]
  className?: string
  placeholder?: string
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Sortable Header Component
const SortableHeader = React.memo(({ 
  field, 
  currentSort, 
  onSort, 
  children 
}: { 
  field: SortField
  currentSort: SortConfig
  onSort: (field: SortField) => void
  children: React.ReactNode
}) => {
  const isActive = currentSort.field === field
  const isAsc = isActive && currentSort.direction === 'asc'
  
  return (
    <Button
      variant='light'
      size='sm'
      className='h-auto p-2 min-w-0'
      onPress={() => onSort(field)}
      aria-label={`Sort by ${field} ${isActive ? (isAsc ? 'descending' : 'ascending') : 'ascending'}`}
    >
      <div className='flex items-center gap-1'>
        <span className='text-xs'>{children}</span>
        {isActive ? (
          isAsc ? (
            <ChevronUpIcon className='w-3 h-3' />
          ) : (
            <ChevronDownIcon className='w-3 h-3' />
          )
        ) : (
          <div className='w-3 h-3 opacity-30'>
            <ChevronUpIcon className='w-3 h-3' />
          </div>
        )}
      </div>
    </Button>
  )
})

SortableHeader.displayName = 'SortableHeader'

// Image Card Component
const ImageCard = React.memo(({ 
  file, 
  isSelected, 
  onSelect
}: { 
  file: MediaFile
  isSelected: boolean
  onSelect: (file: MediaFile) => void
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
        isSelected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
      }`}
      isPressable
      onPress={() => onSelect(file)}
    >
      <CardBody className='p-2'>
        <div className='relative'>
          <Image
            src={getImageUrl(file.url)}
            alt={file.originalName}
            className='w-full h-32 object-cover rounded-lg'
            loading='lazy'
          />
          {isSelected && (
            <div className='absolute top-2 right-2'>
              <Chip size='sm' color='primary' variant='solid'>
                ✓
              </Chip>
            </div>
          )}
        </div>
        <div className='mt-2'>
          <p className='text-xs font-medium truncate'>{file.originalName}</p>
          <p className='text-xs text-default-500'>
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </CardBody>
    </Card>
  )
})

ImageCard.displayName = 'ImageCard'

// Image Grid Component
const ImageGrid = React.memo(({ 
  mediaFiles, 
  selectedImages, 
  onSelect
}: { 
  mediaFiles: MediaFile[]
  selectedImages: MediaFile[]
  onSelect: (file: MediaFile) => void
}) => {
  if (mediaFiles.length === 0) {
    return (
      <div className='text-center py-12'>
        <PhotoIcon className='w-16 h-16 text-default-300 mx-auto mb-4' />
        <p className='text-lg font-medium text-foreground mb-2'>No images found</p>
        <p className='text-sm text-default-500'>Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
        {mediaFiles.map((file) => (
          <ImageCard
            key={file.id}
            file={file}
            isSelected={selectedImages.some(img => img.id === file.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
})

ImageGrid.displayName = 'ImageGrid'

const ImagePicker: React.FC<ImagePickerProps> = ({
  onSelect,
  multiple = false,
  maxSelection = 10,
  selectedImages = [],
  className = '',
  placeholder = 'Select images...'
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { mediaFiles, isLoading, error, fetchMediaFiles } = useMedia()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [selectedFileType, setSelectedFileType] = useState<string>('all')
  const [localSelectedImages, setLocalSelectedImages] = useState<MediaFile[]>(selectedImages)
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc'
  })

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Get unique file types for filter dropdown
  const fileTypes = React.useMemo(() => {
    const types = new Set<string>()
    mediaFiles.forEach(file => {
      const extension = file.originalName.split('.').pop()?.toLowerCase() || ''
      if (extension) {
        types.add(extension)
      }
    })
    return Array.from(types).sort()
  }, [mediaFiles])

  // Sorting function
  const sortFiles = useCallback((files: MediaFile[], config: SortConfig) => {
    return [...files].sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (config.field) {
        case 'name':
          aValue = a.originalName.toLowerCase()
          bValue = b.originalName.toLowerCase()
          break
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        case 'date':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        case 'type':
          aValue = a.mimeType.toLowerCase()
          bValue = b.mimeType.toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return config.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [])

  // Handle sort change
  const handleSort = useCallback((field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1)
  }, [])

  // Filter and sort media files
  const processedMediaFiles = React.useMemo(() => {
    // First filter by search query
    let filtered = mediaFiles
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = mediaFiles.filter(file => 
        file.originalName.toLowerCase().includes(query) ||
        file.mimeType.toLowerCase().includes(query)
      )
    }
    
    // Then filter by file type
    if (selectedFileType !== 'all') {
      filtered = filtered.filter(file => {
        const extension = file.originalName.split('.').pop()?.toLowerCase() || ''
        return extension === selectedFileType
      })
    }
    
    // Then sort
    return sortFiles(filtered, sortConfig)
  }, [mediaFiles, debouncedSearchQuery, selectedFileType, sortConfig, sortFiles])

  // Pagination logic
  const totalPages = Math.ceil(processedMediaFiles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedFiles = processedMediaFiles.slice(startIndex, endIndex)

  // Reset to first page when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedFileType])

  // Handle image selection
  const handleImageSelect = useCallback((file: MediaFile) => {
    if (multiple) {
      setLocalSelectedImages(prev => {
        const isSelected = prev.some(img => img.id === file.id)
        if (isSelected) {
          return prev.filter(img => img.id !== file.id)
        } else {
          if (prev.length >= maxSelection) {
            return prev
          }
          return [...prev, file]
        }
      })
    } else {
      setLocalSelectedImages([file])
    }
  }, [multiple, maxSelection])

  // Handle confirm selection
  const handleConfirm = useCallback(() => {
    onSelect(localSelectedImages)
    onClose()
  }, [localSelectedImages, onSelect, onClose])

  // Handle cancel
  const handleCancel = useCallback(() => {
    setLocalSelectedImages(selectedImages)
    onClose()
  }, [selectedImages, onClose])

  // Handle unselect all
  const handleUnselectAll = useCallback(() => {
    setLocalSelectedImages([])
  }, [])

  // Load media files when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchMediaFiles()
    }
  }, [isOpen, fetchMediaFiles])

  // Update local selection when prop changes
  React.useEffect(() => {
    if (selectedImages.length > 0) {
      setLocalSelectedImages(selectedImages)
    }
  }, [selectedImages])

  return (
    <div className={className}>
      <div className='flex items-start gap-4'>
        {/* Trigger Button */}
        <Button
          variant='bordered'
          onPress={onOpen}
          startContent={<PhotoIcon className='w-4 h-4' />}
          className='flex-shrink-0'
        >
          {selectedImages.length > 0 ? (
              <span className='truncate text-sm'>
                {selectedImages.length === 1 
                  ? selectedImages[0].originalName
                  : `${selectedImages.length} images selected`
                }
              </span>
            ) : (
              <span className='text-default-500'>{placeholder}</span>
            )}
        </Button>

        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div className='flex-1'>
            <div className='flex flex-wrap gap-2'>
              {selectedImages.map((image) => (
                <div key={image.id} className='flex flex-col items-center'>
                  <div className='w-12 h-12 rounded-lg overflow-hidden border border-default-200'>
                    <img
                      src={getImageUrl(image.url)}
                      alt={image.originalName}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <p className='text-xs mt-1 text-center truncate w-12'>
                    {image.originalName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='5xl' scrollBehavior='inside'>
        <ModalContent className='bg-default-50 dark text-foreground'>
          <ModalHeader>
            <div className='flex items-center justify-between w-full'>
              <div>
                <h2 className='text-xl font-bold'>Select Images</h2>
                <p className='text-sm text-default-500'>
                  {multiple ? `Select up to ${maxSelection} images` : 'Select one image'}
                </p>
              </div>
              {localSelectedImages.length > 0 && (
                <Chip color='primary' variant='flat'>
                  {localSelectedImages.length} selected
                </Chip>
              )}
            </div>
          </ModalHeader>
          
          <ModalBody>
            <div className='space-y-4'>
              {/* Search and Controls */}
              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <Input
                    placeholder='Search images...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={<MagnifyingGlassIcon className='w-4 h-4 text-default-400' />}
                    className='max-w-md'
                    aria-label="Search images"
                  />
                  {searchQuery && (
                    <Button
                      variant='light'
                      size='sm'
                      onPress={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Sorting and Filtering */}
                <div className='flex items-center justify-between'>
                  {/* Sorting */}
                  <div className='flex items-center gap-4'>
                    {/* Sorting */}
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-default-500'>Sort by:</span>
                      <SortableHeader field='name' currentSort={sortConfig} onSort={handleSort}>
                        Name
                      </SortableHeader>
                      <SortableHeader field='size' currentSort={sortConfig} onSort={handleSort}>
                        Size
                      </SortableHeader>
                      <SortableHeader field='date' currentSort={sortConfig} onSort={handleSort}>
                        Date
                      </SortableHeader>
                    </div>

                    {/* File type filter */}
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-default-500'>File type:</span>
                      <Select
                        size='sm'
                        variant="bordered"
                        selectionMode="single"
                        selectedKeys={selectedFileType ? [selectedFileType] : []}
                        onSelectionChange={(keys) => {
                          const value = Array.from(keys)[0] as string
                          setSelectedFileType(value || 'all')
                        }}
                        className='w-32'
                        aria-label="Filter by file type"
                        disallowEmptySelection={false}
                        classNames={{
                          base: "bg-default-50 dark",
                          trigger: "bg-default-50 border-default-300",
                          listbox: "bg-default-50 border-default-300 dark text-foreground",
                          popoverContent: "bg-default-50 dark text-foreground"
                        }}
                      >
                        <SelectItem key='all' textValue='all'>All types</SelectItem>
                        {fileTypes.length > 0 ? (
                          <React.Fragment>
                            {fileTypes.map(type => (
                              <SelectItem key={type} textValue={type}>
                                .{type.toUpperCase()}
                              </SelectItem>
                            ))}
                          </React.Fragment>
                        ) : null}
                      </Select>
                    </div>
                  </div>

                  {/* Items per page */}
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-default-500'>Items per page:</span>
                    <Select
                      size='sm'
                      variant="bordered"
                      selectedKeys={[itemsPerPage.toString()]}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string
                        setItemsPerPage(Number(value))
                        setCurrentPage(1)
                      }}
                      className='w-20'
                      aria-label="Select items per page"
                      classNames={{
                        base: "bg-default-50 dark",
                        trigger: "bg-default-50 border-default-300",
                        listbox: "bg-default-50 border-default-300 dark text-foreground",
                        popoverContent: "bg-default-50 dark text-foreground"
                      }}
                    >
                      <SelectItem key='6'>6</SelectItem>
                      <SelectItem key='12'>12</SelectItem>
                      <SelectItem key='24'>24</SelectItem>
                      <SelectItem key='48'>48</SelectItem>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className='p-4 bg-danger-50 border border-danger-200 rounded-lg'>
                  <p className='text-danger'>Error: {error}</p>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className='flex items-center justify-center py-12'>
                  <Spinner size='lg' />
                </div>
              )}

              {/* Image Grid */}
              {!isLoading && (
                <ImageGrid
                  mediaFiles={paginatedFiles}
                  selectedImages={localSelectedImages}
                  onSelect={handleImageSelect}
                />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between'>
                  <div className='text-sm text-default-500'>
                    Showing {startIndex + 1}-{Math.min(endIndex, processedMediaFiles.length)} of {processedMediaFiles.length} images
                  </div>
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                    showShadow
                    color='primary'
                    aria-label="Images pagination"
                  />
                </div>
              )}
            </div>
          </ModalBody>
          
          <ModalFooter>
            <div className='flex justify-between w-full'>
              <div className='flex gap-2'>
                <Button variant='light' onPress={handleCancel} aria-label="Cancel selection">
                  Cancel
                </Button>
                {localSelectedImages.length > 0 && (
                  <Button 
                    variant='light' 
                    color='warning' 
                    onPress={handleUnselectAll} 
                    aria-label="Unselect all images"
                  >
                    Unselect All
                  </Button>
                )}
              </div>
              <Button
                color='primary'
                onPress={handleConfirm}
                disabled={localSelectedImages.length === 0}
                aria-label="Confirm image selection"
              >
                Select {localSelectedImages.length > 0 ? `(${localSelectedImages.length})` : ''}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export { ImagePicker }
export default ImagePicker 