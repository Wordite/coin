import { useIsMobile } from '@/hooks/useIsMobile'

const HeaderSkeleton = () => {
  const isMobile = useIsMobile()

  return (
    <header className='header transform-gpu fixed top-0 left-0 w-full flex items-center z-40'>
      <div className='container flex items-center h-full justify-between'>
        {/* Logo skeleton */}
        <div className='w-[3.188rem] h-[3.188rem] bg-gray-200 rounded animate-pulse'></div>

        {/* Desktop Navigation skeleton */}
        {!isMobile && (
          <nav className='h-full'>
            <ul className='flex items-center h-full gap-[2.5rem]'>
              {[...Array(5)].map((_, i) => (
                <li className='h-full flex items-center' key={i}>
                  <div
                    className='w-20 h-6 bg-gray-200 rounded animate-pulse'
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  ></div>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {isMobile && (
          <div className='w-[2.03125rem] h-[2.03125rem] bg-gray-200 rounded animate-pulse'></div>
        )}

        {!isMobile && (
          <div className='w-[12.313rem] h-[2.938rem] bg-gray-200 rounded-lg animate-pulse'></div>
        )}
      </div>
    </header>
  )
}

export { HeaderSkeleton }
