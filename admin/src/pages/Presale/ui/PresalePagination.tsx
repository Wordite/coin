import React from 'react'
import { Pagination, Spinner } from '@heroui/react'
import type { PaginationProps } from '../model/types'

export const PresalePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  usersLoading,
  onPageChange
}) => {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex justify-center items-center gap-4">
      {usersLoading && <Spinner size="sm" />}
      <Pagination
        total={totalPages}
        page={currentPage}
        onChange={onPageChange}
        showControls
        isDisabled={usersLoading}
      />
    </div>
  )
}
