import { useSettingsStore } from '@/store/settings'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export function baseOptions(): BaseLayoutProps {
  const { docsConfig } = useSettingsStore()

  return {
    nav: {
      title: docsConfig.navbarTitle,
    },
  }
}
