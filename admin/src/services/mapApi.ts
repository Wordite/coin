import { api } from '../app/api'

export interface MapZone {
  id: string
  name: string
  x: number
  y: number
  fontSize: number
  color: string
}

export interface MapMarkerCard {
  id: string
  photo?: string
  title?: string
  description?: string
  apy: number
  vip: string
  price: number
}

export interface MapMarker {
  id: string
  x: number
  y: number
  color: string
  size: number
  title?: string
  cards: MapMarkerCard[]
}

export interface MapSettings {
  id: string
  title: string
  zones: MapZone[]
  markers: MapMarker[]
}

class MapApiService {
  async getSettings(): Promise<MapSettings> {
    const response = await api.get('/map/settings')
    return response.data
  }

  async updateSettings(data: { title?: string }): Promise<MapSettings> {
    const response = await api.put('/map/settings', data)
    return response.data
  }

  // Zones
  async createZone(data: {
    name: string
    x: number
    y: number
    fontSize?: number
    color?: string
  }): Promise<MapZone> {
    const response = await api.post('/map/zones', data)
    return response.data
  }

  async updateZone(
    id: string,
    data: {
      name?: string
      x?: number
      y?: number
      fontSize?: number
      color?: string
    },
  ): Promise<MapZone> {
    const response = await api.put(`/map/zones/${id}`, data)
    return response.data
  }

  async deleteZone(id: string): Promise<void> {
    await api.delete(`/map/zones/${id}`)
  }

  // Markers
  async createMarker(data: {
    x: number
    y: number
    color?: string
    size?: number
    title?: string
  }): Promise<MapMarker> {
    const response = await api.post('/map/markers', data)
    return response.data
  }

  async updateMarker(
    id: string,
    data: {
      x?: number
      y?: number
      color?: string
      size?: number
      title?: string
    },
  ): Promise<MapMarker> {
    const response = await api.put(`/map/markers/${id}`, data)
    return response.data
  }

  async deleteMarker(id: string): Promise<void> {
    await api.delete(`/map/markers/${id}`)
  }

  // Marker Cards
  async createMarkerCard(
    markerId: string,
    data: {
      photo?: string
      title?: string
      description?: string
      apy?: number
      vip?: string
      price?: number
    },
  ): Promise<MapMarkerCard> {
    const response = await api.post(`/map/markers/${markerId}/cards`, data)
    return response.data
  }

  async updateMarkerCard(
    id: string,
    data: {
      photo?: string
      title?: string
      description?: string
      apy?: number
      vip?: string
      price?: number
    },
  ): Promise<MapMarkerCard> {
    const response = await api.put(`/map/cards/${id}`, data)
    return response.data
  }

  async deleteMarkerCard(id: string): Promise<void> {
    await api.delete(`/map/cards/${id}`)
  }
}

export const mapApi = new MapApiService()
