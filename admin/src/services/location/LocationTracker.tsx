import { useLocation } from 'react-router'
import { Location } from './index'
import { useEffect } from 'react'

const LocationTracker = () => {
  const location = useLocation()

  useEffect(() => {
    Location.set(location.pathname)
  }, [location.pathname])

  return null
}

export { LocationTracker }
