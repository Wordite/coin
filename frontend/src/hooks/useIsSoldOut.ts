import { useEffect, useState } from 'react'
import { usePresaleSettings } from './usePresaleSettings'

const useIsSoldOut = () => {
  const {
    presaleSettings,
  } = usePresaleSettings()
  const [isSoldOut, setIsSoldOut] = useState<boolean>(false)

  useEffect(() => {
    if (
      presaleSettings?.sold &&
      presaleSettings?.total &&
      presaleSettings.sold >= presaleSettings.total
    ) {
      setIsSoldOut(true)
    }
  }, [presaleSettings])

  return isSoldOut
}

export { useIsSoldOut }
