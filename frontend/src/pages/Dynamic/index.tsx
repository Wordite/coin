import { useDynamicPage } from '@/hooks/useDynamicPage'
import { ContentSkeleton } from '@/shared/ContentSkeleton/ContentSkeleton'
import { DynamicPageContent } from '@/widgets/DynamicPageContent/DynamicPageContent'
import { NotFoundMessage } from '@/widgets/NotFoundMessage/NotFoundMessage'

const Dynamic = () => {
  const { data, isLoading, isNotFound } = useDynamicPage()

  if (isLoading)
    return (
      <div className='min-h-screen pt-[9rem]'>
        <ContentSkeleton />
      </div>
    )

  if (isNotFound) return <NotFoundMessage />
  return (
    <div className='pt-[9rem]'>
      <DynamicPageContent markdown={data} />{' '}
    </div>
  )
}

export { Dynamic }
