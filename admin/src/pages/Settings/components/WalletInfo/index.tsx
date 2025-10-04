import React from 'react'

interface WalletInfoProps {
  updatedAt?: string
}

export const WalletInfo: React.FC<WalletInfoProps> = ({ updatedAt }) => {
  if (!updatedAt) {
    return null
  }

  return (
    <div>
      <span className="font-medium text-sm">Last Updated:</span>
      <span className="ml-2 text-xs text-foreground/60">
        {new Date(updatedAt).toLocaleString()}
      </span>
    </div>
  )
}
