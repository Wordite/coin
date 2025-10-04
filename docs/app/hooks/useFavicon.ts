import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settings'
import { getImageUrl } from '@/utils/getImageUrl'

function updateFavicon(url: string) {
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")

  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }

  link.href = url
}

export function useDynamicFavicon() {
  const logoSrc = useSettingsStore((s) => s.docsConfig.logoSrc)

  useEffect(() => {
    if (logoSrc) {
      updateFavicon(getImageUrl(logoSrc))
    }
  }, [logoSrc])
}
