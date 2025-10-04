import { initAnimations } from '@/app/animations/inex'
import '@/app/animations/animations.scss'

const useAnimations = () => {
  return {
    init: initAnimations,
  }
}

export { useAnimations }
