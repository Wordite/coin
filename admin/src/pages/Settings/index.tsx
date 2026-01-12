import { Card, CardBody, Button, Spinner, useDisclosure } from '@heroui/react'
import { useState, useEffect } from 'react'
import { useMedia } from '@/pages/MediaLibrary/model'
import { RootWalletManagement } from './components'
import {
  SiteSettingsSection,
  PresaleSettingsSection,
  ExchangeRatesSection,
  CoinSettingsSection,
  RpcEndpointsSection,
  ReceiverWalletSection,
  WalletModal,
  DeleteWalletModal,
  useSettings
} from './ui'
import type { MediaFile } from '@/pages/MediaLibrary/model'

const Settings = () => {
  const { mediaFiles } = useMedia()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure()

  // State for selected logo
  const [selectedLogo, setSelectedLogo] = useState<MediaFile | null>(null)

  const {
    // State
    settings,
    setSettings,
    presaleSettings,
    setPresaleSettings,
    availableStages,
    setAvailableStages,
    loading,
    saving,
    vaultStatus,
    walletInfo,
    vaultLoading,
    newSecretKey,
    setNewSecretKey,
    forceInitialize,
    setForceInitialize,
    
    // Actions
    handleSave,
    checkVaultStatus,
    initializeWallet,
    updateWallet,
    deleteWallet,
  } = useSettings()

  const handleInitializeWallet = async () => {
    const success = await initializeWallet()
    if (success) {
      onOpenChange()
    }
  }

  const handleUpdateWallet = async () => {
    const success = await updateWallet()
    if (success) {
      onOpenChange()
    }
  }

  const handleDeleteWallet = async () => {
    const success = await deleteWallet()
    if (success) {
      onDeleteOpenChange()
    }
  }

  // Инициализируем selectedLogo на основе существующего siteLogo
  useEffect(() => {
    if (settings.siteLogo && mediaFiles.length > 0) {
      const existingLogo = mediaFiles.find(file => file.url === settings.siteLogo)
      if (existingLogo) {
        setSelectedLogo(existingLogo)
      }
    }
  }, [settings.siteLogo, mediaFiles])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardBody>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-foreground/60">Manage your application settings and configuration</p>
        </div>
        <Button
          color="primary"
          onPress={handleSave}
          isLoading={saving}
              disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
        </CardBody>
      </Card>

      {/* Site Settings */}
      <SiteSettingsSection
        settings={settings}
        setSettings={setSettings}
        selectedLogo={selectedLogo}
        setSelectedLogo={setSelectedLogo}
        mediaFiles={mediaFiles}
      />

      {/* Presale Settings */}
      <PresaleSettingsSection
        settings={settings}
        setSettings={setSettings}
        presaleSettings={presaleSettings}
        setPresaleSettings={setPresaleSettings}
        availableStages={availableStages}
        setAvailableStages={setAvailableStages}
      />

      {/* Exchange Rates */}
      <ExchangeRatesSection
        settings={settings}
        setSettings={setSettings}
      />

      {/* Coin Settings */}
      <CoinSettingsSection
        settings={settings}
        setSettings={setSettings}
        presaleSettings={presaleSettings}
        setPresaleSettings={setPresaleSettings}
        availableStages={availableStages}
        setAvailableStages={setAvailableStages}
      />

      {/* RPC Endpoints */}
      <RpcEndpointsSection
        presaleSettings={presaleSettings}
        setPresaleSettings={setPresaleSettings}
      />

      {/* Receiver Wallet */}
      <ReceiverWalletSection
        settings={settings}
        setSettings={setSettings}
      />

          {/* Vault Root Wallet Management */}
          <RootWalletManagement
            vaultStatus={vaultStatus}
            walletInfo={walletInfo}
            onVaultRefresh={checkVaultStatus}
            onInitialize={onOpen}
            onUpdate={onOpen}
            onDelete={onDeleteOpen}
            loading={vaultLoading}
          />

      {/* Initialize/Update Modal */}
      <WalletModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        walletInfo={walletInfo}
        newSecretKey={newSecretKey}
        setNewSecretKey={setNewSecretKey}
        forceInitialize={forceInitialize}
        setForceInitialize={setForceInitialize}
        onInitialize={handleInitializeWallet}
        onUpdate={handleUpdateWallet}
        loading={vaultLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteWalletModal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        onDelete={handleDeleteWallet}
        loading={vaultLoading}
      />
    </div>
  )
}

export { Settings }
