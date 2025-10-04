import { useQuery } from '@tanstack/react-query'
import { Section } from '@/services/section.service'


const useHeroData = () => {
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['hero'],
    queryFn: () => Section.getHeroData(),
    select: (data) => data.data.data.content,
  })

  return { data, isLoading, error }
}

export { useHeroData }