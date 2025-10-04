import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from '../../app/validation/authSchemas'
import { Input, Button, Card, CardBody, CardHeader, Divider } from '@heroui/react'
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { useSendForm } from './model/useSendForm'
// TODO: Переход на класс сервис - закомментирован
// import { useCheckAuth } from '@/hooks/useCheckAuth'
import { AuthEmailSentPopup } from '../AuthEmailSentPopup'

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isWaitingForEmail, setIsWaitingForEmail] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  })

  // useEffect(() => {
  //   console.log(registerForm.formState.errors)
  // }, [registerForm.formState.errors])

  const { signIn, signUp } = useSendForm()

  // TODO: Переход на класс сервис - закомментирован
  // useCheckAuth()

  useEffect(() => {
    loginForm.reset()
    registerForm.reset()
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [isLogin])

  // Показываем попап при успешной отправке формы
  useEffect(() => {
    if (signIn.isSuccess || signUp.isSuccess) {
      setShowAuthPopup(true)
      setIsWaitingForEmail(true)
    }
  }, [signIn.isSuccess, signUp.isSuccess])

  const handleCloseAuthPopup = () => {
    setShowAuthPopup(false)
    // Сбрасываем состояние успеха после закрытия попапа
    if (signIn.isSuccess) {
      signIn.reset()
    }
    if (signUp.isSuccess) {
      signUp.reset()
    }
  }

  const onLoginSubmit = (data: LoginFormData) => {
    setUserEmail(data.email)
    signIn.mutate(data)
  }

  const onRegisterSubmit = (data: RegisterFormData) => {
    setUserEmail(data.email)
    signUp.mutate(data)
  }

  // Компонент с анимацией точек
  const LoadingDots = () => {
    const [dots, setDots] = useState('')

    useEffect(() => {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return ''
          return prev + '.'
        })
      }, 500)

      return () => clearInterval(interval)
    }, [])

    return (
      <span className="text-primary font-mono text-lg">
        {dots}
      </span>
    )
  }

  return (
    <div className='min-h-screen dark bg-background w-full text-foreground flex items-center justify-center p-6'>
      <div className='max-w-md w-full space-y-6'>
        {isWaitingForEmail ? (
          // Экран ожидания перехода по ссылке
          <div className='text-center space-y-6'>
            <div className='flex flex-col gap-4 items-center'>
              <div className='w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center'>
                <EnvelopeIcon className='w-10 h-10 text-primary' />
              </div>
              <h2 className='text-3xl font-bold text-foreground tracking-tight'>
                Waiting for email link access
              </h2>
              <p className='text-lg text-default-500'>
                Please check your email and click the authentication link
              </p>
              <div className='flex items-center gap-2 text-xl text-foreground'>
                <span>Your sign-in will be automatically completed</span>
                <LoadingDots />
              </div>
            </div>
          </div>
        ) : (
          // Обычная форма
          <>
            {/* Заголовок */}
            <div className='text-center space-y-3'>
              <h2 className='text-4xl font-bold text-foreground tracking-tight'>
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className='text-base text-default-500'>
                {isLogin ? 'Or' : 'Already have an account?'}{' '}
                <button
                  type='button'
                  onClick={() => setIsLogin(!isLogin)}
                  className='font-semibold text-primary hover:text-primary-500 transition-all duration-200 underline-offset-4 hover:underline cursor-pointer'
                >
                  {isLogin ? 'sign up' : 'sign in'}
                </button>
              </p>
            </div>

        {/* Форма */}
        <Card className='w-full shadow-2xl border border-default-200'>
          <CardHeader className='flex flex-col gap-4 pb-4 text-center'>
            <div className='flex flex-col gap-1 items-center'>
              <div className='w-16 h-16 bg-primary/10 rounded-full mt-1.5 mb-3 flex items-center justify-center'>
                {isLogin ? (
                  <UserIcon className='w-8 h-8 text-primary' />
                ) : (
                  <EnvelopeIcon className='w-8 h-8 text-primary' />
                )}
              </div>
              <h3 className='text-2xl font-bold text-foreground'>
                {isLogin ? 'Welcome back' : 'Create account'}
              </h3>
              <p className='text-sm text-default-500 leading-relaxed max-w-xs'>
                {isLogin
                  ? 'Enter your credentials to access your account'
                  : 'Fill in the form below to create your account'}
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className='gap-6 px-8 py-6'>
            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className='space-y-4'>
                <Input
                  type='email'
                  label='Email'
                  placeholder='Enter your email'
                  variant='bordered'
                  color={'default'}
                  isInvalid={!!loginForm.formState.errors.email}
                  errorMessage={loginForm.formState.errors.email?.message}
                  size='lg'
                  startContent={<EnvelopeIcon className='w-5 h-5 text-default-400' />}
                  classNames={{
                    input: 'text-base pl-[2rem]',
                    label: 'text-base font-medium',
                    inputWrapper: 'h-[4.25rem]',
                  }}
                  {...loginForm.register('email')}
                />

                <Input
                  type={showPassword ? 'text' : 'password'}
                  label='Password'
                  placeholder='Enter your password'
                  variant='bordered'
                  color={'default'}
                  isInvalid={!!loginForm.formState.errors.password}
                  errorMessage={loginForm.formState.errors.password?.message}
                  size='lg'
                  startContent={<LockClosedIcon className='w-5 h-5 text-default-400' />}
                  endContent={
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='focus:outline-none absolute top-1/2 -translate-y-1/2 right-[1rem]'
                    >
                      {showPassword ? (
                        <EyeSlashIcon className='w-5 h-5 text-default-400 hover:text-default-600 transition-colors' />
                      ) : (
                        <EyeIcon className='w-5 h-5 text-default-400 hover:text-default-600 transition-colors' />
                      )}
                    </button>
                  }
                  classNames={{
                    input: 'text-base pl-[2rem]',
                    label: 'text-base font-medium',
                    inputWrapper: 'h-[4.25rem]',
                  }}
                  {...loginForm.register('password')}
                />

                <Button
                  type='submit'
                  color='primary'
                  className='w-full h-12 text-base font-semibold mt-4'
                  isLoading={loginForm.formState.isSubmitting || signIn.isPending}
                  disabled={loginForm.formState.isSubmitting || signIn.isPending}
                  size='lg'
                >
                  {loginForm.formState.isSubmitting || signIn.isPending ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className='space-y-4'>
                <Input
                  type='email'
                  label='Email'
                  placeholder='Enter your email'
                  variant='bordered'
                  color={'default'}
                  isInvalid={!!registerForm.formState.errors.email}
                  errorMessage={registerForm.formState.errors.email?.message}
                  size='lg'
                  startContent={<EnvelopeIcon className='w-5 h-5 text-default-400' />}
                  classNames={{
                    input: 'text-base pl-[2rem]',
                    label: 'text-base font-medium',
                    inputWrapper: 'h-[4.25rem]',
                  }}
                  {...registerForm.register('email')}
                />

                <Input
                  type={showPassword ? 'text' : 'password'}
                  label='Password'
                  placeholder='Enter password'
                  variant='bordered'
                  color={'default'}
                  isInvalid={!!registerForm.formState.errors.password}
                  errorMessage={registerForm.formState.errors.password?.message}
                  size='lg'
                  startContent={<LockClosedIcon className='w-5 h-5 text-default-400' />}
                  endContent={
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='focus:outline-none absolute top-1/2 -translate-y-1/2 right-[1rem]'
                    >
                      {showPassword ? (
                        <EyeSlashIcon className='w-5 h-5 text-default-400 hover:text-default-600 transition-colors' />
                      ) : (
                        <EyeIcon className='w-5 h-5 text-default-400 hover:text-default-600 transition-colors' />
                      )}
                    </button>
                  }
                  classNames={{
                    input: 'text-base pl-[2rem]',
                    label: 'text-base font-medium',
                    inputWrapper: 'h-[4rem]',
                  }}
                  {...registerForm.register('password')}
                />

                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  label='Confirm Password'
                  placeholder='Repeat password'
                  variant='bordered'
                  color={'default'}
                  isInvalid={!!registerForm.formState.errors.confirmPassword}
                  errorMessage={registerForm.formState.errors.confirmPassword?.message}
                  size='lg'
                  startContent={<LockClosedIcon className='w-5 h-5 text-default-400' />}
                  endContent={
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='focus:outline-none absolute top-1/2 -translate-y-1/2 right-[1rem]'
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className='w-5 h-5 text-default-400 hover:text-default-600 transition-colors' />
                      ) : (
                        <EyeIcon className='w-5 h-5 text-default-400 hover:text-default-600 transition-colors' />
                      )}
                    </button>
                  }
                  classNames={{
                    input: 'text-base pl-[2rem]',
                    label: 'text-base font-medium',
                    inputWrapper: 'h-[4.25rem]',
                  }}
                  {...registerForm.register('confirmPassword')}
                />

                <Button
                  type='submit'
                  color='primary'
                  className='w-full h-12 text-base font-semibold mt-4'
                  isLoading={registerForm.formState.isSubmitting || signUp.isPending}
                  disabled={registerForm.formState.isSubmitting || signUp.isPending}
                  size='lg'
                >
                  {registerForm.formState.isSubmitting || signUp.isPending ? 'Signing up...' : 'Sign up'}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
          </>
        )}
      </div>

      {/* Попап для подтверждения отправки ссылки на почту */}
      <AuthEmailSentPopup
        isOpen={showAuthPopup}
        onClose={handleCloseAuthPopup}
        email={userEmail}
      />
    </div>
  )
}

export { LoginForm }
