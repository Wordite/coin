import { Spinner, Chip, useDisclosure } from '@heroui/react'
import { usePresale } from './model/usePresale'
import {
  PresaleOverview,
  TokenDistribution,
  UsersTable,
  UserDetailsModal,
  PresalePagination
} from './ui'

const Presale = () => {
  const {
    presaleSettings,
    users,
    usersStatistics,
    initialLoading,
    usersLoading,
    issuingTokens,
    selectedUser,
    currentPage,
    totalPages,
    filterType,
    handleIssueAllTokens,
    handleIssueUserTokens,
    handleViewUser,
    handlePageChange,
    handleFilterChange,
    openSolscan
  } = usePresale()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleViewUserWithModal = async (userId: string) => {
    const success = await handleViewUser(userId)
    if (success) {
      onOpen()
    }
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

  const presaleProgress = presaleSettings.totalAmount > 0 
    ? (presaleSettings.soldAmount / presaleSettings.totalAmount) * 100 
    : 0

  // Use total statistics from all users, not just current page
  const totalPendingTokens = usersStatistics?.totalPendingTokens || 0
  const usersWithPendingTokens = usersStatistics?.usersWithPurchases || 0

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
      <PresaleOverview
        presaleSettings={presaleSettings}
        presaleProgress={presaleProgress}
      />

      {/* Token Distribution */}
      <TokenDistribution
        totalPendingTokens={totalPendingTokens}
        usersWithPendingTokens={usersWithPendingTokens}
        issuingTokens={issuingTokens}
        onIssueAllTokens={handleIssueAllTokens}
      />

      {/* Users Table */}
      <UsersTable
        users={users}
        usersLoading={usersLoading}
        onViewUser={handleViewUserWithModal}
        onIssueUserTokens={handleIssueUserTokens}
        filterType={filterType}
        onFilterChange={handleFilterChange}
      />

      {/* Pagination */}
      <PresalePagination
        currentPage={currentPage}
        totalPages={totalPages}
        usersLoading={usersLoading}
        onPageChange={handlePageChange}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        selectedUser={selectedUser}
        onOpenSolscan={openSolscan}
      />
    </div>
  )
}

export { Presale }
