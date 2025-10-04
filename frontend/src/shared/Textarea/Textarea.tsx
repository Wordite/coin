import { type TextareaHTMLAttributes } from 'react'
import type { UseFormRegister, FieldError, Path } from 'react-hook-form'

interface TextareaProps<T extends Record<string, any>> extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
  register: UseFormRegister<T>
  name: Path<T>
  placeholder: string
  error?: FieldError
}

const Textarea = <T extends Record<string, any>>({ placeholder, register, name, error, ...props }: TextareaProps<T>) => {
  return (
    <div className="w-full">
      <textarea
        {...props}
        {...register(name)}
        placeholder={placeholder}
        className={`block w-full p-[.938rem] text-[1.25rem] max-md:text-[1.5rem] font-light border-1 ${
          error 
            ? 'border-red-500 focus:border-red-400' 
            : 'border-stroke-dark focus:border-white-transparent-50'
        } focus:outline-none bg-gray-transparent-10 duration-150 placeholder:text-white-transparent-35 backdrop-blur-3xl rounded-md resize-none ${props.className}`}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1 ml-1">
          {error.message}
        </p>
      )}
    </div>
  )
}

export { Textarea }