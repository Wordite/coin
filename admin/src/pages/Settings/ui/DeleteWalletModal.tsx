import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import type { DeleteWalletModalProps } from '../model/types'

export const DeleteWalletModal: React.FC<DeleteWalletModalProps> = ({
  isOpen,
  onOpenChange,
  onDelete,
  loading
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
      classNames={{
        base: "dark",
        header: "dark",
        body: "dark",
        footer: "dark",
        backdrop: "dark",
        closeButton: "dark",
        wrapper: "dark",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="dark text-white">Delete Root Wallet</ModalHeader>
            <ModalBody>
              <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
                <div className="text-sm text-danger-800">
                  <p className="font-medium">Warning:</p>
                  <p>This action will permanently delete the root wallet from Vault. 
                  This cannot be undone and will break coin distribution functionality.</p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={onDelete}
                isLoading={loading}
              >
                Delete Wallet
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
