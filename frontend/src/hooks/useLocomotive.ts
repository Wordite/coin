import { getLocomotiveScroll } from '@/app/animations/locomotive'
import { useNavigate, useLocation } from 'react-router'
import { useCallback, useEffect, useState } from 'react'

const useLocomotive = () => {
  const [locomotiveScroll, setLocomotiveScroll] = useState(getLocomotiveScroll())
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!locomotiveScroll) {
      const checkScroll = () => {
        const scroll = getLocomotiveScroll()
        if (scroll) {
          setLocomotiveScroll(scroll)
        } else {
          setTimeout(checkScroll, 100)
        }
      }
      checkScroll()
    }
  }, [locomotiveScroll])

  const scrollToAnchor = useCallback(
    (anchor: string, smooth: boolean = true) => {
      if (!locomotiveScroll) {
        return
      }

      const element = document.querySelector(anchor) as HTMLElement
      if (element) {
        if (smooth) {
          locomotiveScroll.scrollTo(element, {
            offset: -100,
            duration: 1.5,
          })
        } else {
          locomotiveScroll.scrollTo(element, {
            offset: -100,
            duration: 0,
          })
        }
      }
    },
    [locomotiveScroll]
  )

  const handleAnchorLink = useCallback(
    (href: string) => {
      const [path, anchor] = href.split('#')

      if (anchor) {
        const fullAnchor = `#${anchor}`

        if (location.pathname === path || (path === '' && location.pathname === '/')) {
          if (locomotiveScroll) {
            setTimeout(() => {
              scrollToAnchor(fullAnchor)
            }, 100)
          } else {
            const waitForScroll = () => {
              if (locomotiveScroll) {
                setTimeout(() => {
                  scrollToAnchor(fullAnchor)
                }, 100)
              } else {
                setTimeout(waitForScroll, 100)
              }
            }
            waitForScroll()
          }
        } else {
          navigate(href)
        }
      } else {
        navigate(href)
      }
    },
    [navigate, location.pathname, scrollToAnchor, locomotiveScroll]
  )

  useEffect(() => {
    if (location.hash && locomotiveScroll) {
      const timer = setTimeout(() => {
        const element = document.querySelector(location.hash) as HTMLElement
        if (element) {
          scrollToAnchor(location.hash, false)
        }
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [location.hash, locomotiveScroll, scrollToAnchor])

  return {
    locomotiveScroll,
    scrollToAnchor,
    handleAnchorLink,
  }
}

export { useLocomotive }
