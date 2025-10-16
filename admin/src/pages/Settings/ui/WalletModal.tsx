import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Switch } from '@heroui/react'
import type { WalletModalProps } from '../model/types'

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onOpenChange,
  walletInfo,
  newSecretKey,
  setNewSecretKey,
  forceInitialize,
  setForceInitialize,
  onInitialize,
  onUpdate,
  loading
}) => {
  const handleModalClose = () => {
    setNewSecretKey('')
    setForceInitialize(false)
    onOpenChange(false)
  }

  return (
    <Modal 
      classNames={{
        base: "dark",
        header: "dark",
        body: "dark",
        footer: "dark",
        backdrop: "dark",
        closeButton: "dark",
        wrapper: "dark",
      }} 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
      size="2xl"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="dark text-white">
              {walletInfo.isInitialized ? 'Update Root Wallet' : 'Initialize Root Wallet'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Textarea
                  label="Secret Key"
                  placeholder="Enter the secret key for the root wallet..."
                  value={newSecretKey}
                  onValueChange={setNewSecretKey}
                  minRows={3}
                  maxRows={6}
                />
                
                {!walletInfo.isInitialized && (
                  <div className="flex items-center gap-3">
                    <Switch
                      isSelected={forceInitialize}
                      onValueChange={setForceInitialize}
                      color="warning"
                      size="sm"
                    />
                    <div className="flex flex-col justify-center">
                      <p className="text-sm font-medium text-white">Force Initialize</p>
                      <p className="text-xs text-foreground/60">
                        Overwrite existing wallet if it exists
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleModalClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={walletInfo.isInitialized ? onUpdate : onInitialize}
                isLoading={loading}
              >
                {walletInfo.isInitialized ? 'Update' : 'Initialize'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
