import { useState, useEffect } from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import { 
  FolderIcon, 
  DocumentTextIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import {
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import type { Documentation } from '../../../entities/documentation'

interface DragDropDocumentationTreeProps {
  docs: Documentation[]
  onEdit: (doc: Documentation) => void
  onDelete: (id: string) => void
  onCreateCategory: () => void
  onCreateDocument: (categoryId?: string) => void
  onReorder: (items: Array<{ id: string; order: number; categoryId?: string }>) => void
}

interface SortableItemProps {
  id: string
  doc: Documentation
  onEdit: (doc: Documentation) => void
  onDelete: (id: string) => void
  onCreateDocument?: (categoryId: string) => void
}

function SortableItem({ id, doc, onEdit, onDelete, onCreateDocument }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const isCategory = doc.type === 'CATEGORY'
  const isDocumentInCategory = doc.type === 'DOCUMENT' && doc.categoryId

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={`border-l-4 ${isCategory ? 'border-l-primary' : 'border-l-secondary'} mb-3 ${isDocumentInCategory ? 'ml-8' : ''}`}>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="cursor-grab active:cursor-grabbing"
                {...listeners}
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
              </Button>
              
              {isCategory ? (
                <FolderIcon className="w-5 h-5 text-primary" />
              ) : (
                <DocumentTextIcon className="w-4 h-4 text-foreground-500" />
              )}
              
              <div>
                <h3 className={`font-semibold ${isCategory ? 'text-lg' : 'text-base'} text-foreground`}>
                  {doc.title}
                </h3>
                <p className="text-sm text-foreground-500">{doc.description}</p>
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
                {isCategory && onCreateDocument ? (
                  <DropdownItem
                    key="add-document"
                    startContent={<PlusIcon className="w-4 h-4" />}
                    onPress={() => onCreateDocument(doc.id)}
                  >
                    Add Document
                  </DropdownItem>
                ) : null}
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
          
          {/* Документы в категории отображаются отдельно в общем списке */}
        </CardBody>
      </Card>
    </div>
  )
}

export function DragDropDocumentationTree({
  docs,
  onEdit,
  onDelete,
  onCreateCategory,
  onCreateDocument,
  onReorder
}: DragDropDocumentationTreeProps) {
  const [items, setItems] = useState<Documentation[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    // Создаем плоский список всех элементов в правильном порядке
    const allItems: Documentation[] = []
    
    // Сначала добавляем категории (исключаем 'img')
    const categories = docs.filter(doc => doc.type === 'CATEGORY' && doc.slug !== 'img')
      .sort((a, b) => a.order - b.order)
    
    categories.forEach(category => {
      allItems.push(category)
      
      // Добавляем документы этой категории
      const categoryDocs = docs.filter(doc => 
        doc.type === 'DOCUMENT' && doc.categoryId === category.id
      ).sort((a, b) => a.order - b.order)
      
      allItems.push(...categoryDocs)
    })
    
    // Добавляем документы без категории
    const documentsWithoutCategory = docs.filter(doc => 
      doc.type === 'DOCUMENT' && !doc.categoryId
    ).sort((a, b) => a.order - b.order)
    
    allItems.push(...documentsWithoutCategory)
    
    setItems(allItems)
  }, [docs])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const activeItem = items.find(item => item.id === active.id)
    const overItem = items.find(item => item.id === over.id)

    if (!activeItem || !overItem) return

    console.log('🔄 Drag end:', { 
      activeItem: activeItem.title, 
      activeType: activeItem.type,
      overItem: overItem.title,
      overType: overItem.type
    })

    // Обновляем локальное состояние для немедленного отображения
    const oldIndex = items.findIndex(item => item.id === active.id)
    const newIndex = items.findIndex(item => item.id === over.id)
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedItems = arrayMove(items, oldIndex, newIndex)
      setItems(reorderedItems)
      
      // Отправляем изменения на сервер
      const updatedItems: Array<{ id: string; order: number; categoryId?: string }> = []
      
      reorderedItems.forEach((item, index) => {
        updatedItems.push({
          id: item.id,
          order: index,
          categoryId: item.categoryId || undefined
        })
      })
      
      console.log('📝 Updated items:', updatedItems)
      onReorder(updatedItems)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Просто разрешаем все перетаскивания - логика обработки в handleDragEnd
    console.log('🔄 Drag over:', { activeId: active.id, overId: over.id })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Documentation Content</h2>
        <div className="flex gap-2">
          <Button
            color="primary"
            startContent={<PlusIcon className="w-4 h-4" />}
            onPress={onCreateCategory}
          >
            Create Category
          </Button>
          <Button
            color="secondary"
            startContent={<PlusIcon className="w-4 h-4" />}
            onPress={() => onCreateDocument()}
          >
            Create Document
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {items.map((doc) => (
            <SortableItem
              key={doc.id}
              id={doc.id}
              doc={doc}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateDocument={onCreateDocument}
            />
          ))}
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-foreground-400" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No documentation</h3>
          <p className="mt-1 text-sm text-foreground-500">
            Get started by creating a new category or document.
          </p>
        </div>
      )}
    </div>
  )
}
