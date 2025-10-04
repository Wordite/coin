import { useState, useEffect } from 'react'
import { usePageEditorStore } from '@/app/store/pageEditor'
import { Notify } from '../../../services/notify'

export const useUrlManagement = (onUrlChange?: (newUrl: string) => void) => {
  const { url, setUrl } = usePageEditorStore()
  const [isChangingUrl, setIsChangingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string>('')
  const [isUrlModified, setIsUrlModified] = useState(false)

  // Инициализируем оригинальный URL при первом рендере
  useEffect(() => {
    if (url && !originalUrl) {
      setOriginalUrl(url)
    }
  }, [url, originalUrl])

  const validateUrl = (urlString: string): boolean => {
    // Простая валидация URL - должен быть непустым и содержать только буквы, цифры, дефисы и подчеркивания
    if (!urlString.trim()) {
      setUrlError('URL cannot be empty')
      return false
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(urlString.trim())) {
      setUrlError('URL can only contain letters, numbers, hyphens and underscores')
      return false
    }
    
    if (urlString.trim().length < 2) {
      setUrlError('URL must be at least 2 characters long')
      return false
    }
    
    setUrlError(null)
    return true
  }

  const handleChangeUrl = async () => {
    if (!validateUrl(url)) {
      return
    }

    setIsChangingUrl(true)
    try {
      // Simulate API call to test new URL
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('URL changed to:', url)
      
      // Вызываем callback для уведомления родительского компонента об изменении URL
      if (onUrlChange) {
        onUrlChange(url)
      }
      
      // Показываем уведомление об успешном изменении
      Notify.success(`URL changed to: ${url}`)
      
      // Обновляем оригинальный URL и сбрасываем состояние изменений
      setOriginalUrl(url)
      setIsUrlModified(false)
      
    } catch (error) {
      console.error('Error changing URL:', error)
      setUrlError('Failed to change URL. Please try again.')
      Notify.error('Failed to change URL. Please try again.')
    } finally {
      setIsChangingUrl(false)
    }
  }

  const handleUrlInputChange = (newUrl: string) => {
    setUrl(newUrl)
    // Очищаем ошибку при вводе
    if (urlError) {
      setUrlError(null)
    }
    // Отслеживаем, был ли URL изменен
    setIsUrlModified(newUrl !== originalUrl)
  }

  const handleCancelUrlChange = () => {
    setUrl(originalUrl)
    setIsUrlModified(false)
    setUrlError(null)
    Notify.info('URL changes cancelled')
  }

  return {
    url,
    setUrl: handleUrlInputChange,
    isChangingUrl,
    handleChangeUrl,
    urlError,
    isUrlModified,
    handleCancelUrlChange
  }
} 