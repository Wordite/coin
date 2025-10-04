import { Card, CardBody, CardHeader, Divider } from '@heroui/react'
import ImagePicker from '@/widgets/ImagePicker'
import type { MediaFile } from '@/pages/MediaLibrary/model'

interface ImagesSectionProps {
  selectedNavbarLogo: MediaFile | null
  onNavbarLogoSelect: (selectedImages: MediaFile[]) => void
}

export const ImagesSection: React.FC<ImagesSectionProps> = ({
  selectedNavbarLogo,
  onNavbarLogoSelect
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-xl font-semibold text-foreground">Images</h2>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/60">Navbar Logo</label>
              <ImagePicker
                onSelect={onNavbarLogoSelect}
                selectedImages={selectedNavbarLogo ? [selectedNavbarLogo] : []}
                placeholder="img/logo.svg"
                multiple={false}
                maxSelection={1}
              />
              {selectedNavbarLogo && (
                <div className="mt-2 p-2 bg-content2 rounded-lg">
                  <p className="text-xs text-foreground/60">
                    Selected: {selectedNavbarLogo.originalName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}