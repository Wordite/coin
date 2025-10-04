import React from 'react'
import ArrowIcon from '@/assets/icons/arrow.svg'
import { TitleUnderline } from '@/shared/TitleUnderline/TitleUnderline'
import { useIsMobile } from '@/hooks/useIsMobile'

interface AnswerProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const Answer = React.memo(({ question, answer, isOpen, onToggle }: AnswerProps) => {
  const isMobile = useIsMobile()

  return (
    <div
      className='w-[48.125rem] max-md:w-full hover:scale-105 transform-gpu will-change-contents transition-all duration-300 mx-auto mt-[1.5rem] rounded-md bg-gray-transparent-10 border-1 border-stroke-light overflow-hidden cursor-pointer'
      style={{
        display: 'grid',
        gridTemplateRows: isOpen ? `${isMobile ? '7rem' : '4.375rem'} 1fr` : `${isMobile ? '7rem' : '4.375rem'} 0fr`,
        transition: 'all 0.4s ease-out',
      }}
      onClick={onToggle}
    >
      <div className={`h-[${isMobile ? '7rem' : '4.375rem'}] p-[1.56rem] flex justify-between items-center`}>
        <div>
          <h6 className='text-[1.125rem] max-md:text-[1.6rem]'>{question}</h6>
          <TitleUnderline
            className={`overflow-hidden duration-300 translate-y-[.625rem] ${isOpen ? 'w-[7.813rem]' : ''}`}
            width='w-[0rem]'
            color='purple'
          />
        </div>

        <div className='flex items-center gap-2'>
          <div
            className='w-[1.5rem] h-[.5rem] transition-transform duration-300 ease-out max-md:w-[2rem] max-md:h-[0.5rem]'
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ArrowIcon className='w-[1.5rem] h-[.5rem] max-md:w-[2rem] max-md:h-[0.5rem]' />
          </div>
        </div>
      </div>

      <div
        className='px-[1.563rem] overflow-hidden'
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        }}
      >
        <p className='text-[1rem] text-gray-400 leading-relaxed max-md:text-[1.3rem]'>{answer}</p>
        <div className='h-[1.563rem]' />
      </div>
    </div>
  )
})

Answer.displayName = 'Answer'

export { Answer }
