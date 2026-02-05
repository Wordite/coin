import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  color: 'white' | 'dark' | 'green' | 'purple'
  isLoading?: boolean
  loadingText?: string
}

type ButtonStyles = Record<ButtonProps['color'], string>
const styles: ButtonStyles = {
  white: 'bg-white text-black',
  dark: 'bg-gray-transparent-70 text-white border border-stroke-dark',
  green: 'bg-green text-black',
  purple: 'bg-purple-500 text-white'
}

const baseStyles = 'flex justify-center items-center gap-3 py-4 px-8 font-semibold cursor-pointer rounded-md hover:brightness-110 transition-all duration-200'

const Button = ({ color, children, className, isLoading = false, loadingText = 'Loading...', ...props }: ButtonProps) => {
  const LoadingSpinner = () => (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )

  return (
    <button
      className={`${baseStyles} ${styles[color]} ${className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
