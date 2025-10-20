import { TitleUnderline } from '@/shared/TitleUnderline/TitleUnderline'

interface StagesCardProps {
  countOfTokens: string
  price: string
  title: string
}

const StagesCard = ({ countOfTokens, price, title }: StagesCardProps) => {
  return (
    <div className='w-[16.875rem] h-[8.375rem] hover:scale-105 hover:translate-y-[-0.625rem] duration-300 max-md:w-[60%] max-md:h-[10.5rem] flex flex-col items-center bg-gray-transparent-10 rounded-xxl p-[1.1rem] border-1 border-stroke-light'>
      <p className='text-[1.125rem] font-bold max-md:text-[1.7rem] max-md:text-center'>{title}</p>
      <TitleUnderline color='purple' width='w-[7.813rem]' className='mt-[.5rem] max-md:mt-[0.65rem] min-h-[0.188rem] max-md:w-[10rem]' />
      <p className='text-[1.25rem] font-medium mt-[0.55rem] max-md:mt-[1.2rem] max-md:text-[1.5rem] max-md:text-center'>{price}</p>
      <p className='text-[.875rem] font-medium mt-[.125rem] text-white-transparent-75 max-md:text-[1.1rem] max-md:text-center'>{countOfTokens}</p>
    </div>
  )
}

export { StagesCard }
