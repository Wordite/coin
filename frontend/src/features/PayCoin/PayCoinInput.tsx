import type { HTMLAttributes } from 'react'
import { type UseFormRegister, type FieldError, type Path } from 'react-hook-form'
import { PayCoinInputUI } from './ui'

interface PayCoinInputProps<T extends Record<string, any>>
  extends Omit<HTMLAttributes<HTMLInputElement>, 'name'> {
  register: UseFormRegister<T>
  name: Path<T>
  title: string
  placeholder?: string
  disabled?: boolean
  error?: FieldError
}

const PayCoinInput = <T extends Record<string, any>>({
  register,
  name,
  title,
  placeholder,
  disabled,
  error,
  ...props
}: PayCoinInputProps<T>) => {

  return (
    <PayCoinInputUI
      register={register}
      name={name}
      title={title}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      {...props}
    />
  )
}

export { PayCoinInput }
