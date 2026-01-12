import { Section } from '@/services/section.service'
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'

const useDynamicPage = () => {
  const { url } = useParams()
  // console.log('url', url)
  if (!url) return { data: null, isLoading: false, isNotFound: true }

  const { data, isLoading, error } = useQuery({
    queryKey: ['dynamicPage', url],
    queryFn: () => Section.getSectionByUrl(url),
    select: (data) => data.data.data.content.content,
  })

  // console.log(data)
  // console.log('error', error)
  // console.log('isLoading', isLoading)
  return { data, isLoading, isNotFound: !isLoading && error }
}

export { useDynamicPage }
