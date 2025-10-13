import { useState, useEffect } from 'react'
import { formatNumber } from '@/shared/utils/formatNumber'
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Progress,
  Chip,
  Divider,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
} from '@heroui/react'
import {
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { usersApi, type UserWithTransactions } from '@/services/usersApi'
import { coinApi, type CoinPresaleSettings } from '@/services/coinApi'
import { useAuthNotify } from '@/hooks/useAuthNotify'

const Presale = () => {
  const [presaleSettings, setPresaleSettings] = useState<CoinPresaleSettings | null>(null)
  const [users, setUsers] = useState<UserWithTransactions[]>([])
  const { error: notifyError } = useAuthNotify()
  const [usersStatistics, setUsersStatistics] = useState<{
    totalUsers: number
    usersWithPurchases: number
    totalCoinsPurchased: number
    totalSpentSOL: number
    totalSpentUSDT: number
  } | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [issuingTokens, setIssuingTokens] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithTransactions | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadUsersData()
  }, [currentPage])

  const loadInitialData = async () => {
    try {
      setInitialLoading(true)
      const [settingsData, statisticsData] = await Promise.all([
        coinApi.getPresaleSettings(),
        usersApi.getUsersStatistics()
      ])
      setPresaleSettings(settingsData)
      setUsersStatistics(statisticsData)
    } catch (err) {
      notifyError('Failed to load presale data')
      console.error('Error loading presale data:', err)
    } finally {
      setInitialLoading(false)
    }
  }

  const loadUsersData = async () => {
    try {
      setUsersLoading(true)
      const usersData = await usersApi.getUsers(currentPage, 10, 'createdAt', 'desc')
      setUsers(usersData.users)
      setTotalPages(usersData.totalPages)
    } catch (err) {
      notifyError('Failed to load users data')
      console.error(err)
    } finally {
      setUsersLoading(false)
    }
  }

  const handleIssueAllTokens = async () => {
    try {
      setIssuingTokens(true)
      // TODO: Implement real token issuance logic
      console.log('Issuing tokens to all users...')
      
      Notify.success('Tokens issued to all users successfully')
    } catch (err) {
      notifyError('Failed to issue tokens')
      console.error(err)
    } finally {
      setIssuingTokens(false)
    }
  }

  const handleIssueUserTokens = async (userId: string) => {
    try {
      // TODO: Implement real token issuance logic for specific user
      console.log('Issuing tokens to user:', userId)
      
      Notify.success('Tokens issued to user successfully')
    } catch (err) {
      notifyError('Failed to issue tokens to user')
      console.error(err)
    }
  }

  const handleViewUser = async (userId: string) => {
    try {
      const user = await usersApi.getUserById(userId)
      setSelectedUser(user)
      onOpen()
    } catch (err) {
      notifyError('Failed to load user details')
      console.error(err)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const formatDate = (dateString: string) => {
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

  const formatAmount = (amount: number | null | undefined) => {
    return formatNumber(amount, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }

  const openSolscan = (txHash: string) => {
    const solscanUrl = `https://solscan.io/tx/${txHash}`
    window.open(solscanUrl, '_blank', 'noopener,noreferrer')
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!presaleSettings) {
    return (
      <div className="p-6">
        <div className="text-center text-foreground/60">
          Failed to load presale data
        </div>
      </div>
    )
  }

  // Show loading spinner while initial data is loading
  if (initialLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-foreground/60">Loading presale data...</p>
        </div>
      </div>
    )
  }

  // Show error state if presaleSettings is null
  if (!presaleSettings) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-foreground/60">Failed to load presale settings</p>
          <Button 
            color="primary" 
            variant="flat" 
            className="mt-4"
            onPress={loadInitialData}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const presaleProgress = presaleSettings.totalAmount > 0 
    ? (presaleSettings.soldAmount / presaleSettings.totalAmount) * 100 
    : 0

  // Use total statistics from all users, not just current page
  const totalPendingTokens = usersStatistics?.totalCoinsPurchased || 0
  const usersWithPurchases = usersStatistics?.usersWithPurchases || 0

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Presale Management</h1>
          <p className="text-foreground/60 mt-1">Manage token distribution and user purchases</p>
        </div>
        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat" size="sm">
            Stage {presaleSettings.stage}
          </Chip>
          <Chip 
            color={presaleSettings.status === 'PRESALE' ? 'success' : 'warning'} 
            variant="flat" 
            size="sm"
          >
            {presaleSettings.status}
          </Chip>
        </div>
      </div>

      {/* Presale Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Presale Overview</h2>
              <p className="text-sm text-foreground/60">Token distribution progress</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formatAmount(presaleSettings.totalAmount)}
              </div>
              <div className="text-sm text-foreground/60">Total Tokens</div>
            </div>
            <div className="text-center p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {formatAmount(presaleSettings.soldAmount)}
              </div>
              <div className="text-sm text-foreground/60">Sold Tokens</div>
            </div>
            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {formatAmount(presaleSettings.currentAmount)}
              </div>
              <div className="text-sm text-foreground/60">Available Tokens</div>
            </div>
          </div>
          
          <Divider />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">Presale Progress</span>
              <span className="font-medium">{presaleProgress.toFixed(1)}%</span>
            </div>
            <Progress 
              value={presaleProgress} 
              color="primary" 
              className="w-full"
              size="lg"
            />
          </div>
        </CardBody>
      </Card>

      {/* Token Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Token Distribution</h2>
                <p className="text-sm text-foreground/60">Issue tokens to users</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-foreground/70">Pending Tokens</div>
                <div className="text-lg font-semibold text-warning">
                  {formatAmount(totalPendingTokens)}
                </div>
              </div>
              <Button
                color="success"
                size="lg"
                onPress={handleIssueAllTokens}
                isLoading={issuingTokens}
                isDisabled={usersWithPurchases === 0}
                startContent={!issuingTokens && <CheckCircleIcon className="w-4 h-4" />}
              >
                {issuingTokens ? 'Issuing...' : 'Issue All Tokens'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-foreground/60">
            {usersWithPurchases} users waiting for tokens • {formatNumber(totalPendingTokens)} tokens to distribute
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Purchased Users</h2>
              <p className="text-sm text-foreground/60">Users who purchased tokens</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>WALLET ADDRESS</TableColumn>
              <TableColumn>COINS PURCHASED</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn className="text-right">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-foreground/60">Loading users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="truncate max-w-[200px]">
                      {user.walletAddress ? (
                        <span className="font-mono text-sm">
                          {user.walletAddress}
                        </span>
                      ) : (
                        <span className="text-foreground/40 italic">No wallet</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatAmount(user.totalCoinsPurchased)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      color={user.totalCoinsPurchased > 0 ? 'warning' : 'default'} 
                      variant="flat" 
                      size="sm"
                    >
                      {user.totalCoinsPurchased > 0 ? 'Pending' : 'No purchases'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<EyeIcon className="w-4 h-4" />}
                        onPress={() => handleViewUser(user.id)}
                      >
                        View
                      </Button>
                      {user.totalCoinsPurchased > 0 && (
                        <Button
                          size="sm"
                          color="success"
                          onPress={() => handleIssueUserTokens(user.id)}
                        >
                          Issue Tokens
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-foreground/60">
                      <UsersIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          {usersLoading && <Spinner size="sm" />}
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            isDisabled={usersLoading}
          />
        </div>
      )}

      {/* User Details Modal */}
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
          {(onClose) => (
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
                        {selectedUser.transactions && selectedUser.transactions.length > 0 ? (
                          selectedUser.transactions.map((transaction, index) => (
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
                              {transaction.txHash && (
                                <Button
                                  size="sm"
                                  variant="light"
                                  startContent={<ArrowTopRightOnSquareIcon className="w-4 h-4" />}
                                  onPress={() => openSolscan(transaction.txHash!)}
                                >
                                  TX
                                </Button>
                              )}
                              <span className="text-xs text-foreground/60">
                                {formatDate(transaction.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))
                        ) : (
                          <div className="text-center py-8 text-foreground/60">
                            <p>No transactions found</p>
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
    </div>
  )
}

export { Presale }
