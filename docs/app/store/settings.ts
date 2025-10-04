import { create } from 'zustand'

interface DocsConfig {
  // Основные настройки сайта
  title: string
  tagline: string
  
  // Настройки навигации
  navbarTitle: string
  logoSrc: string
  
  // Настройки карточек на главной странице
  feature1Title?: string
  feature1Text?: string
  feature1Image?: string
  
  feature2Title?: string
  feature2Text?: string
  feature2Image?: string
  
  feature3Title?: string
  feature3Text?: string
  feature3Image?: string
  
  // Настройки кнопки
  buttonText: string
  buttonLink: string
}

interface SettingsStore {
  docsConfig: DocsConfig
  setDocsConfig: (config: DocsConfig) => void
}

const useSettingsStore = create<SettingsStore>((set) => ({
  docsConfig: {
    title: 'Loading...',
    tagline: 'Loading...',
    navbarTitle: '...',
    logoSrc: 'img/logo.svg',
    buttonText: 'Read More',
    buttonLink: '/docs'
  },
  setDocsConfig: (docsConfig: DocsConfig) => {
    set((state) => ({ ...state, docsConfig }))
  },
}))

export { useSettingsStore }
