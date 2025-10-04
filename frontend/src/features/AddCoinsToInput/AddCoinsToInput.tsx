import { AddCoinToPayButton } from '@/shared/AddCoinToPayButton/AddCoinToPayButton'
import { type Control } from 'react-hook-form'

interface AddCoinsToInputProps {
  control: Control<any>
}

const AddCoinsToInput = ({ control }: AddCoinsToInputProps) => {
  return (
    <div className='flex gap-[.438rem] max-md:gap-[.6rem]'>
      <AddCoinToPayButton value='0.1' control={control} />
      <AddCoinToPayButton value='0.3' control={control} />
      <AddCoinToPayButton value='0.5' control={control} />
      <AddCoinToPayButton value='MAX' control={control} />
    </div>
  )
}

export { AddCoinsToInput }
