import React from 'react'
import { Card, CardBody, CardHeader, Input, Textarea } from '@heroui/react'
import { ImagePicker } from '@/widgets/ImagePicker'
import type { SiteSettingsSectionProps } from '../model/types'

export const SiteSettingsSection: React.FC<SiteSettingsSectionProps> = ({
  settings,
  setSettings,
  selectedLogo,
  setSelectedLogo,
  mediaFiles
}) => {
  const handleInputChange = (field: keyof typeof settings, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    })
  }

  const handleLogoSelect = (files: any[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setSelectedLogo(selectedFile)
      handleInputChange('siteLogo', selectedFile.url)
    } else {
      setSelectedLogo(null)
      handleInputChange('siteLogo', '')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Site Settings</h2>
            <p className="text-sm text-foreground/60">Configure basic site information</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label="Site Name"
          placeholder="Enter site name"
          value={settings.siteName}
          onChange={(e) => handleInputChange('siteName', e.target.value)}
          classNames={{
            input: "text-foreground",
            label: "text-foreground/70",
          }}
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">
            Site Logo (SVG format recommended)
          </label>
          <ImagePicker
            onSelect={handleLogoSelect}
            selectedImages={selectedLogo ? [selectedLogo] : []}
            placeholder="Select site logo (SVG format recommended)..."
            className="w-full"
          />
          {selectedLogo && (
            <div className="mt-2 p-2 bg-content2 rounded-lg">
              <p className="text-xs text-foreground/60">
                Selected: {selectedLogo.originalName}
                {selectedLogo.mimeType !== 'image/svg+xml' && (
                  <span className="text-warning ml-2">
                    ⚠️ Not SVG format
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
        
        <Textarea
          label="Site Description"
          placeholder="Enter site description"
          value={settings.siteDescription}
          onChange={(e) => handleInputChange('siteDescription', e.target.value)}
          classNames={{
            input: "text-foreground",
            label: "text-foreground/70",
          }}
        />
      </CardBody>
    </Card>
  )
}
