import { Button } from '@heroui/react'
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'

interface EmptyStateProps {
  onCreateCategory: () => void
  onCreateDocument: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onCreateCategory,
  onCreateDocument
}) => {
  return (
    <div className='text-center py-16'>
      <div className='mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6'>
        <DocumentTextIcon className='h-12 w-12 text-primary' />
      </div>
      <h3 className='text-xl font-semibold text-foreground mb-2'>No documentation yet</h3>
      <p className='text-foreground-500 mb-6 max-w-md mx-auto'>
        Start building your documentation by creating your first category or document.
      </p>
      <div className='flex gap-3 justify-center'>
        <Button
          color='primary'
          variant='flat'
          startContent={<PlusIcon className='w-4 h-4' />}
          onPress={onCreateCategory}
        >
          Create Category
        </Button>
        <Button
          color='secondary'
          variant='flat'
          startContent={<PlusIcon className='w-4 h-4' />}
          onPress={onCreateDocument}
        >
          Create Document
        </Button>
      </div>
    </div>
  )
}
