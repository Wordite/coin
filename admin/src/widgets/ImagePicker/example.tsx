import React, { useState } from 'react'
import { Card, CardBody, Button } from '@heroui/react'
import { ImagePicker } from './index'
import type { MediaFile } from '@/pages/MediaLibrary/model'

const ImagePickerExample: React.FC = () => {
  const [singleImage, setSingleImage] = useState<MediaFile | null>(null)
  const [multipleImages, setMultipleImages] = useState<MediaFile[]>([])

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-bold'>ImagePicker Examples</h1>
      
      {/* Single Image Selection */}
      <Card>
        <CardBody>
          <h2 className='text-lg font-semibold mb-4'>Single Image Selection</h2>
          <div className='space-y-4'>
            <ImagePicker
              onSelect={(images) => setSingleImage(images[0] || null)}
              selectedImages={singleImage ? [singleImage] : []}
              placeholder='Select a single image...'
              className='max-w-md'
            />

          </div>
        </CardBody>
      </Card>

      {/* Multiple Image Selection */}
      <Card>
        <CardBody>
          <h2 className='text-lg font-semibold mb-4'>Multiple Image Selection</h2>
          <div className='space-y-4'>
            <ImagePicker
              onSelect={setMultipleImages}
              selectedImages={multipleImages}
              multiple={true}
              maxSelection={5}
              placeholder='Select up to 5 images...'
              className='max-w-md'
            />

          </div>
        </CardBody>
      </Card>

      {/* Clear Buttons */}
      <div className='flex gap-4'>
        <Button
          variant='bordered'
          onPress={() => setSingleImage(null)}
          disabled={!singleImage}
        >
          Clear Single Selection
        </Button>
        <Button
          variant='bordered'
          onPress={() => setMultipleImages([])}
          disabled={multipleImages.length === 0}
        >
          Clear Multiple Selection
        </Button>
      </div>
    </div>
  )
}

export default ImagePickerExample 