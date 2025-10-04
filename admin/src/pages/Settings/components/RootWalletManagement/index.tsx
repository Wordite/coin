import React from 'react'
import { Divider } from '@heroui/react'
import { KeyIcon } from '@heroicons/react/24/outline'
import { VaultStatus } from '../VaultStatus'
import { WalletStatus } from '../WalletStatus'
import { WalletActions } from '../WalletActions'
import { WalletInfo } from '../WalletInfo'

interface RootWalletManagementProps {
  vaultStatus: {
    isConnected: boolean
    error?: string
  }
  walletInfo: {
    isInitialized: boolean
    updatedAt?: string
  }
  onVaultRefresh: () => void
  onInitialize: () => void
  onUpdate: () => void
  onDelete: () => void
  loading: boolean
}

export const RootWalletManagement: React.FC<RootWalletManagementProps> = ({
  vaultStatus,
  walletInfo,
  onVaultRefresh,
  onInitialize,
  onUpdate,
  onDelete,
  loading
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <KeyIcon className="w-5 h-5 text-primary" />
        <h3 className="text-md font-semibold">Root Wallet Management</h3>
      </div>
      
      {/* Vault Status */}
      <VaultStatus
        isConnected={vaultStatus.isConnected}
        error={vaultStatus.error}
        onRefresh={onVaultRefresh}
        loading={loading}
      />

      {/* Wallet Status */}
      <WalletStatus isInitialized={walletInfo.isInitialized} />

      {/* Wallet Info */}
      <WalletInfo updatedAt={walletInfo.updatedAt} />

      {/* Actions */}
      <WalletActions
        isInitialized={walletInfo.isInitialized}
        onInitialize={onInitialize}
        onUpdate={onUpdate}
        onDelete={onDelete}
        loading={loading}
      />
    </div>
  )
}
