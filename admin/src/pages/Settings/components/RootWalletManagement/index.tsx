import React from 'react'
import { Card, CardBody, CardHeader } from '@heroui/react'
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <KeyIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Root Wallet Management</h2>
            <p className="text-sm text-foreground/60">Manage root wallet and Vault connection</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
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
      </CardBody>
    </Card>
  )
}
