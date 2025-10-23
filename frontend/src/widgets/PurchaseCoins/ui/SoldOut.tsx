export const SoldOut = () => {
  return (
    <div className='absolute inset-0 flex items-center justify-center z-10'>
      <div
        className='
          border-[0.4rem] border-red-600 text-red-600 font-bold text-[4rem] px-8 py-4
          transform -rotate-12 select-none
          shadow-lg
          flex items-center justify-center
          tracking-wider
        '
        style={{
          fontFamily: 'Impact, sans-serif',
          textShadow: '.125rem .125rem .25rem rgba(0,0,0,0.2)',
        }}
      >
        SOLD OUT
      </div>
    </div>
  )
}
