import { useParams } from 'react-router'
import { useActivation } from './model/useActivation'
import { Card, CardBody, CardHeader, Divider } from '@heroui/react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const Activation = () => {
  const { link } = useParams<{ link: string }>()
  const { data, isLoading, isError, error } = useActivation(link || '') as { data: any, isLoading: boolean, isError: boolean, error: any }

  if (isLoading) {
    return (
      <div className='min-h-screen dark bg-background w-full text-foreground flex items-center justify-center p-6'>
        <div className='max-w-md w-full'>
          <Card className='w-full shadow-2xl border border-default-200'>
            <CardBody className='text-center py-8'>
              <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3'></div>
              <p className='text-lg text-default-500'>Confirming authorization...</p>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='min-h-screen dark bg-background w-full text-foreground flex items-center justify-center p-6'>
        <div className='max-w-md w-full'>
          <Card className='w-full shadow-2xl border border-default-200'>
            <CardBody className='text-center py-8'>
              <div className='flex flex-col items-center justify-center space-y-3'>
                <div className='w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center'>
                  <XCircleIcon className='w-7 h-7 text-danger' />
                </div>
                <h2 className='text-xl font-bold text-foreground'>Authorization Failed</h2>
              </div>
              <Divider className='my-4' />
              <div className='space-y-3'>
                <p className='text-default-500'>
                  {error?.response?.data?.message || 'An error occurred during authorization confirmation'}
                </p>
                <p className='text-sm text-default-400'>
                  The authorization link may be invalid or expired
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen dark bg-background w-full text-foreground flex items-center justify-center p-6'>
      <div className='max-w-md w-full'>
        <Card className='w-full shadow-2xl border border-default-200'>
          <CardBody className='text-center py-8'>
            <div className='flex flex-col items-center justify-center space-y-3'>
              <div className='w-14 h-14 bg-success/10 rounded-full flex items-center justify-center'>
                <CheckCircleIcon className='w-7 h-7 text-success' />
              </div>
              <h2 className='text-xl font-bold text-foreground'>Authorization Confirmed!</h2>
            </div>
            <Divider className='my-4' />
            <div className='space-y-3'>
              <p className='text-default-500'>
                Your authorization request has been confirmed
              </p>
              <p className='text-sm text-default-400'>
                You can now return to the tab where you were authorizing
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export { Activation } 