import { Controller, useFormContext } from 'react-hook-form'
import { InputRadio } from '@/shared/Input/ui/InputRadio'
import type { PropsWithChildren } from 'react'

interface SelectRadioOption {
  label: string
  value: string
}

interface SelectRadioProps extends PropsWithChildren {
  name: string
  options: SelectRadioOption[]
  className?: string
}

const SelectRadio = ({ name, options, className = '' }: SelectRadioProps) => {
  const { control } = useFormContext()

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            {options.map((option) => (
              <InputRadio
                key={option.value}
                value={option.value}
                checked={field.value === option.value}
                onChange={() => field.onChange(option.value)}
                name={field.name}
              >
                {option.label}
              </InputRadio>
            ))}
          </>
        )}
      />
    </div>
  )
}

export { SelectRadio }
