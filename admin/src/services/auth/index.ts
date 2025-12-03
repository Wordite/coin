import { api } from '@/app/api'
import type { AccessTokenResponse } from '../types/checkResonse'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/app/store/authStore'
import { queryClient } from '@/main'
import { Notify } from '../notify'
import { Navigate } from '../navigate'
import { Location } from '../location'

class Auth {
  private static _lastAccessFetch = 0
  private static _lastAuthCheckAndSet = 0
  private static _isInitialized = false
  private static _isRefreshing = false
  private static _refreshSubscribers: Array<(token: string | null) => void> = []

  static setup() {
    if (this._isInitialized) return

    // this.setupAuthInterceptor()
    this.checkAndSetAuth()
    this.setupIsAuthenticatedWatcher()
    this.setupRecheckOnUrlChange()
    this.watchAuthForm()

    this._isInitialized = true
  }

  static async check(): Promise<boolean> {
    try {
      const response = await api.get('/auth/check')

      if ([200, 201, 204].includes(response.status)) return true
      return false
    } catch (error: any) {
      // If it's a 401 error, the user is not authenticated
      if (error.response?.status === 401) {
        return false
      }
      // For other errors, re-throw them
      throw error
    }
  }

  static async logout(): Promise<boolean> {
    try {
      const response = await api.post('/auth/logout')

      if ([200, 201, 204].includes(response.status)) {
        this.removeAccessToken()
        this.setIsAuthenticated(false)
        this.clearCacheQueries()

        return true
      }

      Notify.warn('Something went wrong. Try again later')
      return false
    } catch (error) {
      Notify.error('Error logging out. Try again later')
      return false
    }
  }

  private static watchAuthForm() {
    useAuthStore.subscribe(
      ({ isAuthFromSent }, { isAuthFromSent: prevIsAuthFromSent }) => {
        if (isAuthFromSent && !prevIsAuthFromSent) {
          this.startAccessTokenPolling()
        }
      }
    )
  }

  private static async startAccessTokenPolling() {
    const interval = setInterval(async () => {
      const isAuthenticated = this.getIsAuthenticated()
      console.log('interval')

      if (isAuthenticated) {
        console.log('User is authenticated, navigating to home')
        await Navigate.to('home')
        console.log('Navigate.to home clear interval')
        clearInterval(interval)
        return
      }

      // Only check authentication if we're not already authenticated
      // and add a small delay to allow any pending navigation to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      
      try {
        const responseIsAuthenticated = await this.check()
        if (responseIsAuthenticated) {
          console.log('Authentication check successful, setting authenticated state')
          this.setIsAuthenticated(true)
        }
      } catch (error) {
        console.log('Authentication check failed:', error)
        // Don't change authentication state on error, just log it
      }
    }, 2000)

    return () => clearInterval(interval)
  }

  private static async checkAndSetAuth() {
    if (Date.now() - this._lastAuthCheckAndSet < 500) return

    const isAuthenticated = await this.check()
    const currentLocation = Location.get()
    
    console.log('checkAndSetAuth: isAuthenticated =', isAuthenticated, 'currentLocation =', currentLocation)
    
    // Set authentication state first
    this.setIsAuthenticated(isAuthenticated)

    if (!isAuthenticated) {
      // Only navigate to login if we're not already there
      if (currentLocation !== Navigate.paths.login) {
        console.log('User not authenticated, navigating to login')
        Navigate.to('login')
      }
      return
    }

    await this.updateRootWalletStatus()

    // User is authenticated
    if (currentLocation === Navigate.paths.login) {
      console.log('User authenticated and on login page, navigating to home')
      Navigate.to('home')
    }

    this.refetchAllQueries()
    this._lastAuthCheckAndSet = Date.now()
  }

  private static refetchAllQueries() {
    queryClient.refetchQueries()
  }

  private static clearCacheQueries() {
    queryClient.clear()
  }

  private static setIsAuthenticated(isAuthenticated: boolean) {
    const currentState = useAuthStore.getState().isAuthenticated
    if (currentState !== isAuthenticated) {
      console.log('Authentication state changing from', currentState, 'to', isAuthenticated, 'at', new Error().stack?.split('\n')[2]?.trim())
    }
    useAuthStore.setState({ isAuthenticated })
  }

  private static getIsAuthenticated() {
    return useAuthStore.getState().isAuthenticated
  }

