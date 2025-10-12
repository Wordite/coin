import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Card,
  CardBody,
  Button,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Progress,
  Spinner,
  Input,
  Pagination,
  Select,
  SelectItem,
  SelectSection,
} from '@heroui/react'
import {
  PhotoIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useMedia, useFileUpload } from './model'
import type { MediaFile } from './model'
import { getImageUrl } from './model'

// Types for sorting and pagination
type SortField = 'name' | 'size' | 'date' | 'type'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  direction: SortDirection
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Memoized MediaCard component
const MediaCard = React.memo(({ file, onDelete }: { file: MediaFile; onDelete: (id: string) => void }) => {
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [])

  return (
    <Card className='group hover:shadow-lg transition-shadow h-full'>
      <CardBody className='p-3'>
        <div className='relative'>
          <div className='w-full h-32 rounded-lg overflow-hidden'>
            <img
              src={getImageUrl(file.url)}
              alt={file.originalName}
              className='w-full h-full object-cover'
              loading='lazy'
              onError={(e) => {
                // Create a simple placeholder image using data URL
                const canvas = document.createElement('canvas')
                canvas.width = 200
                canvas.height = 200
                const ctx = canvas.getContext('2d')
                if (ctx) {
                  ctx.fillStyle = '#f3f4f6'
                  ctx.fillRect(0, 0, 200, 200)
                  ctx.fillStyle = '#9ca3af'
                  ctx.font = '16px Arial'
                  ctx.textAlign = 'center'
                  ctx.fillText('Image', 100, 100)
                  ctx.fillText('Not Found', 100, 120)
                }
                e.currentTarget.src = canvas.toDataURL()
              }}
            />
          </div>
          <div className='absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center'>
            <Button
              isIconOnly
              size='sm'
              color='danger'
              variant='solid'
              onPress={() => onDelete(file.id)}
              className='bg-danger text-white shadow-lg'
              aria-label={`Delete ${file.originalName}`}
            >
              <TrashIcon className='w-4 h-4' />
            </Button>
          </div>
        </div>
        <div className='mt-3 space-y-1'>
          <p className='text-sm font-medium text-foreground truncate' title={file.originalName}>
            {file.originalName}
          </p>
          <div className='flex items-center justify-between text-xs text-default-500'>
            <span>{formatFileSize(file.size)}</span>
            <span>{formatDate(file.createdAt)}</span>
          </div>
          <Chip size='sm' variant='flat' color='primary'>
            {file.mimeType.split('/')[1].toUpperCase()}
          </Chip>
        </div>
      </CardBody>
    </Card>
  )
})

MediaCard.displayName = 'MediaCard'

