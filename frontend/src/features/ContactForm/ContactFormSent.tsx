import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const ContactFormSent = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const checkmarkRef = useRef<SVGSVGElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const checkmark = checkmarkRef.current
    const message = messageRef.current
    const circle = circleRef.current

    if (!container || !checkmark || !message || !circle) return

    gsap.config({
      force3D: true,
      nullTargetWarn: false,
    })

    gsap.set([checkmark, message, circle], {
      opacity: 0,
      scale: 0,
      rotation: -180,
      force3D: true,
      transformOrigin: 'center center',
    })

    const tl = gsap.timeline()

    tl.to(container, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    })

    tl.to(
      circle,
      {
        scale: 1,
        opacity: 0.15,
        duration: 0.6,
        ease: 'back.out(1.7)',
      },
      '-=0.1'
    )

    tl.to(
      checkmark,
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
      },
      '-=0.4'
    )

    tl.to(
      message,
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
      },
      '-=0.3'
    )

    tl.to(
      circle,
      {
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1,
      },
      '+=0.2'
    )

    return () => {
      tl.kill()
      gsap.set([checkmark, message, circle], { clearProps: 'all' })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className='flex flex-col items-center justify-center min-h-[320px] opacity-0 -mt-12 bg-gray-transparent-1n0 backdrop-blur-sm border border-stroke-dark rounded-2xl p-8 shadow-lg'
    >
      <div className='relative mb-8'>
        <div
          ref={circleRef}
          className='absolute inset-0 w-20 h-20 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2'
        />

        <svg
          ref={checkmarkRef}
          className='w-16 h-16 text-green-500 relative z-10'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
          viewBox='0 0 24 24'
        >
          <path d='M20 6L9 17l-5-5' />
        </svg>
      </div>
      <div ref={messageRef} className='text-center'>
        <h3 className='text-2xl font-bold text-green-600 mb-2'>Message sent successfully!</h3>
        <p className='text-gray-600 text-lg'>
          Thank you for your message. We will get back to you soon.
        </p>
      </div>
    </div>
  )
}

export { ContactFormSent }