  private static setupIsAuthenticatedWatcher() {
    let lastNavigationTime = 0
    const navigationThrottle = 1000
    
    useAuthStore.subscribe((state) => {
      const now = Date.now()
      
      if (now - lastNavigationTime < navigationThrottle) {
        console.log('Navigation throttled, skipping...')
        return
      }
      
      if (!state.isAuthenticated) {
        this.check().then((isActuallyAuthenticated) => {
          if (!isActuallyAuthenticated) {
            console.log('User not authenticated, navigating to login')
            lastNavigationTime = now
            Navigate.to('login')
          } else {
            console.log('User is actually authenticated, correcting state')
            this.setIsAuthenticated(true)
          }
        })
        return
      }

      if (state.isAuthenticated && Location.get() === Navigate.paths.login) {
        console.log('User authenticated and on login page, navigating to home')
        lastNavigationTime = now
        Navigate.to('home')
      }
    })
  }

  private static setupRecheckOnUrlChange() {
    let lastRecheckTime = 0
    const recheckThrottle = 1000
    
    Location.subscribe((location) => {
      const now = Date.now()

      if (now - lastRecheckTime < recheckThrottle) {
        console.log('Recheck throttled, skipping...')
        return
      }
      
      if (location === Navigate.paths.login) {
        console.log('Location changed to login, checking authentication')
        lastRecheckTime = now
        this.checkAndSetAuth()
      }
    })
  }

  private static setupAuthInterceptor() {
    api.interceptors.response.use(
      (response) => response,
      (error) => this.errorInterceptor(error)
    )
    console.log('Response interceptor setup complete')
  }

  private static onRefreshed(token: string | null) {
    this._refreshSubscribers.forEach((callback) => callback(token))
    this._refreshSubscribers = []
  }

  static async errorInterceptor(error: AxiosError) {
    console.log('Error interceptor called with status:', error.response?.status, 'for URL:', error.config?.url)
    if (error?.response?.status == 403) window.location.href = 'google.com'
  
    const originalRequest = error.config as AxiosRequestConfig

    if (originalRequest?.url?.includes('/auth/access')) {
      console.log('Auth access token request, rejecting...')
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      console.log('401 error, trying to get new access token')
      const req: any = originalRequest || {}
      if (req._retry) {
        // Already retried once; avoid infinite loop
        return Promise.reject(error)
      }
      req._retry = true

      if (this._isRefreshing) {
        return new Promise((resolve, reject) => {
          this._refreshSubscribers.push((token) => {
            if (!token) {
              reject(error)
              return
            }
            req.headers = req.headers || {}
            req.headers['Authorization'] = `Bearer ${token}`
            resolve(api(req))
          })
        })
      }

      this._isRefreshing = true

      try {
        const { data } = await api.get<AccessTokenResponse>('/auth/access')
        const accessToken = (data as any)?.accessToken

        if (accessToken) {
          console.log('New access token received, setting...')
          this.setAccessToken(accessToken)
          this.setIsAuthenticated(true)
          this._isRefreshing = false
          this.onRefreshed(accessToken)

          req.headers = req.headers || {}
          req.headers['Authorization'] = `Bearer ${accessToken}`
          return api(req)
        }

        console.log('No new access token received, removing...')
        this.removeAccessToken()
        this.setIsAuthenticated(false)
        this._isRefreshing = false
        this.onRefreshed(null)
        return Promise.reject(error)
      } catch (err) {
        console.log('Error getting new access token, removing...')
        this.removeAccessToken()
        this.setIsAuthenticated(false)
        this._isRefreshing = false
        this.onRefreshed(null)
        return Promise.reject(err)
      }
    }

    console.log('Rejecting error...')
    return Promise.reject(error)
  }

  private static removeAccessToken() {
    localStorage.removeItem('accessToken')
  }

  private static setAccessToken(accessToken: string) {
    localStorage.setItem('accessToken', accessToken)
  }

  private static async updateRootWalletStatus() {
    try {
      const { data } = await api.get('/wallet/root-wallet-status', { skipAuthRefresh: true } as any)
      const isInitialized = data?.isRootWalletInitialized ?? false
      useAuthStore.getState().setIsRootWalletInitialized(isInitialized)
      sessionStorage.setItem('isRootWalletInitialized', String(isInitialized))
    } catch (error) {
      console.log('Failed to update root wallet status:', error)
      useAuthStore.getState().setIsRootWalletInitialized(false)
      sessionStorage.setItem('isRootWalletInitialized', 'false')
    }
  }
}

export { Auth }
