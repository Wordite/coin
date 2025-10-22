import React from 'react'
import { Card, CardBody, CardHeader, Input, Select, SelectItem } from '@heroui/react'
import type { PresaleSettingsSectionProps } from '../model/types'

export const CoinSettingsSection: React.FC<PresaleSettingsSectionProps> = ({
  presaleSettings,
  setPresaleSettings,
  availableStages,
  setAvailableStages
}) => {
  const handlePresaleInputChange = (field: keyof typeof presaleSettings, value: any) => {
    setPresaleSettings({
      ...presaleSettings,
      [field]: value
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Coin Settings</h2>
            <p className="text-sm text-foreground/60">Configure token presale parameters</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label="Coin Name"
          placeholder="Enter coin name"
          value={presaleSettings.name}
          onChange={(e) => handlePresaleInputChange('name', e.target.value)}
          description="Name of the cryptocurrency token"
          classNames={{
            input: "text-foreground",
            label: "text-foreground/70",
          }}
        />
        
        <Input
          label="Mint Address"
          placeholder="Enter Solana mint address"
          value={presaleSettings.mintAddress || ''}
          onChange={(e) => handlePresaleInputChange('mintAddress', e.target.value)}
          description="Solana token mint address (e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU)"
          classNames={{
            input: "text-foreground",
            label: "text-foreground/70",
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Total Token Amount"
            placeholder="1000000"
            type="number"
            value={presaleSettings.totalAmount.toString()}
            onChange={(e) => handlePresaleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
            description="Total number of tokens available for presale"
            classNames={{
              input: "text-foreground",
              label: "text-foreground/70",
            }}
          />
          
          <Input
            label="Decimals"
            placeholder="6"
            type="number"
            min="0"
            max="18"
            value={presaleSettings.decimals.toString()}
            onChange={(e) => handlePresaleInputChange('decimals', parseInt(e.target.value) || 6)}
            description="Number of decimal places for the token"
            classNames={{
              input: "text-foreground",
              label: "text-foreground/70",
            }}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Minimum Buy Amount"
            placeholder="100"
            type="number"
            min="0"
            step="0.000001"
            value={presaleSettings.minBuyAmount.toString()}
            onChange={(e) => handlePresaleInputChange('minBuyAmount', parseFloat(e.target.value) || 0)}
            description="Minimum amount users can buy"
            classNames={{
              input: "text-foreground",
              label: "text-foreground/70",
            }}
          />
          
          <Input
            label="Maximum Buy Amount"
            placeholder="1000000"
            type="number"
            min="0"
            step="0.000001"
            value={presaleSettings.maxBuyAmount.toString()}
            onChange={(e) => handlePresaleInputChange('maxBuyAmount', parseFloat(e.target.value) || 1000000)}
            description="Maximum amount users can buy"
            classNames={{
              input: "text-foreground",
              label: "text-foreground/70",
            }}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Current Stage"
            placeholder="Select stage"
            defaultSelectedKeys={presaleSettings.stage ? new Set([presaleSettings.stage.toString()]) : new Set()}
            selectedKeys={presaleSettings.stage ? new Set([presaleSettings.stage.toString()]) : new Set()}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0] as string
              if (selectedKey) {
                handlePresaleInputChange('stage', parseInt(selectedKey))
              }
            }}
            classNames={{
              trigger: "text-foreground",
              label: "text-foreground/70",
            }}
          >
            {availableStages.map((stage) => (
              <SelectItem key={stage.toString()} textValue={`Stage ${stage}`}>
                Stage {stage}
              </SelectItem>
            ))}
          </Select>
        </div>
      </CardBody>
    </Card>
  )
}
