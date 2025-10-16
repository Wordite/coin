import React from 'react'
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { UsersIcon, EyeIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import type { UsersTableProps } from '../model/types'

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  usersLoading,
  onViewUser,
  onIssueUserTokens,
  filterType = 'all',
  onFilterChange
}) => {
  const formatAmount = (amount: number) => {
    if (isNaN(amount) || !amount) return '0'
  
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }

  // Фильтрация теперь происходит на сервере

  const getFilterLabel = () => {
    switch (filterType) {
      case 'pending':
        return 'Pending Tokens'
      case 'issued':
        return 'Issued Tokens'
      default:
        return 'All Users'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Purchased Users</h2>
              <p className="text-sm text-foreground/60">Users who purchased tokens</p>
            </div>
          </div>
          {onFilterChange && (
            <Dropdown classNames={{
              base: 'dark',
              content: 'dark text-foreground bg-content1',
              arrow: 'dark text-foreground bg-content1',
              backdrop: 'dark text-foreground bg-content1',
              trigger: 'dark text-foreground bg-content1',
            }}>
              <DropdownTrigger>
                <Button variant="bordered" endContent={<ChevronDownIcon className="w-4 h-4" />}>
                  {getFilterLabel()}
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Filter users"
                selectedKeys={[filterType]}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as 'all' | 'pending' | 'issued'
                  if (selectedKey) {
                    onFilterChange(selectedKey)
                  }
                }}
              >
                <DropdownItem key="all">All Users</DropdownItem>
                <DropdownItem key="pending">Pending Tokens</DropdownItem>
                <DropdownItem key="issued">Issued Tokens</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <Table aria-label="Users table">
          <TableHeader>
            <TableColumn>WALLET ADDRESS</TableColumn>
            <TableColumn>COINS PURCHASED</TableColumn>
            <TableColumn>COINS RECEIVED</TableColumn>
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
            ) : (
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
                  <span className={`font-medium ${
                    user.totalCoinsReceived >= user.totalCoinsPurchased 
                      ? 'text-success' 
                      : 'text-warning'
                  }`}>
                    {formatAmount(user.totalCoinsReceived || 0)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<EyeIcon className="w-4 h-4" />}
                      onPress={() => onViewUser(user.id)}
                    >
                      View
                    </Button>
                    {user.totalPendingTokens > 0 && (
                      <Button
                        size="sm"
                        color="success"
                        onPress={() => onIssueUserTokens(user.id)}
                      >
                        Issue Tokens
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  )
}
