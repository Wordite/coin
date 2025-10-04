import { useSectionData } from '@/hooks/useSectionData'
import { marked } from 'marked'
import { useEffect, useRef } from 'react'
import { ContentSkeleton } from '@/shared/ContentSkeleton/ContentSkeleton'
import '@/app/styles/markdown.css'

const PrivacyPolicy = () => {
  const { data, isLoading, error } = useSectionData('PrivacyPolicy')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && data && data.content) {
      ref.current.innerHTML = marked.parse(data.content) as string
    }
  }, [data?.content])

  return (
    <section className='markdown min-h-screen pt-[9rem]' ref={ref}>
      {isLoading && <ContentSkeleton />}
    </section>
  )
}

export { PrivacyPolicy }
