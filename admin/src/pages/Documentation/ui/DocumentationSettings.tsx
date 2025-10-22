import { useState, useEffect } from 'react'
import { Spinner } from '@heroui/react'
import { docsConfigApi } from '@/services/docsConfigApi'
import type { DocsConfigData } from '@/services/docsConfigApi'
import { Notify } from '@/services/notify'
import type { MediaFile } from '@/pages/MediaLibrary/model'
import { useMedia } from '@/pages/MediaLibrary/model'
import {
  BasicInfoSection,
  ImagesSection,
  HomepageSection,
  ActionsSection
} from './components'

export const DocumentationSettings: React.FC = () => {
  const { mediaFiles, fetchMediaFiles } = useMedia()
  
  const [config, setConfig] = useState<DocsConfigData>({
    title: '',
    tagline: '',
    navbarTitle: '',
    logoSrc: '',
    feature1Title: '',
    feature1Text: '',
    feature1Image: '',
    feature2Title: '',
    feature2Text: '',
    feature2Image: '',
    feature3Title: '',
    feature3Text: '',
    feature3Image: '',
    buttonText: 'Read More',
    buttonLink: '/docs'
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Отслеживаем изменения mediaFiles и config для обновления выбранных изображений
  const [selectedNavbarLogo, setSelectedNavbarLogo] = useState<MediaFile | null>(null)
  const [selectedFeatureImages, setSelectedFeatureImages] = useState<(MediaFile | null)[]>([null, null, null])

  // Состояние для модальных окон и редактирования ссылок удалены, так как больше не используются

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const [data] = await Promise.all([
        docsConfigApi.getConfig(),
        fetchMediaFiles()
      ])
      
      setConfig(data)
      
    } catch (err) {
      Notify.error('Failed to load Docs configuration')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mediaFiles.length > 0 && config.logoSrc) {
      let logoFile = mediaFiles.find(file => file.url === config.logoSrc);
      if (!logoFile && config.logoSrc.includes('/uploads/')) {
        const relativePath = config.logoSrc.replace('http://localhost:3000', '');
        logoFile = mediaFiles.find(file => file.url === relativePath || file.url === config.logoSrc);
      }
      setSelectedNavbarLogo(logoFile || null)
    }
  }, [mediaFiles, config.logoSrc])

  // Отслеживаем изменения mediaFiles и config для обновления выбранных изображений features
  useEffect(() => {
    if (mediaFiles.length > 0) {
      const newSelectedImages = [
        config.feature1Image,
        config.feature2Image,
        config.feature3Image
      ].map(imageUrl => {
        if (imageUrl) {
          let foundFile = mediaFiles.find(file => file.url === imageUrl);
          if (!foundFile && imageUrl.includes('/uploads/')) {
            const relativePath = imageUrl.replace('http://localhost:3000', '');
            foundFile = mediaFiles.find(file => file.url === relativePath || file.url === imageUrl);
          }
          return foundFile || null;
        }
        return null;
      });
      setSelectedFeatureImages(newSelectedImages);
    }
  }, [mediaFiles, config.feature1Image, config.feature2Image, config.feature3Image])

  const handleConfigChange = (field: keyof DocsConfigData, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNavbarLogoSelect = (selectedImages: MediaFile[]) => {
    const logo = selectedImages[0] || null
    setSelectedNavbarLogo(logo)
    setConfig(prev => ({
      ...prev,
      logoSrc: logo ? logo.url : ''
    }))
  }

  const handleFeatureImageSelect = (index: number, selectedImages: MediaFile[]) => {
    const image = selectedImages[0] || null
    const newSelectedImages = [...selectedFeatureImages]
    newSelectedImages[index] = image
    setSelectedFeatureImages(newSelectedImages)

    const fieldName = `feature${index + 1}Image` as keyof DocsConfigData
    setConfig(prev => ({
      ...prev,
      [fieldName]: image ? image.url : ''
    }))
  }

  // Обработчики для navbar links и footer links удалены, так как эти поля больше не используются

  const handleSave = async () => {
    try {
      setSaving(true)
      await docsConfigApi.updateConfig(config)
      Notify.success('Configuration saved successfully')
    } catch (error) {
      Notify.error('Failed to save configuration')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Documentation Settings</h1>
        <p className="text-foreground/60">Configure your Docs documentation site</p>
            </div>
            
      <div className="space-y-6">
        <BasicInfoSection 
          config={config} 
          onConfigChange={handleConfigChange} 
        />
        
        <ImagesSection
          selectedNavbarLogo={selectedNavbarLogo}
          onNavbarLogoSelect={handleNavbarLogoSelect}
        />
        
        <HomepageSection
          config={config}
          selectedFeatureImages={selectedFeatureImages}
          onConfigChange={handleConfigChange}
          onFeatureImageSelect={handleFeatureImageSelect}
        />
        
        <ActionsSection
          saving={saving}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}