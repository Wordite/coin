import { useNavigate } from 'react-router'
import { Navigate } from './index'
import { useEffect } from 'react'

const NavigatorInitializer = () => {
  const navigate = useNavigate()

  useEffect(() => {
    Navigate.setNavigate(navigate)
  }, [])

  return null
}

export { NavigatorInitializer }
