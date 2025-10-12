import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react'
import { EyeIcon, CurrencyDollarIcon, ChevronUpDownIcon, ArrowTopRightOnSquareIcon, TrashIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Notify } from '@/services/notify'
import { usersApi, type UserWithTransactions } from '@/services/usersApi'

const Users = () => {
  const [users, setUsers] = useState<UserWithTransactions[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState<UserWithTransactions | null>(null)
  const [newCoinsAmount, setNewCoinsAmount] = useState(0)
  const [updating, setUpdating] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRoleChangeConfirm, setShowRoleChangeConfirm] = useState(false)
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN' | 'MANAGER'>('USER')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    console.log('Current newRole state:', newRole);
  }, [newRole]);
  
  const { isOpen, onOpen, onClose } = useDisclosure()

  const loadUsers = async (page: number = 1, newSortBy?: string, newSortOrder?: 'asc' | 'desc', search?: string) => {
    try {
      setLoading(true)
      const currentSortBy = newSortBy || sortBy
      const currentSortOrder = newSortOrder || sortOrder
      const currentSearch = search !== undefined ? search : searchQuery
      
      const response = await usersApi.getUsers(page, 10, currentSortBy, currentSortOrder, currentSearch)
      
      // Only update state after successful response - don't clear users array
      setUsers(response.users)
      setTotalPages(response.totalPages)
      setTotal(response.total)
      
      // Mark initial loading as complete
      if (initialLoading) {
        setInitialLoading(false)
      }
    } catch (err) {
      Notify.error('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(currentPage)
  }, [currentPage, sortBy, sortOrder])

  const handleSort = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1) // Reset to first page when sorting
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
    loadUsers(1, sortBy, sortOrder, query)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const openSolscan = (txHash: string) => {
    const solscanUrl = `https://solscan.io/tx/${txHash}`
    window.open(solscanUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      setUpdating(true)
      await usersApi.deleteUser(selectedUser.id)
      
      Notify.success('User deleted successfully')
      setShowDeleteConfirm(false)
      onClose()
      loadUsers(currentPage, sortBy, sortOrder)
    } catch (error) {
      console.error('Error deleting user:', error)
      Notify.error('Failed to delete user')
    } finally {
      setUpdating(false)
    }
  }

  const handleChangeRole = async () => {
    if (!selectedUser) return
    
    try {
      setUpdating(true)
      await usersApi.updateUserRole(selectedUser.id, newRole)
      
      const roleDisplayName = newRole === 'USER' ? 'User' : newRole === 'ADMIN' ? 'Admin' : 'Manager'
      Notify.success(`User role changed to ${roleDisplayName}`)
      setShowRoleChangeConfirm(false)
      onClose()
      loadUsers(currentPage, sortBy, sortOrder)
    } catch (error) {
      console.error('Error changing user role:', error)
      Notify.error('Failed to change user role')
    } finally {
      setUpdating(false)
    }
  }

  const handleViewUser = async (userId: string) => {
    try {
      const user = await usersApi.getUserById(userId)
      setSelectedUser(user)
      setNewCoinsAmount(user.totalCoinsPurchased)
      onOpen()
    } catch (err) {
      Notify.error('Failed to load user details')
      console.error(err)
    }
  }

  const handleUpdateCoins = async () => {
    if (!selectedUser) return

    try {
      setUpdating(true)
      const updatedUser = await usersApi.updateUserCoins(selectedUser.id, newCoinsAmount)
      setSelectedUser(updatedUser)
      
      // Update user in the list
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ))
      
      Notify.success('User coins updated successfully')
    } catch (err) {
      Notify.error('Failed to update user coins')
      console.error(err)
    } finally {
      setUpdating(false)
    }
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



  const formatAmount = (amount: number) => {
    if (!amount) return '0'

    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-foreground/60">Manage users and their presale transactions</p>
        </div>
        <div className="text-sm text-foreground/60">
          Total: {total} users
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Users List</h2>
                <p className="text-sm text-foreground/60">View and manage all users</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-foreground/50" />}
                className="max-w-xs"
                size="sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>
                <Button
                  variant="light"
                  size="sm"
                  className="h-auto px-3 py-2 font-semibold"
                  onPress={() => handleSort('email')}
                  endContent={
                    sortBy === 'email' ? (
                      <ChevronUpDownIcon className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    ) : (
                      <ChevronUpDownIcon className="w-4 h-4 opacity-30" />
                    )
                  }
                >
                  EMAIL
                </Button>
              </TableColumn>
              <TableColumn>
                <Button
                  variant="light"
                  size="sm"
                  className="h-auto px-3 py-2 font-semibold"
                  onPress={() => handleSort('walletAddress')}
                  endContent={
                    sortBy === 'walletAddress' ? (
                      <ChevronUpDownIcon className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    ) : (
                      <ChevronUpDownIcon className="w-4 h-4 opacity-30" />
                    )
                  }
                >
                  WALLET ADDRESS
                </Button>
              </TableColumn>
              <TableColumn>
                <Button
                  variant="light"
                  size="sm"
                  className="h-auto px-3 py-2 font-semibold"
                  onPress={() => handleSort('role')}
                  endContent={
                    sortBy === 'role' ? (
                      <ChevronUpDownIcon className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    ) : (
                      <ChevronUpDownIcon className="w-4 h-4 opacity-30" />
                    )
                  }
                >
                  ROLE
                </Button>
              </TableColumn>
              <TableColumn>TOTAL SPENT</TableColumn>
              <TableColumn>COINS PURCHASED</TableColumn>
              <TableColumn>
                <Button
                  variant="light"
                  size="sm"
                  className="h-auto px-3 py-2 font-semibold"
                  onPress={() => handleSort('createdAt')}
                  endContent={
                    sortBy === 'createdAt' ? (
                      <ChevronUpDownIcon className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    ) : (
                      <ChevronUpDownIcon className="w-4 h-4 opacity-30" />
                    )
                  }
                >
                  JOINED
                </Button>
              </TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.email || (
                      <span className="text-foreground/40 italic">No email</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-content2 px-2 py-1 rounded">
                      {formatWalletAddress(user.walletAddress)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={user.role === 'ADMIN' ? 'danger' : 'default'}
                      variant="flat"
                      size="sm"
                    >
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>SOL: {formatAmount(user.totalSpentSOL)}</div>
                      <div>USDT: {formatAmount(user.totalSpentUSDT)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatAmount(user.totalCoinsPurchased)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground/60">
                      {formatDate(user.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<EyeIcon className="w-4 h-4" />}
                      onPress={() => handleViewUser(user.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-foreground/60">
                      <UsersIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              {loading && <Spinner size="sm" />}
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                showControls
                isDisabled={loading}
              />
            </div>
          )}
        </CardBody>
      </Card>

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

                    {/* Admin Actions */}
                    <div>
                      <h3 className="font-semibold mb-3">Admin Actions</h3>
                      <div className="flex items-center gap-4">
                        <Input
                          label="New Coins Amount"
                          type="number"
                          value={newCoinsAmount.toString()}
                          onChange={(e) => setNewCoinsAmount(parseFloat(e.target.value) || 0)}
                          className="max-w-xs"
                        />
                        <Button
                          color="primary"
                          onPress={handleUpdateCoins}
                          isLoading={updating}
                          disabled={newCoinsAmount === selectedUser.totalCoinsPurchased}
                        >
                          Update Coins
                        </Button>
                      </div>
                      <p className="text-xs text-foreground/60 mt-2">
                        This will create an adjustment transaction in the user's history
                      </p>
                      
                      <div className="flex gap-3 mt-4">
                        <div className="flex flex-col">
                                                  <Button
                          color="warning"
                          variant="flat"
                          startContent={<UserIcon className="w-4 h-4" />}
                          onPress={() => {
                            setNewRole(selectedUser.role as 'USER' | 'ADMIN' | 'MANAGER')
                            setShowRoleChangeConfirm(true)
                          }}
                          disabled={updating || !selectedUser.email}
                        >
                          Change Role
                        </Button>
                          {!selectedUser.email && (
                            <p className="text-xs text-foreground/60 mt-1">
                              Cannot change role for users without email
                            </p>
                          )}
                        </div>
                        
                        <Button
                          color="danger"
                          variant="flat"
                          startContent={<TrashIcon className="w-4 h-4" />}
                          onPress={() => setShowDeleteConfirm(true)}
                          disabled={updating}
                        >
                          Delete User
                        </Button>
                      </div>
                    </div>

                    <Divider />

                    {/* Transactions */}
                    <div>
                      <h3 className="font-semibold mb-3">Transaction History</h3>
                      {selectedUser.transactions.length === 0 ? (
                        <p className="text-foreground/60 text-sm">No transactions yet</p>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {selectedUser.transactions.map((transaction) => (
                            <div key={transaction.id} className="p-3 bg-content2 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Chip
                                      color={transaction.type === 'SOL' ? 'warning' : 'success'}
                                      variant="flat"
                                      size="sm"
                                    >
                                      {transaction.type}
                                    </Chip>
                                    {transaction.txHash === 'ADMIN_ADJUSTMENT' && (
                                      <Chip color="primary" variant="flat" size="sm">
                                        Admin Adjustment
                                      </Chip>
                                    )}
                                  </div>
                                  <div className="text-sm mt-1">
                                    <div>Amount: {formatAmount(transaction.amount)} {transaction.type}</div>
                                    <div>Rate: {transaction.rate}</div>
                                    <div>Coins: {formatAmount(transaction.coinsPurchased)}</div>
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
                                    {transaction.txHash && transaction.txHash !== 'ADMIN_ADJUSTMENT' && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="text-xs text-foreground/60">
                                          TX: {transaction.txHash.slice(0, 8)}...
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="light"
                                          isIconOnly
                                          className="h-6 w-6 min-w-6"
                                          onPress={() => openSolscan(transaction.txHash!)}
                                          title="View on Solscan"
                                        >
                                          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-foreground/60">
                                  {formatDate(transaction.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        className="dark"
        classNames={{
          base: "bg-content1 dark text-foreground border border-divider",
          header: "bg-content1 dark text-foreground border-b border-divider",
          body: "bg-content1 dark text-foreground",
          footer: "bg-content1 dark text-foreground border-t border-divider"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Delete User</h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-foreground/80">
                  Are you sure you want to delete user <strong>{selectedUser?.email || selectedUser?.walletAddress}</strong>?
                </p>
                <p className="text-sm text-danger mt-2">
                  This action cannot be undone. All user data and transaction history will be permanently deleted.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="danger" 
                  onPress={handleDeleteUser}
                  isLoading={updating}
                >
                  Delete User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Role Change Confirmation Modal */}
      <Modal 
        isOpen={showRoleChangeConfirm} 
        onClose={() => setShowRoleChangeConfirm(false)}
        className="dark"
        classNames={{
          base: "bg-content1 dark text-foreground border border-divider",
          header: "bg-content1 dark text-foreground border-b border-divider",
          body: "bg-content1 dark text-foreground",
          footer: "bg-content1 dark text-foreground border-t border-divider"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Change User Role</h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-foreground/80">
                  Change the role of user <strong>{selectedUser?.email || selectedUser?.walletAddress}</strong> from <strong>{selectedUser?.role}</strong> to:
                </p>
                
                <div className="mt-4">
                  <Dropdown classNames={{
                    content: "bg-content1 text-foreground"
                  }}>
                    <DropdownTrigger>
                      <Button variant="bordered" className="w-full justify-between bg-content1 text-foreground border-default">
                        {newRole === 'USER' ? 'User' : newRole === 'ADMIN' ? 'Admin' : 'Manager'}
                        <ChevronUpDownIcon className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                      aria-label="Select role"
                      selectedKeys={[newRole]}
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        console.log('Dropdown keys received:', keys);
                        const selectedRole = Array.from(keys)[0] as 'USER' | 'ADMIN' | 'MANAGER'
                        console.log('Selected role:', selectedRole);
                        if (selectedRole) {
                          setNewRole(selectedRole)
                        }
                      }}
                    >
                      <DropdownItem key="USER">User</DropdownItem>
                      <DropdownItem key="MANAGER">Manager</DropdownItem>
                      <DropdownItem key="ADMIN">Admin</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                
                <p className="text-sm text-warning mt-2">
                  This will change the user's access permissions in the admin panel.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="warning" 
                  onPress={handleChangeRole}
                  isLoading={updating}
                  disabled={newRole === selectedUser?.role}
                >
                  Change Role
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Users