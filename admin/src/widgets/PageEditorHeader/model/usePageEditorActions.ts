import { useState } from 'react'
import { usePageEditorStore } from '@/app/store/pageEditor'

export const usePageEditorActions = (onSave?: () => Promise<void>, onReset?: () => void) => {
  const { reset } = usePageEditorStore()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveChanges = async () => {
    if (!onSave) {
      console.warn('No save function provided')
      return
    }
    
    setIsSaving(true)
    try {
      await onSave()
    } catch (error) {
      console.error('PageEditorHeader: Error saving content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefault = () => {
    if (onReset) {
      onReset()
    } else {
      reset()
    }
  }

  return {
    isSaving,
    handleSaveChanges,
    handleResetToDefault
  }
} 