const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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

export async function getMapSettings(): Promise<MapSettings> {
  const response = await fetch(`${API_BASE_URL}/map/settings`)
  if (!response.ok) {
    throw new Error('Failed to fetch map settings')
  }
  return response.json()
}
