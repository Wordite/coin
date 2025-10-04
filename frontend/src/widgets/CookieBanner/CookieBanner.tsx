import { useState, useEffect } from 'react'
import { AnchorLink } from '@/shared/AnchorLink'
import Button from '@/shared/Button'
import styles from './CookieBanner.module.scss'

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const cookieConsent = localStorage.getItem('cookie-consent')
    
    if (!cookieConsent) {
      setTimeout(() => {
        setIsVisible(true)
        setTimeout(() => {
          setIsAnimating(true)
        }, 50)
      }, 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true')

    setIsAnimating(false)
    
    setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  if (!isMounted || !isVisible) return null

  return (
    <div className={`${styles.banner} ${isAnimating ? styles.show : styles.hide}`}>
      <div className={styles.content}>
        <div className={styles.text}>
          <p className={styles.message}>
            We use cookies and similar technologies to operate the website. 
            By continuing to use the site, you agree to our{' '}
            <AnchorLink 
              href="/privacy-policy" 
              className={styles.link}
            >
              Privacy Policy
            </AnchorLink>
            .
          </p>
        </div>
        
        <div className={styles.actions}>
          <Button 
            color="purple" 
            className={styles.acceptButton}
            onClick={handleAccept}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}

export { CookieBanner }
