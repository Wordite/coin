
interface StageProps {
  value: number
  label: string
}

const Stage = ({ value, label }: StageProps) => {
  return (
    <div className='h-[4.25rem] max-md:h-[6.875rem] hover:scale-105 duration-200 rounded-md bg-gray-transparent-70 border-1 border-stroke-dark flex flex-col items-center justify-center'>
      <span className='text-[1.25rem] font-bold max-md:text-[1.875rem] max-md:pt-[0.25rem]'>{String(value).padStart(2, '0')}</span>
      <span className='text-[.75rem] text-white-transparent-50 max-md:text-[1.375rem]'>{label}</span>
    </div>
  )
}

export { Stage }