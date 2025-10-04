import { Link } from 'react-router'
import Button from '@/shared/Button'

const NotFoundMessage = () => {
  return (
    <div className='min-h-[90vh] pt-[9rem] flex items-center justify-center px-4'>
      <div className='text-center max-w-md mx-auto'>
        {/* Icon */}
        <div className='w-24 h-24 mx-auto mb-8 rounded-full bg-gray-transparent-20 border-2 border-stroke-light flex items-center justify-center'>
          <span className='text-[3rem] text-white-transparent-50 font-medium'>
            ?
          </span>
        </div>

        {/* Title */}
        <h1 className='text-[2.5rem] max-md:text-[3rem] font-bold text-white mb-4'>
          Page Not Found
        </h1>

        {/* Description */}
        <p className='text-white-transparent-75 text-[1.125rem] max-md:text-[1.25rem] mb-8 leading-relaxed'>
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Button */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button color='purple' isLink to='/' className='w-full sm:w-auto'>
            Go Home
          </Button>
          <Button color='dark' onClick={() => window.history.back()} className='w-full sm:w-auto'>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}

export { NotFoundMessage }
