
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody } from '@heroui/react'
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface AuthEmailSentPopupProps {
  isOpen: boolean
  onClose: () => void
  email?: string
}

const AuthEmailSentPopup = ({ isOpen, onClose, email }: AuthEmailSentPopupProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      placement="center"
      backdrop="blur"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "border border-default-200 bg-default-50 shadow-2xl dark text-foreground",
        header: "border-b border-default-200",
        body: "py-6",
        footer: "border-t border-default-200"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-8 h-8 text-success" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            Authentication Link Sent
          </h3>
        </ModalHeader>
        
        <ModalBody className="text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-base text-foreground font-medium">
                Authentication link has been sent to your email
              </p>
              {email && (
                <p className="text-sm text-default-500">
                  {email}
                </p>
              )}
              <p className="text-sm text-default-600 leading-relaxed max-w-sm mx-auto">
                Please check your email and click on the authentication link. Your sign-in will be automatically completed on this page.
              </p>
            </div>
            
            <Card className="bg-default-50 border border-default-200">
              <CardBody className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground mb-1">
                      What to do next:
                    </p>
                    <ul className="text-xs text-default-600 space-y-1">
                      <li>• Check your email inbox (and spam folder)</li>
                      <li>• Click on the authentication link in the email</li>
                      <li>• Your sign-in will be automatically completed on this page</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        
        <ModalFooter className="flex justify-center">
          <Button 
            color="primary" 
            variant="solid"
            onPress={onClose}
            className="px-8"
            size="lg"
          >
            Got it
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export { AuthEmailSentPopup } 