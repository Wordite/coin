import { type PropsWithChildren, type InputHTMLAttributes } from 'react'
import type { UseFormRegister, Path } from 'react-hook-form'

interface InputRadioProps<T extends Record<string, any>> extends PropsWithChildren, InputHTMLAttributes<HTMLInputElement> {
  className?: string
  value: string
  register: UseFormRegister<T>
  name: Path<T>
}

const InputRadio = <T extends Record<string, any>>({
  children,
  className = '',
  value,
  register,
  name,
  ...props
}: InputRadioProps<T>) => {
  return (
    <div
      className={`flex items-center justify-center gap-[.313rem] p-[0.5rem] rounded-md ${
        props.checked ? '' : ''
      } border-1 border-stroke-dark relative ${className}`}
    >
      <input
        type='radio'
        {...register(name)}
        {...props}
        value={value}
        className='w-full h-full opacity-0 absolute left-0 top-0 z-10 cursor-pointer'
      />
      {children}
    </div>
  )
}

export { InputRadio }
