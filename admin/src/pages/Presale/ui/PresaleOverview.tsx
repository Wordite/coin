import React from 'react'
import { Card, CardBody, CardHeader, Progress, Divider } from '@heroui/react'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import type { PresaleOverviewProps } from '../model/types'

export const PresaleOverview: React.FC<PresaleOverviewProps> = ({
  presaleSettings,
  presaleProgress,
  walletBalance
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
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl">
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
            <div className="text-center p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {walletBalance !== undefined ? formatAmount(walletBalance) : 'Loading...'}
              </div>
              <div className="text-sm text-foreground/60">Wallet Balance Tokens</div>
            </div>
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
            aria-label={`Presale progress: ${presaleProgress.toFixed(1)}%`}
          />
        </div>
      </CardBody>
    </Card>
  )
}
