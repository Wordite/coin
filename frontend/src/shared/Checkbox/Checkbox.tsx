import { forwardRef } from 'react'
import { AnchorLink } from '@/shared/AnchorLink'
import styles from './Checkbox.module.scss'

interface CheckboxProps {
  name: string
  label: string
  linkText?: string
  linkHref?: string
  error?: { message?: string }
  className?: string
  register?: any
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ name, label, linkText, linkHref, error, className = '', register }, ref) => {
    return (
      <div className={`${styles.checkboxContainer} ${className}`}>
        <label className={styles.label}>
          <input
            ref={ref}
            type="checkbox"
            name={name}
            className={styles.input}
            {...(register ? register(name) : {})}
          />
          <span className={styles.checkmark}></span>
          <span className={styles.text}>
            {label}
            {linkText && linkHref && (
              <>
                {' '}
                <AnchorLink href={linkHref} className={styles.link}>
                  {linkText}
                </AnchorLink>
              </>
            )}
          </span>
        </label>
        {error && <span className={styles.error}>{error.message}</span>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