// MediaGrid component with regular CSS Grid
const MediaGrid = React.memo(({ mediaFiles, onDelete }: { mediaFiles: MediaFile[]; onDelete: (id: string) => void }) => {
  if (mediaFiles.length === 0) {
    return (
      <div className='text-center py-12'>
        <PhotoIcon className='w-16 h-16 text-default-300 mx-auto mb-4' />
        <p className='text-lg font-medium text-foreground mb-2'>No media files yet</p>
        <p className='text-sm text-default-500'>Upload your first image or SVG file to get started</p>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'>
        {mediaFiles && mediaFiles.length > 0 ? mediaFiles.map((file) => (
          <MediaCard key={file.id} file={file} onDelete={onDelete} />
        )) : (
          <div className="col-span-full text-center py-12 text-foreground/60">
            <p>No media files found</p>
          </div>
        )}
      </div>
    </div>
  )
})

MediaGrid.displayName = 'MediaGrid'

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

const MediaLibrary = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { mediaFiles, isLoading, error, deleteFile, fetchMediaFiles, clearError } = useMedia()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'date',
    direction: 'desc'
  })
  
  // File type filter state
  const [selectedFileType, setSelectedFileType] = useState<string>('all')

  const {
    isUploading,
    progress,
    uploadFiles,
    resetUpload,
    clearError: clearUploadError,
    error: uploadError,
  } = useFileUpload((files) => {
    // Refresh media files after upload
    fetchMediaFiles()
  })

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Combine errors from both hooks
  const combinedError = error || uploadError

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
    setCurrentPage(1) // Reset to first page when sorting
  }, [])

  // Filter and sort media files
  const processedMediaFiles = useMemo(() => {
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

  // Get unique file types for filter dropdown
  const fileTypes = useMemo(() => {
    const types = new Set<string>()
    mediaFiles.forEach(file => {
      const extension = file.originalName.split('.').pop()?.toLowerCase() || ''
      if (extension) {
        types.add(extension)
      }
    })
    return Array.from(types).sort()
  }, [mediaFiles])

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedFileType])

  // Memoized statistics
  const stats = useMemo(() => {
    const totalSize = processedMediaFiles.reduce((acc: number, file: MediaFile) => acc + file.size, 0)
    const imageCount = processedMediaFiles.filter((file: MediaFile) => file.mimeType.startsWith('image/')).length
    
    return {
      totalFiles: processedMediaFiles.length,
      totalSize,
      imageCount
    }
  }, [processedMediaFiles])

  // Memoized formatFileSize function
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter(file => {
        // Support images and SVG files
        return file.type.startsWith("image/") || 
               file.type === "text/plain" || 
               file.name.toLowerCase().endsWith(".svg")
      })
      setUploadedFiles(prev => [...prev, ...imageFiles])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const imageFiles = files.filter(file => {
        // Support images and SVG files
        return file.type.startsWith("image/") || 
               file.type === "text/plain" || 
               file.name.toLowerCase().endsWith(".svg")
      })
      setUploadedFiles(prev => [...prev, ...imageFiles])
    }
  }

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return

    try {
      await uploadFiles(uploadedFiles)
      setUploadedFiles([])
      onClose()
      resetUpload()
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleDeleteFile = async (id: string) => {
    const success = await deleteFile(id)
    if (success) {
      console.log('File deleted successfully')
    }
  }

  if (isLoading) {
    return (
      <div className='p-6 flex items-center justify-center'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Media Library</h1>
          <p className='text-default-500'>Manage your media files and images</p>
        </div>
        <Button
          color='primary'
          startContent={<ArrowUpTrayIcon className='w-5 h-5' />}
          onPress={onOpen}
          aria-label="Open upload media dialog"
        >
          Upload Media
        </Button>
      </div>

      {/* Search and Controls */}
      <div className='space-y-4'>
        <div className='flex items-center gap-4'>
          <Input
            placeholder='Search files...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<MagnifyingGlassIcon className='w-4 h-4 text-default-400' />}
            className='max-w-md'
            aria-label="Search media files"
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

        {/* Sorting and Pagination Controls */}
        <div className='flex items-center justify-between'>
          {/* Sorting and Filtering */}
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
                  popoverContent: "bg-default-50 dark text-foreground",
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
      {combinedError && (
        <Card className='border-danger'>
          <CardBody className='text-danger'>
            <div className='flex items-center justify-between'>
              <p>Error: {combinedError}</p>
              <Button
                isIconOnly
                size='sm'
                variant='light'
                onPress={() => {
                  clearError()
                  clearUploadError()
                }}
                aria-label="Clear error message"
              >
                <XMarkIcon className='w-4 h-4' />
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardBody className='text-center'>
            <div className='text-2xl font-bold text-primary'>{stats.totalFiles}</div>
            <div className='text-sm text-default-500'>Total Files</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className='text-center'>
            <div className='text-2xl font-bold text-success'>
              {formatFileSize(stats.totalSize)}
            </div>
            <div className='text-sm text-default-500'>Total Size</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className='text-center'>
            <div className='text-2xl font-bold text-warning'>
              {stats.imageCount}
            </div>
            <div className='text-sm text-default-500'>Images</div>
          </CardBody>
        </Card>
      </div>

      {/* Media Grid */}
      <MediaGrid mediaFiles={paginatedFiles} onDelete={handleDeleteFile} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-default-500'>
            Showing {startIndex + 1}-{Math.min(endIndex, processedMediaFiles.length)} of {processedMediaFiles.length} files
          </div>
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            showShadow
            color='primary'
            aria-label="Media files pagination"
          />
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size='2xl'>
        <ModalContent className='bg-default-50 dark text-foreground'>
          <ModalHeader>Upload Media Files</ModalHeader>
          <ModalBody>
            <div className='space-y-4'>
              {/* Drag & Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/10'
                    : 'border-default-300 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                aria-label="Drag and drop area for image and SVG files"
                role="button"
                tabIndex={0}
              >
                <PhotoIcon className='w-12 h-12 text-default-400 mx-auto mb-4' />
                <p className='text-lg font-medium text-foreground mb-2'>
                  Drag & drop your images and SVG files here
                </p>
                <p className='text-sm text-default-500 mb-4'>
                  or click the button below to select files
                </p>
                <Button
                  variant='bordered'
                  startContent={<ArrowUpTrayIcon className='w-4 h-4' />}
                  onPress={() => document.getElementById('file-input')?.click()}
                  aria-label="Choose files to upload"
                >
                  Choose Files
                </Button>
                <input
                  id='file-input'
                  type='file'
                  multiple
                  accept={"image/*,.svg"}
                  onChange={handleFileSelect}
                  className='hidden'
                  aria-label="Select image and SVG files to upload"
                />
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Uploading files...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    color='primary' 
                    aria-label={`Upload progress: ${progress}%`}
                  />
                </div>
              )}

              {/* Selected Files */}
              {uploadedFiles.length > 0 && (
                <div className='space-y-2'>
                  <h4 className='font-medium'>Selected Files ({uploadedFiles.length})</h4>
                  <div className='space-y-2 max-h-40 overflow-y-auto'>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-2 bg-default-100 rounded-lg'
                      >
                        <div className='flex items-center gap-2'>
                          <PhotoIcon className='w-4 h-4 text-primary' />
                          <span className='text-sm'>{file.name}</span>
                          <Chip size='sm' variant='flat'>
                            {formatFileSize(file.size)}
                          </Chip>
                        </div>
                        <Button
                          isIconOnly
                          size='sm'
                          variant='light'
                          onPress={() => removeUploadedFile(index)}
                          aria-label={`Remove ${file.name}`}
                        >
                          <XMarkIcon className='w-4 h-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='light' onPress={onClose} aria-label="Cancel upload and close dialog">
              Cancel
            </Button>
            <Button
              color='primary'
              onPress={handleUpload}
              disabled={uploadedFiles.length === 0 || isUploading}
              startContent={isUploading ? <Spinner size='sm' /> : <ArrowUpTrayIcon className='w-4 h-4' />}
              aria-label={isUploading ? "Uploading files..." : "Upload selected files"}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

export { MediaLibrary }
export default MediaLibrary 