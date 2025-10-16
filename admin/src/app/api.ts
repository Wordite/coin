import { Auth } from '@/services/auth'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import getBrowserFingerprint from 'get-browser-fingerprint'

const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL, withCredentials: true })
axiosRetry(api, { retries: 1, retryDelay: axiosRetry.linearDelay() })

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken')
  const fingerprint = await getBrowserFingerprint()

  console.log('API Request Interceptor:')
  console.log('- URL:', config.url)
  console.log('- Method:', config.method)
  console.log('- Token present:', !!token)
  console.log('- Fingerprint present:', !!fingerprint)
  console.log('- Fingerprint length:', String(fingerprint).length)
  console.log('- Fingerprint value:', fingerprint)

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  if (fingerprint) {
    config.headers['fingerprint'] = fingerprint
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => Auth.errorInterceptor(error)
)

export { api }
