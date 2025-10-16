import React from 'react'
import { Card, CardBody, CardHeader, Button } from '@heroui/react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import type { TokenDistributionProps } from '../model/types'

export const TokenDistribution: React.FC<TokenDistributionProps> = ({
  totalPendingTokens,
  usersWithPendingTokens,
  issuingTokens,
  onIssueAllTokens
}) => {
  const formatAmount = (amount: number) => {
    if (isNaN(amount) || !amount) return '0'
  
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }

  return (
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
              onPress={onIssueAllTokens}
              isLoading={issuingTokens}
              isDisabled={usersWithPendingTokens === 0}
              startContent={!issuingTokens && <CheckCircleIcon className="w-4 h-4" />}
            >
              {issuingTokens ? 'Issuing...' : 'Issue All Tokens'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="text-sm text-foreground/60">
          {usersWithPendingTokens} users waiting for tokens • {totalPendingTokens.toLocaleString()} tokens to distribute
        </div>
      </CardBody>
    </Card>
  )
}
