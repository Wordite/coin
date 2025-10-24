interface StatCardProps {
  title: string
  value: string
}

const StatCard = ({ title, value }: StatCardProps) => (
  <div className='relative w-full min-h-[8.375rem] max-md:min-h-[9.2rem] rounded-xxl p-[1px] bg-gradient-purple-blue-3'>
    <div className='relative w-full h-full bg-gray-transparent-10 rounded-xxl p-[1.188rem] border-1 border-stroke-light hover:scale-105 duration-200 overflow-hidden'>
      <div
        className='pointer-events-none absolute -right-10 -top-10 w-[12rem] h-[12rem] rounded-full opacity-15'
        style={{
          background: 'radial-gradient(circle, var(--color-purple-600) 0%, rgba(152,35,221,0) 70%)',
        }}
      />

      <div className='relative flex flex-col justify-between h-full'>
        <p className='text-[1.063rem] font-bold text-white-transparent-75 max-md:text-[1.5rem]'>{title}</p>
        <p className='text-[1.75rem] leading-none font-semibold mt-[1.25rem] max-md:text-[2.1rem]'>{value}</p>
      </div>
    </div>
  </div>
)

export { StatCard }
