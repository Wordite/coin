import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Divider } from '@heroui/react'
import { EyeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import type { UserDetailsModalProps } from '../model/types'

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedUser,
  onOpenSolscan
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatWalletAddress = (address: string | null) => {
    if (!address) return 'No wallet'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatAmount = (amount: number) => {
    if (isNaN(amount) || !amount) return '0'
  
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="4xl" 
      scrollBehavior="inside"
      classNames={{
        base: "dark text-foreground bg-content1 rounded-lg",
        header: "dark text-foreground bg-content1 rounded-t-lg",
        body: "dark text-foreground bg-content1",
        footer: "dark text-foreground bg-content1 rounded-b-lg",
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <EyeIcon className="w-5 h-5" />
                User Details
              </div>
              {selectedUser && (
                <p className="text-sm text-foreground/60 font-normal">
                  {selectedUser.email || 'No email'} • {formatWalletAddress(selectedUser.walletAddress)}
                </p>
              )}
            </ModalHeader>
            <ModalBody>
              {selectedUser && (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">User Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>ID:</strong> {selectedUser.id}</div>
                        <div><strong>Email:</strong> {selectedUser.email || 'No email'}</div>
                        <div><strong>Wallet:</strong> 
                          <code className="ml-2 text-xs bg-content2 px-2 py-1 rounded">
                            {selectedUser.walletAddress || 'No wallet'}
                          </code>
                        </div>
                        <div><strong>Role:</strong> 
                          <Chip color={selectedUser.role === 'ADMIN' ? 'danger' : 'default'} variant="flat" size="sm" className="ml-2">
                            {selectedUser.role}
                          </Chip>
                        </div>
                        <div><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Presale Statistics</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Total Spent SOL:</strong> {formatAmount(selectedUser.totalSpentSOL)}</div>
                        <div><strong>Total Spent USDT:</strong> {formatAmount(selectedUser.totalSpentUSDT)}</div>
                        <div><strong>Total Coins Purchased:</strong> {formatAmount(selectedUser.totalCoinsPurchased)}</div>
                        <div><strong>Transactions:</strong> {selectedUser.transactions.length}</div>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Transaction History */}
                  <div>
                    <h3 className="font-semibold mb-3">Transaction History</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedUser.transactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-content2 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Chip color="primary" variant="flat" size="sm">
                              {transaction.type}
                            </Chip>
                            <div className="text-sm">
                              <div><strong>Amount:</strong> {formatAmount(transaction.amount)} {transaction.type}</div>
                              <div><strong>Rate:</strong> {transaction.rate}</div>
                              <div><strong>Coins:</strong> {formatAmount(transaction.coinsPurchased)}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Chip
                                  color={transaction.isReceived ? 'success' : 'warning'}
                                  variant="flat"
                                  size="sm"
                                >
                                  {transaction.isReceived ? 'Received' : 'Pending'}
                                </Chip>
                                <Chip
                                  color={transaction.isSuccessful ? 'success' : 'danger'}
                                  variant="flat"
                                  size="sm"
                                >
                                  {transaction.isSuccessful ? 'Success' : 'Failed'}
                                </Chip>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {transaction.txHash === 'ADMIN_ADJUSTMENT' && (
                              <Chip color="secondary" variant="flat" size="sm">
                                Admin Adjustment
                              </Chip>
                            )}
                            {transaction.txHash && transaction.txHash !== 'ADMIN_ADJUSTMENT' && (
                              <Button
                                size="sm"
                                variant="light"
                                startContent={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                                onPress={() => onOpenSolscan(transaction.txHash!)}
                              >
                                TX
                              </Button>
                            )}
                            <span className="text-xs text-foreground/60">
                              {formatDate(transaction.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {selectedUser.transactions.length === 0 && (
                        <div className="text-center text-foreground/60 py-8">
                          No transactions found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
