import { Card, CardBody, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Spinner } from '@heroui/react'
import { PencilIcon, TrashIcon, EllipsisVerticalIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import type { Documentation } from '../../../entities/documentation'

interface DocumentationListProps {
  docs: Documentation[]
  loading: boolean
  onEdit: (doc: Documentation) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

export const DocumentationList: React.FC<DocumentationListProps> = ({
  docs,
  loading,
  onEdit,
  onDelete,
  onCreate
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documentation yet</h3>
          <p className="text-gray-600 mb-4">Create your first documentation page to get started.</p>
          <Button color="primary" onPress={onCreate}>
            Create Documentation
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {docs.map((doc) => (
        <Card key={doc.id}>
          <CardBody>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{doc.title}</h3>
                  <Chip
                    size="sm"
                    color={doc.type === 'CATEGORY' ? 'primary' : 'secondary'}
                    variant="flat"
                  >
                    {doc.type}
                  </Chip>
                  <Chip
                    size="sm"
                    color={doc.isPublished ? 'success' : 'warning'}
                    variant="flat"
                  >
                    {doc.isPublished ? 'Published' : 'Draft'}
                  </Chip>
                </div>
                <p className="text-gray-600 text-sm mb-2">{doc.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Slug: {doc.slug}</span>
                  <span>Order: {doc.order}</span>
                  <span>Updated: {new Date(doc.updatedAt).toLocaleDateString()}</span>
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
          </CardBody>
        </Card>
      ))}
    </div>
  )
}