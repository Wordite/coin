import axios from 'axios'
import axiosRetry from 'axios-retry'
import getBrowserFingerprint from 'get-browser-fingerprint'

const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_URL, withCredentials: true })
axiosRetry(api, { retries: 1, retryDelay: axiosRetry.linearDelay() })

api.interceptors.request.use(async (config) => {
  const fingerprint = await getBrowserFingerprint()

  if (fingerprint) {
    config.headers['fingerprint'] = fingerprint
  }

  return config
})

export { api }
