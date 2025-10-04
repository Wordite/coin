interface PresailDetailsInfoCardProps {
    title: string
    subtitle: string
}

const PresailDetailsInfoCard = ({ title, subtitle }: PresailDetailsInfoCardProps) => {
  return (  
    <div className='w-[16.875rem] h-[8.375rem] hover:scale-105 hover:translate-y-[-0.625rem] duration-300 max-md:m-auto max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:w-[90%] max-md:h-[9.3rem] bg-gray-transparent-10 rounded-xxl p-[1.188rem] border-1 border-stroke-light'>
        <p className='text-[1.125rem] font-bold max-md:text-[1.5rem] max-md:text-center'>{title}</p>
        <p className='text-[.875rem] font-medium mt-[1.25rem] text-white-transparent-75 max-md:text-[1.1rem] max-md:text-center'>{subtitle}</p>
    </div>
  )
}

export { PresailDetailsInfoCard }