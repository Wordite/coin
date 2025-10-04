import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface RootWalletNotInitializedModalProps {
  isOpen: boolean
  onClose: () => void
}

const RootWalletNotInitializedModal = ({ isOpen, onClose }: RootWalletNotInitializedModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose} 
      size="md"
      classNames={{
        base: 'dark',
        wrapper: 'dark p-4',
        body: 'dark',
        header: 'dark',
        footer: 'dark',
        closeButton: 'dark',
      }}
    >
      <ModalContent className="bg-default-100 border border-default-200 shadow-2xl">
        {(close) => (
          <>
            <ModalHeader className="flex flex-col gap-2 pb-4 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-8 h-8 text-warning-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Root Wallet Not Initialized
              </h3>
            </ModalHeader>
            <ModalBody className="px-6 pb-6">
              <div className="text-center space-y-3">
                <p className="text-default-600 leading-relaxed">
                  The root wallet has not been initialized yet. To enable presale transactions and wallet operations, please configure the root wallet in the settings.
                </p>
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <p className="text-warning-800 text-sm font-medium">
                    ⚠️ This is required for the application to function properly
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="pt-4 border-t border-default-200">
              <Button 
                color="primary" 
                size="lg"
                className="w-full font-semibold"
                onPress={close}
              >
                Got it
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export { RootWalletNotInitializedModal }
