import type { HTMLAttributes } from 'react'
import { type UseFormRegister, type FieldError, type Path, useFormContext } from 'react-hook-form'
import { PayCoinInputUI } from './ui'
import { useCalculatedReceive } from './model/useCalculatedReceive'
import { useEffect, useRef } from 'react'

interface PayCoinReceiveProps<T extends Record<string, any>>
  extends Omit<HTMLAttributes<HTMLInputElement>, 'name'> {
  register: UseFormRegister<T>
  name: Path<T>
  title: string
  placeholder?: string
  disabled?: boolean
  error?: FieldError
}

const PayCoinReceive = <T extends Record<string, any>>({
  register,
  name,
  title,
  placeholder,
  disabled,
  error,
  ...props
}: PayCoinReceiveProps<T>) => {
  const { receive } = useCalculatedReceive()
  const { setValue, formState } = useFormContext<T>()
  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    if (formState.isSubmitted) {
      hasSubmittedRef.current = true
    }
  }, [formState.isSubmitted])

  useEffect(() => {
    if (receive !== undefined && receive !== null) {
      const shouldValidate = hasSubmittedRef.current
      setValue(name, receive as any, { shouldValidate, shouldDirty: true })
    }
  }, [receive, setValue, name])

  return (
    <PayCoinInputUI
      register={register}
      name={name}
      title={title}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      value={receive || ''}
      {...props}
    />
  )
}

export { PayCoinReceive }
