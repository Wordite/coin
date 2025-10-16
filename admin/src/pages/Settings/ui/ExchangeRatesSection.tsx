import React from 'react'
import { Card, CardBody, CardHeader, Input, Divider, Chip } from '@heroui/react'
import type { ExchangeRatesSectionProps } from '../model/types'

export const ExchangeRatesSection: React.FC<ExchangeRatesSectionProps> = ({
  settings,
  setSettings
}) => {
  const handleInputChange = (field: keyof typeof settings, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Exchange Rates</h2>
            <p className="text-sm text-foreground/60">Configure cryptocurrency exchange rates</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Current Rates Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* USDT Rate Card */}
          <div className="relative p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm flex items-center justify-center">$</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">USDT Rate</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-300">Tether to Coin</p>
                </div>
              </div>
              <Chip 
                color="primary" 
                variant="flat" 
                size="sm"
                className="font-mono"
              >
                {parseFloat(settings.usdtToCoinRate.toString())}
              </Chip>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                1 USDT = {parseFloat(settings.usdtToCoinRate.toString())} Coins
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-300">
                {settings.usdtToCoinRate > 0 ? `1 Coin = ${parseFloat((1 / settings.usdtToCoinRate).toString())} USDT` : 'Rate not set'}
              </div>
            </div>
          </div>

          {/* SOL Rate Card */}
          <div className="relative p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm flex items-center justify-center pb-[0.27rem]">◎</span>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">SOL Rate</h3>
                  <p className="text-xs text-purple-600 dark:text-purple-300">Solana to Coin</p>
                </div>
              </div>
              <Chip 
                color="secondary" 
                variant="flat" 
                size="sm"
                className="font-mono"
              >
                {parseFloat(settings.solToCoinRate.toString())}
              </Chip>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                1 SOL = {parseFloat(settings.solToCoinRate.toString())} Coins
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-300">
                {settings.solToCoinRate > 0 ? `1 Coin = ${parseFloat((1 / settings.solToCoinRate).toString())} SOL` : 'Rate not set'}
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Rate Inputs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Configure Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs leading-none">$</span>
                </div>
                <label className="text-sm font-medium text-foreground">USDT to Coin Rate</label>
              </div>
              <Input
                placeholder="0"
                type="number"
                step="any"
                min="0"
                value={settings.usdtToCoinRate === 0 ? '' : settings.usdtToCoinRate.toString()}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || value === '.') {
                    handleInputChange('usdtToCoinRate', 0)
                  } else {
                    const numValue = parseFloat(value)
                    if (!isNaN(numValue)) {
                      handleInputChange('usdtToCoinRate', numValue)
                    }
                  }
                }}
                startContent={
                  <div className="flex items-center justify-center">
                    <span className="text-foreground/60 leading-none">$</span>
                  </div>
                }
                endContent={
                  <span className="text-foreground/60 text-sm">coins</span>
                }
                classNames={{
                  input: "text-foreground font-mono",
                  inputWrapper: "border-blue-200 dark:border-blue-700 items-center",
                }}
                description="How many coins user gets for 1 USDT"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs leading-none pl-[0.05rem] pb-[0.1rem]">◎</span>
                </div>
                <label className="text-sm font-medium text-foreground">SOL to Coin Rate</label>
              </div>
              <Input
                placeholder="0"
                type="number"
                step="any"
                className='leading-[1em]'
                min="0"
                value={settings.solToCoinRate === 0 ? '' : settings.solToCoinRate.toString()}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || value === '.') {
                    handleInputChange('solToCoinRate', 0)
                  } else {
                    const numValue = parseFloat(value)
                    if (!isNaN(numValue)) {
                      handleInputChange('solToCoinRate', numValue)
                    }
                  }
                }}
                startContent={
                  <div className="flex items-center justify-center">
                    <span className="text-foreground/60 text-lg font-semibold pb-[0.4rem]">◎</span>
                  </div>
                }
                endContent={
                  <span className="text-foreground/60 text-sm">coins</span>
                }
                classNames={{
                  input: "text-foreground font-mono",
                  inputWrapper: "border-purple-200 dark:border-purple-700 items-center",
                }}
                description="How many coins user gets for 1 SOL"
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
