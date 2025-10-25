import React, { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Progress, Chip, Spinner } from '@heroui/react'
import { api } from '@/app/api'

interface IssueTokensModalProps {
  processId: string
  onClose: () => void
}

interface ProcessStatus {
  status: 'running' | 'completed' | 'failed'
  startTime: string
  processed: number
  total: number
  users: Array<{
    userId: string
    wallet: string
    amount: number
    status: 'success' | 'failed'
    timestamp: string
    signature?: string
    error?: string
  }>
  error?: string
}

export const IssueTokensModal: React.FC<IssueTokensModalProps> = ({ processId, onClose }) => {
  const [status, setStatus] = useState<ProcessStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await api.get(`/user/issue-all-tokens/${processId}/status`)
        setStatus(response.data)
        setLoading(false)
        
        // Stop polling if process is completed or failed
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          return
        }
      } catch (error) {
        console.error('Failed to fetch process status:', error)
        setLoading(false)
      }
    }

    // Poll every second
    const interval = setInterval(pollStatus, 1000)
    
    // Initial poll
    pollStatus()

    return () => clearInterval(interval)
  }, [processId])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'failed': return '❌'
      case 'running': return '⏳'
      case 'completed': return '🎉'
      default: return '⏸️'
    }
  }

  if (loading) {
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
        isOpen={true} 
        onOpenChange={() => {}} 
        size="2xl"
        isDismissable={false}
        hideCloseButton
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="dark text-white">
                Loading Process Status
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col items-center justify-center py-8">
                  <Spinner size="lg" color="primary" />
                  <p className="mt-4 text-white">Loading process status...</p>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    )
  }

  if (!status) {
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
        isOpen={true} 
        onOpenChange={onClose} 
        size="2xl"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="dark text-white">
                Error
              </ModalHeader>
              <ModalBody>
                <div className="text-center py-4">
                  <p className="text-red-400">Failed to load process status</p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    )
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
      isOpen={true} 
      onOpenChange={onClose} 
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="dark text-white">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-xl font-bold">Issuing Tokens</h2>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {getStatusIcon(status.status)} {status.status.toUpperCase()}
                  </span>
                  <Chip 
                    color={status.status === 'completed' ? 'success' : status.status === 'failed' ? 'danger' : 'primary'}
                    variant="flat"
                  >
                    {status.processed}/{status.total} users
                  </Chip>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="dark">

              {/* Progress Header */}
              <div className="mb-6">
                <Progress 
                  value={(status.processed / status.total) * 100}
                  color={status.status === 'completed' ? 'success' : status.status === 'failed' ? 'danger' : 'primary'}
                  className="mb-4"
                />
                
                {status.error && (
                  <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400">
                    <strong>Error:</strong> {status.error}
                  </div>
                )}
              </div>

              {/* Users List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Processed Users:</h3>
                {status.users.length === 0 ? (
                  <p className="text-gray-400 italic">No users processed yet...</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {status.users.map((user, index) => (
                      <div 
                        key={`${user.userId}-${index}`}
                        className={`p-3 rounded border-l-4 ${
                          user.status === 'success' 
                            ? 'bg-green-900/20 border-green-500' 
                            : 'bg-red-900/20 border-red-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-mono text-sm text-gray-300">
                                {user.wallet}
                              </span>
                              <Chip 
                                color={user.status === 'success' ? 'success' : 'danger'}
                                size="sm"
                                variant="flat"
                              >
                                {getStatusIcon(user.status)} {user.status}
                              </Chip>
                            </div>
                            
                            <div className="mt-1 text-sm text-gray-300">
                              {user.status === 'success' ? (
                                <>
                                  <span className="font-semibold">Purchased {user.amount} tokens</span>
                                  <span className="mx-2">→</span>
                                  <span className="text-green-400 font-semibold">Sent {user.amount} tokens ✓</span>
                                  {user.signature && (
                                    <div className="mt-1 text-xs text-gray-400 font-mono">
                                      TX: {user.signature}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-red-400">
                                  Failed: {user.error || 'Unknown error'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-400">
                            {formatTime(user.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </ModalBody>
            <ModalFooter className="dark">
              {(status.status === 'completed' || status.status === 'failed') && (
                <Button color="primary" onPress={onClose}>
                  Close
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
