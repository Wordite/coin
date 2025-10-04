import { Auth } from './index'
import { useEffect, useRef } from 'react'

const AuthInitializer = () => {
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    console.log('AuthInitializer: Starting Auth setup...')
    Auth.setup()
  }, [])

  return null
}

export { AuthInitializer }