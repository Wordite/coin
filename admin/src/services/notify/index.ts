import { addToast } from '@heroui/toast'

class Notify {
  static success(message: string, title?: string) {
    addToast({
      title: title || 'Success',
      description: message,
      color: 'success',
      variant: 'flat',
      timeout: 2500,
    })
  }

  static error(message: string, title?: string) {
    addToast({
      title: title || 'Error',
      description: message,
      color: 'danger',
      variant: 'flat',
      timeout: 2500,
    })
  }

  static warn(message: string, title?: string) {
    addToast({
      title: title || 'Warning',
      description: message,
      color: 'warning',
      variant: 'flat',
      timeout: 2500,
    })
  }

  static info(message: string, title?: string) {
    addToast({
      title: title || 'Info',
      description: message,
      color: 'primary',
      variant: 'flat',
      timeout: 2500,
    })
  }
}

export { Notify }