import React from 'react'
import { Card, CardBody, CardHeader, Input, Switch, Divider, Chip } from '@heroui/react'
import type { PresaleSettingsSectionProps } from '../model/types'

export const PresaleSettingsSection: React.FC<PresaleSettingsSectionProps> = ({
  settings,
  setSettings,
  presaleSettings,
  setPresaleSettings,
  availableStages,
  setAvailableStages
}) => {
  const handleInputChange = (field: keyof typeof settings, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    })
  }

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
          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Presale Settings</h2>
            <p className="text-sm text-foreground/60">Configure presale timing and status</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Presale Active</h3>
            <p className="text-xs text-foreground/60">Enable or disable presale functionality</p>
          </div>
          <Switch
            isSelected={settings.presaleActive}
            onValueChange={(value) => handleInputChange('presaleActive', value)}
            color="success"
          />
        </div>
        
        <Divider />
        
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Presale End Date & Time (UTC)"
            type="datetime-local"
            value={settings.presaleEndDateTime ? new Date(settings.presaleEndDateTime).toISOString().slice(0, 16) : ''}
            onChange={(e) => {
              const value = e.target.value
              if (value) {
                // Create UTC date from the input value without timezone conversion
                const [datePart, timePart] = value.split('T')
                const [year, month, day] = datePart.split('-').map(Number)
                const [hours, minutes] = timePart.split(':').map(Number)
                
                // Create date in UTC
                const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes))
                handleInputChange('presaleEndDateTime', utcDate.toISOString())
              } else {
                handleInputChange('presaleEndDateTime', '')
              }
            }}
            classNames={{
              input: "text-foreground",
              label: "text-foreground/70",
            }}
            description="Set the date and time when the presale should end (in UTC timezone)"
          />
        </div>
        
        {settings.presaleActive && (
          <div className="flex items-center gap-2">
            <Chip color="success" variant="flat" size="sm">
              Presale Active
            </Chip>
            <span className="text-sm text-foreground/60">
              Ends: {settings.presaleEndDateTime ? new Date(settings.presaleEndDateTime).toLocaleString('en-US', { 
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
              }) : 'Not set'}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
