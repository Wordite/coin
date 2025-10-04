import React from 'react'
import { Chip } from '@heroui/react'

interface WalletStatusProps {
  isInitialized: boolean
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ isInitialized }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-medium">Wallet Status:</span>
      <Chip
        color={isInitialized ? 'success' : 'warning'}
        variant="flat"
        size="sm"
      >
        {isInitialized ? 'Initialized' : 'Not Initialized'}
      </Chip>
    </div>
  )
}
