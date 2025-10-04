import { useCallback } from 'react'
import { useLocomotive } from './useLocomotive'

const useDisableScroll = () => {
  const { locomotiveScroll } = useLocomotive()

  const disableScroll = useCallback(() => {
    locomotiveScroll?.stop()
  }, [locomotiveScroll])

  const enableScroll = useCallback(() => {
    locomotiveScroll?.start()
  }, [locomotiveScroll])

  return { disableScroll, enableScroll }
}

export { useDisableScroll }
