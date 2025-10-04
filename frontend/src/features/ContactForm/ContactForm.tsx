import { Input } from '@/shared/Input/ui/Input'
import { Textarea } from '@/shared/Textarea'
import { Checkbox } from '@/shared/Checkbox/Checkbox'
import Button from '@/shared/Button'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { contactFormSchema, type ContactFormData } from '@/app/validation'
import { useToastContext } from '@/shared/Toast'
import { useSendContactForm } from '@/hooks'
import { useEffect } from 'react'
import { ContactFormSent } from './ContactFormSent'

const ContactForm = () => {
  const { showSuccess, showError } = useToastContext()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: yupResolver(contactFormSchema),
  })

  const { sendContactForm, isSuccess, isError } = useSendContactForm()

  const onSubmit = async (data: ContactFormData) => {
    sendContactForm(data)
  }

  useEffect(() => {
    if (isSuccess) {
      showSuccess('Message sent successfully!')
      reset()
    }

    if (isError) {
      showError('Error sending message. Please try again.')
    }
  }, [isSuccess, isError])

  return (
    <>
    {isSuccess ? <ContactFormSent /> : (
    <form onSubmit={handleSubmit(onSubmit)} className='w-[56.25rem] max-md:w-full'>
      <div className='flex flex-wrap max-w-full justify-between gap-[1.25rem]'>
        <Input
          placeholder='First Name'
          register={register}
          name='name'
          className='w-[27.388rem] max-md:w-full max-md:h-[4.6rem]'
          error={errors.name}
        />
        <Input
          placeholder='Last Name'
          register={register}
          name='lastName'
          className='w-[27.388rem] max-md:w-full max-md:h-[4.6rem]'
          error={errors.lastName}
        />
        <Input
          placeholder='Email'
          register={register}
          name='email'
          className='w-[27.388rem] max-md:w-full max-md:h-[4.6rem]'
          error={errors.email}
        />
        <Input
          placeholder='Phone'
          register={register}
          name='phone'
          className='w-[27.388rem] max-md:w-full max-md:h-[4.6rem]'
          error={errors.phone}
        />
      </div>
      <div className='mt-[1.25rem]'>
        <Textarea
          placeholder='Message'
          register={register}
          name='message'
          className='w-full h-[6.25rem] max-md:w-full max-md:h-[8rem]'
          error={errors.message}
        />
      </div>

      <div className='mt-[1.25rem] max-md:mt-[2rem]'>
        <Checkbox
          name='privacyConsent'
          label='I consent to the processing of my personal data in accordance with the'
          linkText='Privacy Policy'
          linkHref='/privacy-policy'
          error={errors.privacyConsent}
          register={register}
          className='max-md:text-[1rem]'
        />
      </div>

      <Button
        type='submit'
        disabled={isSubmitting}
        color='white'
        className='clickable w-[13rem] h-[3.313rem] mt-[1.25rem] disabled:opacity-50 disabled:cursor-not-allowed max-md:w-full max-md:h-[4.6rem] max-md:mt-[3rem]'
      >
        {isSubmitting ? 'Sending...' : 'Submit'}
        </Button>
      </form>
    )}
    </>
  )
}

export { ContactForm }
