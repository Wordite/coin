import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from '@heroui/react'
import { MarkDownEditor } from '../../../widgets/MarkDownEditor'
import type { Documentation, CreateDocumentationDto } from '../../../entities/documentation'

interface DocumentationFormProps {
  isOpen: boolean
  onClose: () => void
  isCreating: boolean
  formData: CreateDocumentationDto
  setFormData: React.Dispatch<React.SetStateAction<CreateDocumentationDto>>
  onSave: () => void
  saving: boolean
  categories: Documentation[]
}

export const DocumentationForm: React.FC<DocumentationFormProps> = ({
  isOpen,
  onClose,
  isCreating,
  formData,
  setFormData,
  onSave,
  saving,
  categories
}) => {
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" classNames={{
      base: 'dark',
      body: 'dark',
      header: 'dark',
      footer: 'dark',
      backdrop: 'dark',
      closeButton: 'dark',
    }} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className='dark text-white'>
          {isCreating ? 'Create Documentation' : 'Edit Documentation'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label={formData.type === 'CATEGORY' ? 'Name' : 'Title'}
              placeholder={formData.type === 'CATEGORY' ? 'Enter category name' : 'Enter documentation title'}
              value={formData.title}
              onValueChange={handleTitleChange}
              isRequired
            />
            
            {formData.type === 'DOCUMENT' && (
              <Input
                label="Filename"
                placeholder="Enter filename"
                value={formData.slug}
                onValueChange={(value) => setFormData(prev => ({ ...prev, slug: value }))}
                isRequired
                description="URL-friendly version of the title"
              />
            )}
            
            <Input
              label="Description"
              placeholder="Enter short description"
              value={formData.description}
              onValueChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            />
            
            <Select
              label="Type"
              classNames={{
                base: 'dark',
                trigger: 'dark',
                label: 'dark',
                listbox: 'dark',
                value: 'dark text-white',
                listboxWrapper: 'dark text-white',
                popoverContent: 'dark text-white',
                clearButton: 'dark text-white',
                helperWrapper: 'dark text-white',
                endWrapper: 'dark text-white',
                endContent: 'dark text-white',
                spinner: 'dark text-white',
              }}
              placeholder="Select document type"
              selectedKeys={formData.type ? [formData.type] : []}
              isDisabled={!isCreating}
              onSelectionChange={(keys) => {
                if (!isCreating) return
                const type = Array.from(keys)[0] as 'CATEGORY' | 'DOCUMENT'
                setFormData(prev => ({
                  ...prev,
                  type,
                  // При смене типа на CATEGORY контент не нужен
                  content: type === 'CATEGORY' ? '' : prev.content,
                  // Для CATEGORY нет categoryId
                  categoryId: type === 'CATEGORY' ? undefined : prev.categoryId,
                  // Всегда published и order 0
                  isPublished: true,
                  order: 0
                }))
              }}
            >
              <SelectItem key="DOCUMENT">Document</SelectItem>
              <SelectItem key="CATEGORY">Category</SelectItem>
            </Select>
            
            {formData.type === 'DOCUMENT' && (
              <Select
                classNames={{
                  base: 'dark',
                  trigger: 'dark',
                  label: 'dark',
                  listbox: 'dark',
                  value: 'dark text-white',
                  listboxWrapper: 'dark text-white',
                  popoverContent: 'dark text-white',
                  clearButton: 'dark text-white',
                  helperWrapper: 'dark text-white',
                  endWrapper: 'dark text-white',
                  endContent: 'dark text-white',
                  spinner: 'dark text-white',
                }}
                label="Category"
                placeholder="Select category (optional)"
                selectedKeys={
                  formData.categoryId === undefined
                    ? new Set()
                    : new Set([formData.categoryId === null ? '' : formData.categoryId])
                }
                onSelectionChange={(keys) => {
                  const keySet = keys as Set<string>
                  const raw = keySet.size > 0 ? (Array.from(keySet)[0] as string) : ''
                  // Пустая строка означает Standalone (нет категории)
                  const categoryId = raw === '' ? '' : raw
                  setFormData(prev => ({ ...prev, categoryId }))
                }}
              >
                {[
                  { id: '', title: 'No Category' },
                  ...(Array.isArray(categories) ? categories : [])
                ].map((category) => (
                  <SelectItem key={category.id} textValue={category.title}>
                    {category.title}
                  </SelectItem>
                ))}
              </Select>
            )}
            
            {formData.type === 'DOCUMENT' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Content</label>
                <MarkDownEditor
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={onSave}
            isLoading={saving}
          >
            {isCreating ? 'Create' : 'Update'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}