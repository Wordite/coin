import React from 'react'
import { Button } from '@heroui/react'
import { KeyIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface WalletActionsProps {
  isInitialized: boolean
  onInitialize: () => void
  onUpdate: () => void
  onDelete: () => void
  loading: boolean
}

export const WalletActions: React.FC<WalletActionsProps> = ({
  isInitialized,
  onInitialize,
  onUpdate,
  onDelete,
  loading
}) => {
  if (!isInitialized) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          color="primary"
          size="sm"
          onPress={onInitialize}
          startContent={<KeyIcon className="w-4 h-4" />}
        >
          Initialize Root Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        color="primary"
        variant="flat"
        size="sm"
        onPress={onUpdate}
        startContent={<KeyIcon className="w-4 h-4" />}
      >
        Update Secret Key
      </Button>
      
      <Button
        color="danger"
        variant="flat"
        size="sm"
        onPress={onDelete}
        startContent={<XCircleIcon className="w-4 h-4" />}
      >
        Delete Wallet
      </Button>
    </div>
  )
}
