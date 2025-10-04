import { type UseFormRegister, type FieldError, type Path } from 'react-hook-form'
import type { HTMLAttributes } from 'react'

interface PayCoinInputProps<T extends Record<string, any>> extends Omit<HTMLAttributes<HTMLInputElement>, 'name'> {
  register: UseFormRegister<T>
  name: Path<T>
  title: string
  placeholder?: string
  disabled?: boolean
  error?: FieldError
  value?: string | number
}

const PayCoinInputUI = <T extends Record<string, any>>({ 
  register, 
  name, 
  title, 
  placeholder, 
  disabled, 
  error, 
  value,
  ...props 
}: PayCoinInputProps<T>) => {
  return (
    <div className='mt-[2.063rem] max-md:mt-[2.75rem]'>
      <p className='text-[1.25rem] max-md:text-[1.76rem] mb-[.688rem] max-md:mb-[.96rem] font-semibold'>{title}</p>
      <div className="w-full">
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
          value={value}
        />
        {error && (
          <p className="text-red-400 text-sm max-md:text-[1.24rem] mt-1 max-md:mt-[1.375rem] ml-1">
            {error.message}
          </p>
        )}
      </div>
    </div>
  )
}

export { PayCoinInputUI }