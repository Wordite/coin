import type { NavigateFunction } from 'react-router'
import { Location } from '../location'

class Navigate {
  private static navigate: NavigateFunction
  static readonly paths = {
    login: '/login',
    home: '/',
  }

  static async setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate
  }

  static async to(path: keyof typeof this.paths) {
    if (!this.navigate) {
      console.error('Navigate function not initialized!')
      return
    }
    
    const location = Location.get()
    console.log('Navigate.to called with path:', path)
    console.log('Current location:', location)
    
    if (location.match(/activate/)) {
      console.log('Navigation blocked: current path contains "activate"')
      return
    }

    // Prevent navigation if we're already at the target location
    if (location === this.paths[path]) {
      console.log('Already at target location, skipping navigation')
      return
    }

    try {
      console.log('Proceeding with navigation to:', this.paths[path])
      this.navigate(this.paths[path])
      
      // Wait a bit for the navigation to complete
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Verify navigation occurred
      const newLocation = Location.get()
      console.log('Navigation completed. New location:', newLocation)
      
      if (newLocation === this.paths[path]) {
        console.log('Navigation successful')
      } else {
        console.warn('Navigation may not have completed as expected')
      }
    } catch (error) {
      console.error('Navigation failed:', error)
    }
  }

  static async back() {
    this.navigate(-1)
  }
}

export { Navigate }
