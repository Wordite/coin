import React from 'react'
import { Button } from '@heroui/react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface VaultStatusProps {
  isConnected: boolean
  error?: string
  onRefresh: () => void
  loading: boolean
}

export const VaultStatus: React.FC<VaultStatusProps> = ({
  isConnected,
  error,
  onRefresh,
  loading
}) => {
  return (
    <div className="flex items-center gap-3">
      <span className="font-medium">Vault Status:</span>
      {isConnected ? (
        <>
          <CheckCircleIcon className="w-4 h-4 text-green-500" />
          <span className="text-green-600 text-sm">Connected</span>
        </>
      ) : (
        <>
          <XCircleIcon className="w-4 h-4 text-red-500" />
          <span className="text-red-600 text-sm">Disconnected</span>
          {error && (
            <span className="text-red-500 text-xs">({error})</span>
          )}
        </>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="light"
          onPress={onRefresh}
          isLoading={loading}
        >
          Refresh
        </Button>
      </div>
    </div>
  )
}
