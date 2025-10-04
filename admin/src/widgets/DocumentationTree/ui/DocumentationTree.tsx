import { Card, CardBody, Button } from '@heroui/react'
import { 
  FolderIcon, 
  DocumentTextIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import type { Documentation } from '../../../entities/documentation'

interface DocumentationTreeProps {
  docs: Documentation[]
  categories: Documentation[]
  onEdit: (doc: Documentation) => void
  onDelete: (id: string) => void
  onCreateCategory: () => void
  onCreateDocument: (categoryId?: string) => void
}

export const DocumentationTree: React.FC<DocumentationTreeProps> = ({
  docs,
  categories,
  onEdit,
  onDelete,
  onCreateCategory,
  onCreateDocument
}) => {
  const getDocumentsByCategory = (category: Documentation) => {
    // Используем документы из самого объекта категории, если они есть
    if (category.documents && category.documents.length > 0) {
      console.log(`📁 Category "${category.title}" has ${category.documents.length} documents:`, category.documents.map(d => d.title))
      return category.documents
    }
    // Fallback: ищем в общем массиве docs
    const fallbackDocs = docs.filter(doc => doc.categoryId === category.id)
    console.log(`📁 Category "${category.title}" fallback: ${fallbackDocs.length} documents:`, fallbackDocs.map(d => d.title))
    return fallbackDocs
  }

  const getStandaloneDocuments = () => {
    return docs.filter(doc => !doc.categoryId && doc.type === 'DOCUMENT')
  }

  return (
    <div className="space-y-4 dark">
      {/* Header with Create buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          color="primary"
          variant="flat"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={onCreateCategory}
        >
          Create Category
        </Button>
        <Button
          color="secondary"
          variant="flat"
          startContent={<PlusIcon className="w-4 h-4" />}
          onPress={() => onCreateDocument()}
        >
          Create Document
        </Button>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <Card key={category.id} className="border-l-4 border-l-primary">
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FolderIcon className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{category.title}</h3>
                  <p className="text-sm text-foreground-500">{category.description}</p>
                </div>
              </div>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly variant="light" size="sm">
                    <EllipsisVerticalIcon className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    key="edit"
                    startContent={<PencilIcon className="w-4 h-4" />}
                    onPress={() => onEdit(category)}
                  >
                    Edit Category
                  </DropdownItem>
                  <DropdownItem
                    key="add-doc"
                    startContent={<PlusIcon className="w-4 h-4" />}
                    onPress={() => onCreateDocument(category.id)}
                  >
                    Add Document
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<TrashIcon className="w-4 h-4" />}
                    onPress={() => onDelete(category.id)}
                  >
                    Delete Category
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>

            {/* Documents in this category */}
            <div className="ml-8 space-y-2">
              {getDocumentsByCategory(category).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-content2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-foreground-500" />
                    <span className="font-medium text-foreground">{doc.title}</span>
                  </div>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="edit"
                        startContent={<PencilIcon className="w-4 h-4" />}
                        onPress={() => onEdit(doc)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<TrashIcon className="w-4 h-4" />}
                        onPress={() => onDelete(doc.id)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              ))}
              
              {getDocumentsByCategory(category).length === 0 && (
                <div className="text-center py-4 text-foreground-500">
                  <p className="text-sm">No documents in this category</p>
                  <Button
                    size="sm"
                    variant="light"
                    startContent={<PlusIcon className="w-3 h-3" />}
                    onPress={() => onCreateDocument(category.id)}
                    className="mt-2"
                  >
                    Add Document
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      ))}

      {/* Standalone Documents */}
      {getStandaloneDocuments().length > 0 && (
        <Card>
          <CardBody>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-foreground">
              <DocumentTextIcon className="w-5 h-5 text-primary" />
              Standalone Documents
            </h3>
            <div className="space-y-2">
              {getStandaloneDocuments().map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-content2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-foreground-500" />
                    <span className="font-medium text-foreground">{doc.title}</span>
                  </div>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button isIconOnly variant="light" size="sm">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="edit"
                        startContent={<PencilIcon className="w-4 h-4" />}
                        onPress={() => onEdit(doc)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<TrashIcon className="w-4 h-4" />}
                        onPress={() => onDelete(doc.id)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty state */}
      {categories.length === 0 && docs.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <FolderIcon className="w-12 h-12 mx-auto text-foreground-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No documentation yet</h3>
            <p className="text-foreground-500 mb-4">Create your first category or document to get started.</p>
            <div className="flex gap-2 justify-center">
              <Button color="primary" onPress={onCreateCategory}>
                Create Category
              </Button>
              <Button color="secondary" onPress={() => onCreateDocument()}>
                Create Document
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}