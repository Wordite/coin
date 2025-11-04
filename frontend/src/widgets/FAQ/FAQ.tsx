import React, { useCallback, useMemo } from 'react'
import { SectionHead } from '@/shared/SectionHead/SectionHead'
import { Answer } from '@/features/Answer/Answer'
import { useFAQStore } from '@/app/store/faqStore'
import { BackgroundLight } from '@/shared/BackgroundLight/BackgroundLight'
import { useSectionData } from '@/hooks/useSectionData'
import { FAQSkeleton } from './ui/FAQSkeleton'
import { useIsDesktopSafari } from '@/hooks/useIsDesktopSafari'

const FAQ = React.memo(() => {
  const { openQuestions, toggleQuestion } = useFAQStore()
  const { data, isLoading, error } = useSectionData('FAQ')
  const isDesktopSafari = useIsDesktopSafari()

  const createToggleHandler = useCallback(
    (index: number) => {
      return () => toggleQuestion(index)
    },
    [toggleQuestion]
  )

  const toggleHandlers = useMemo(() => {
    if (!data?.questions) return []
    return data.questions.map((_: any, index: number) => createToggleHandler(index))
  }, [data?.questions, createToggleHandler])

  if (isLoading || error) return <FAQSkeleton />

  return (
    <section id='faq' className='mt-[6.25rem] relative transform-gpu will-change-contents max-md:mt-[12rem]'>
      {!isDesktopSafari && (
        <>
          <BackgroundLight
            className='!w-[6rem] !h-[6rem] blur-[6.125rem] bottom-[-3rem] left-[15.938rem] max-md:w-[6rem] max-md:h-[6rem]'
            color='purple'
          />
          <BackgroundLight className='!w-[6rem] !h-[6rem]  top-1/2 right-[15.938rem] max-md:w-[6rem] max-md:h-[6rem]' color='green' />
        </>
      )}
      <SectionHead
        title={data.title}
        withUnderline
        underlineWidth='w-[7.813rem]'
        subtitle={data.subtitle}
      />
      <div className='mt-[4.688rem]'>
        {data.questions.map(
          (
            {
              textField1: question,
              textField2: answer,
            }: { textField1: string; textField2: string },
            index: number
          ) => (
            <Answer
              key={index}
              question={question}
              answer={answer}
              isOpen={openQuestions.has(index)}
              onToggle={toggleHandlers[index]}
            />
          )
        )}
      </div>
    </section>
  )
})

FAQ.displayName = 'FAQ'

export { FAQ }
