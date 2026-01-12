import React from 'react'
import { Card, CardBody, CardHeader, Input, Chip } from '@heroui/react'
import { WalletIcon } from '@heroicons/react/24/outline'
import type { ReceiverWalletSectionProps } from '../model/types'

export const ReceiverWalletSection: React.FC<ReceiverWalletSectionProps> = ({
  settings,
  setSettings
}) => {
  const handleInputChange = (value: string) => {
    setSettings({
      ...settings,
      receiverWalletPublicKey: value.trim()
    })
  }

  const isValidPublicKey = (key: string) => {
    // Basic Solana public key validation (base58, 32-44 chars)
    return key.length >= 32 && key.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(key)
  }

  const hasReceiverWallet = settings.receiverWalletPublicKey && settings.receiverWalletPublicKey.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
            <WalletIcon className="w-4 h-4 text-success" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Receiver Wallet</h2>
            <p className="text-sm text-foreground/60">Configure wallet for receiving payments</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground/60">Status:</span>
          {hasReceiverWallet ? (
            <Chip color="success" variant="flat" size="sm">
              Configured
            </Chip>
          ) : (
            <Chip color="warning" variant="flat" size="sm">
              Using Root Wallet
            </Chip>
          )}
        </div>

        {/* Info */}
        <div className="p-3 bg-default-100 rounded-lg">
          <p className="text-sm text-foreground/70">
            {hasReceiverWallet
              ? 'Payments from users will be sent to this wallet address.'
              : 'No receiver wallet configured. Payments will be sent to the Root Wallet public key.'}
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Receiver Wallet Public Key
          </label>
          <Input
            placeholder="Enter Solana wallet public key (e.g., 7xKXtg2CW87d97TXJSDpbD5...)"
            value={settings.receiverWalletPublicKey || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            classNames={{
              input: "font-mono text-sm",
            }}
            description="Leave empty to use Root Wallet for receiving payments"
            isInvalid={hasReceiverWallet && !isValidPublicKey(settings.receiverWalletPublicKey)}
            errorMessage={hasReceiverWallet && !isValidPublicKey(settings.receiverWalletPublicKey) ? "Invalid Solana public key format" : undefined}
          />
        </div>

        {/* Current Value Display */}
        {hasReceiverWallet && isValidPublicKey(settings.receiverWalletPublicKey) && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-xs text-success/80 mb-1">Active Receiver Wallet:</p>
            <p className="font-mono text-sm text-success break-all">
              {settings.receiverWalletPublicKey}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
