import { Card, CardBody, CardHeader, Input, Divider } from '@heroui/react'
import ImagePicker from '@/widgets/ImagePicker'
import type { DocsConfigData } from '@/services/docsConfigApi'
import type { MediaFile } from '@/pages/MediaLibrary/model'

interface HomepageSectionProps {
  config: DocsConfigData
  selectedFeatureImages: (MediaFile | null)[]
  onConfigChange: (field: keyof DocsConfigData, value: any) => void
  onFeatureImageSelect: (index: number, selectedImages: MediaFile[]) => void
}

export const HomepageSection: React.FC<HomepageSectionProps> = ({
  config,
  selectedFeatureImages,
  onConfigChange,
  onFeatureImageSelect
}) => {
  const handleInputChange = (field: keyof DocsConfigData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange(field, e.target.value)
  }

  const features = [
    {
      title: config.feature1Title || '',
      text: config.feature1Text || '',
      image: config.feature1Image || ''
    },
    {
      title: config.feature2Title || '',
      text: config.feature2Text || '',
      image: config.feature2Image || ''
    },
    {
      title: config.feature3Title || '',
      text: config.feature3Text || '',
      image: config.feature3Image || ''
    }
  ]

  const handleFeatureChange = (index: number, field: 'title' | 'text') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = `feature${index + 1}${field === 'title' ? 'Title' : 'Text'}` as keyof DocsConfigData
    onConfigChange(fieldName, e.target.value)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-xl font-semibold text-foreground">Homepage Features</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="space-y-6">
          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Feature Cards</h3>
            {features.map((feature, index) => (
              <div key={index} className="p-4 border border-divider rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label={`Feature ${index + 1} Title`}
                    placeholder="Enter feature title"
                    value={feature.title}
                    onChange={handleFeatureChange(index, 'title')}
                    variant="bordered"
                    classNames={{
                      base: 'dark',
                      input: 'dark text-white',
                      inputWrapper: 'dark',
                      label: 'dark text-foreground/60',
                    }}
                  />
                  
                  <div>
                    <div className="space-y-2">
                      <label className="text-sm text-foreground/60">Feature {index + 1} Image</label>
                      <ImagePicker
                        onSelect={(selectedImages) => onFeatureImageSelect(index, selectedImages)}
                        selectedImages={selectedFeatureImages[index] ? [selectedFeatureImages[index]!] : []}
                        placeholder="Select image"
                        multiple={false}
                        maxSelection={1}
                      />
                      {selectedFeatureImages[index] && (
                        <div className="mt-2 p-2 bg-content2 rounded-lg">
                          <p className="text-xs text-foreground/60">
                            Selected: {selectedFeatureImages[index]!.originalName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Input
                  label={`Feature ${index + 1} Description`}
                  placeholder="Enter feature description"
                  value={feature.text}
                  onChange={handleFeatureChange(index, 'text')}
                  variant="bordered"
                  classNames={{
                    base: 'dark',
                    input: 'dark text-white',
                    inputWrapper: 'dark',
                    label: 'dark text-foreground/60',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Button Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Call-to-Action Button</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Button Text"
                placeholder="Read More"
                value={config.buttonText}
                onChange={handleInputChange('buttonText')}
                variant="bordered"
                classNames={{
                  base: 'dark',
                  input: 'dark text-white',
                  inputWrapper: 'dark',
                  label: 'dark text-foreground/60',
                }}
              />
              
              <Input
                label="Button Link"
                placeholder="/docs"
                value={config.buttonLink}
                onChange={handleInputChange('buttonLink')}
                variant="bordered"
                classNames={{
                  base: 'dark',
                  input: 'dark text-white',
                  inputWrapper: 'dark',
                  label: 'dark text-foreground/60',
                }}
              />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}