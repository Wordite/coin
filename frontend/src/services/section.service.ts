import { api } from '@/app/api'

class Section {
  private static baseUrl = 'section/public/url'

  static getHeroData() {
    return api.get(`${this.baseUrl}/hero-section`)
  }

  static getSectionByUrl(url: string) {
    return api.get(`${this.baseUrl}/${url}`)
  }

  static getImageUrl(url: string) {
    const baseUrl = import.meta.env.VITE_BACKEND_URL
    const emptyUrl = baseUrl.replace('/api', '')

    return `${emptyUrl}${url}`
  }
}

export { Section }
