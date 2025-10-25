import type { HTMLAttributes } from 'react'
import { type UseFormRegister, type FieldError, type Path, useFormContext } from 'react-hook-form'
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
  const { receive, isLoading } = useCalculatedReceive()
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
    <div className='mt-[2.063rem] max-md:mt-[2.75rem]'>
      <p className='text-[1.25rem] max-md:text-[1.76rem] mb-[.688rem] max-md:mb-[.96rem] font-semibold'>{title}</p>
      <div className="w-full relative">
        <input
          {...register(name)}
          {...props}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-[1rem] max-md:p-[1.375rem] h-[3.375rem] max-md:h-[5.08rem] border-1 text-[1.125rem] max-md:text-[1.54rem] font-semibold rounded-md ${
            error 
              ? 'border-red-500 focus:border-red-400' 
              : 'border-stroke-dark'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          value={receive || ''}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <p className="text-red-400 text-sm max-md:text-[1.24rem] mt-1 max-md:mt-[1.375rem] ml-1">
            {error.message}
          </p>
        )}
      </div>
    </div>
  )
}

export { PayCoinReceive }
