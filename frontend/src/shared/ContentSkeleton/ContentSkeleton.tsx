const ContentSkeleton = () => {
  return (
    <div className='markdown'>
      {/* H1 Skeleton */}
      <div className='h-16 bg-gray-300 rounded mb-8 w-2/3 animate-pulse'></div>

      {/* Paragraph skeleton */}
      <div className='space-y-4 mb-12'>
        <div className='h-8 bg-gray-300 rounded w-full animate-pulse'></div>
        <div className='h-8 bg-gray-300 rounded w-4/5 animate-pulse'></div>
        <div className='h-8 bg-gray-300 rounded w-3/4 animate-pulse'></div>
      </div>

      {/* H2 Skeleton */}
      <div className='h-12 bg-gray-300 rounded mb-6 w-1/2 animate-pulse'></div>

      {/* List skeleton */}
      <div className='space-y-4 mb-12 ml-4'>
        <div className='h-8 bg-gray-300 rounded w-3/4 animate-pulse'></div>
        <div className='h-8 bg-gray-300 rounded w-2/3 animate-pulse'></div>
        <div className='h-8 bg-gray-300 rounded w-4/5 animate-pulse'></div>
      </div>

      {/* Paragraph skeleton */}
      <div className='space-y-4 mb-12'>
        <div className='h-8 bg-gray-300 rounded w-full animate-pulse'></div>
        <div className='h-8 bg-gray-300 rounded w-5/6 animate-pulse'></div>
      </div>
      {/* Paragraph skeleton */}
      <div className='space-y-4 mb-12'>
        <div className='h-8 bg-gray-300 rounded w-full animate-pulse'></div>
        <div className='h-8 bg-gray-300 rounded w-5/6 animate-pulse'></div>
      </div>

      <div className='h-12 bg-gray-300 rounded mb-6 w-1/2 animate-pulse'></div>
    </div>
  )
}

export { ContentSkeleton }
