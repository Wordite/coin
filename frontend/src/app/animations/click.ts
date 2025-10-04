const pressed = (e: Event) => {
  const el = e.currentTarget as HTMLElement
  el.classList.add('pressed')
  if (!el.style.transition) el.style.transition = '.25s'
}

const released = (e: Event, isElement = false) => {
  const el = isElement ? e as unknown as HTMLElement : (e.currentTarget as HTMLElement)
  el.classList.remove('pressed')
}

let globalReleaseHandler: (() => void) | null = null
let observer: MutationObserver | null = null
const processedElements = new WeakSet<HTMLElement>()

const addAnimationToElement = (el: HTMLElement) => {
  if (processedElements.has(el)) return
  
  el.removeEventListener('mousedown', pressed)
  el.removeEventListener('touchstart', pressed)
  el.removeEventListener('mouseup', released)
  el.removeEventListener('touchend', released)
  el.removeEventListener('mouseleave', released)
  el.removeEventListener('mouseout', released)
  
  el.addEventListener('mousedown', pressed)
  el.addEventListener('touchstart', pressed)
  el.addEventListener('mouseup', released)
  el.addEventListener('touchend', released)
  el.addEventListener('mouseleave', released)
  el.addEventListener('mouseout', released)
  
  processedElements.add(el)
}

const initAnimation = () => {
  const clickableElements = [...document.querySelectorAll('.clickable')] as HTMLElement[]
  clickableElements.forEach(addAnimationToElement)
  
  globalReleaseHandler = () => clickableElements.forEach((el) => released(el as any, true))
  
  document.body.addEventListener('mouseup', globalReleaseHandler)
  document.body.addEventListener('mouseleave', globalReleaseHandler)
}

export function clickAnimation() {
  if (globalReleaseHandler) {
    document.body.removeEventListener('mouseup', globalReleaseHandler)
    document.body.removeEventListener('mouseleave', globalReleaseHandler)
  }
  
  if (observer) {
    observer.disconnect()
  }

  initAnimation()

  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement
          
          if (element.classList.contains('clickable')) {
            addAnimationToElement(element)
          }
          
          const clickableChildren = element.querySelectorAll('.clickable') as NodeListOf<HTMLElement>
          clickableChildren.forEach(addAnimationToElement)
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}
