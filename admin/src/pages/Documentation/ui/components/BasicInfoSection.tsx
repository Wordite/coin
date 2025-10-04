import { Card, CardBody, CardHeader, Input, Divider } from '@heroui/react'
import type { DocsConfigData } from '@/services/docsConfigApi'

interface BasicInfoSectionProps {
  config: DocsConfigData
  onConfigChange: (field: keyof DocsConfigData, value: any) => void
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ config, onConfigChange }) => {
  const handleInputChange = (field: keyof DocsConfigData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange(field, e.target.value)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Site Title"
            placeholder="Enter site title"
            value={config.title}
            onChange={handleInputChange('title')}
            variant="bordered"
            classNames={{
              base: 'dark',
              input: 'dark text-white',
              inputWrapper: 'dark',
              label: 'dark text-foreground/60',
            }}
          />
          
          <Input
            label="Tagline"
            placeholder="Enter tagline"
            value={config.tagline}
            onChange={handleInputChange('tagline')}
            variant="bordered"
            classNames={{
              base: 'dark',
              input: 'dark text-white',
              inputWrapper: 'dark',
              label: 'dark text-foreground/60',
            }}
          />
          
          <Input
            label="Navbar Title"
            placeholder="Enter navbar title"
            value={config.navbarTitle}
            onChange={handleInputChange('navbarTitle')}
            variant="bordered"
            classNames={{
              base: 'dark',
              input: 'dark text-white',
              inputWrapper: 'dark',
              label: 'dark text-foreground/60',
            }}
          />
        </div>
      </CardBody>
    </Card>
  )
}