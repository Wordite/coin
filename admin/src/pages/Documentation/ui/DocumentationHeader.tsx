import { Button } from '@heroui/react'
import { PlusIcon } from '@heroicons/react/24/outline'

interface DocumentationHeaderProps {
  onCreateCategory: () => void
  onCreateDocument: () => void
}

export const DocumentationHeader: React.FC<DocumentationHeaderProps> = ({
  onCreateCategory,
  onCreateDocument
}) => {
  return (
    <div className='flex justify-between items-center'>
      <div>
        <h1 className='text-3xl font-bold text-foreground mb-2'>Documentation</h1>
        <p className='text-foreground-500'>Manage your documentation content and structure</p>
      </div>
      <div className='flex gap-3'>
        <Button
          color='primary'
          variant='flat'
          startContent={<PlusIcon className='w-4 h-4' />}
          onPress={onCreateCategory}
          className='px-6'
        >
          New Category
        </Button>
        <Button
          color='secondary'
          variant='flat'
          startContent={<PlusIcon className='w-4 h-4' />}
          onPress={onCreateDocument}
          className='px-6'
        >
          New Document
        </Button>
      </div>
    </div>
  )
}
