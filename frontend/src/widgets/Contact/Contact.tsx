import React from 'react'
import { SectionHead } from '@/shared/SectionHead/SectionHead'
import { ContactForm } from '@/features/ContactForm/ContactForm'
import { ContactInfo } from '@/entities/ContactInfo'
import { BackgroundLight } from '@/shared/BackgroundLight/BackgroundLight'
import { useSectionData } from '@/hooks/useSectionData'

const Contact = React.memo(() => {
  const { data } = useSectionData('SocialsAndContact')

  return (
    <section id='contact' className='mt-[6.25rem] relative'>
      <BackgroundLight
        className='!w-[6rem] !h-[6rem] blur-[6.125rem] bottom-[2rem] left-[15.938rem]'
        color='green'
      />
      <BackgroundLight
        className='!w-[6rem] !h-[6rem]  bottom-[-9rem] right-[15.938rem]'
        color='purple'
      />

      <SectionHead title={data?.title} withUnderline underlineWidth='w-[7.813rem]' />

      <div className='flex justify-between mt-[4.425rem] max-md:flex-col max-md:gap-[2rem]'>
        <ContactForm />
        <ContactInfo />
      </div>
    </section>
  )
})

Contact.displayName = 'Contact'

export { Contact }
