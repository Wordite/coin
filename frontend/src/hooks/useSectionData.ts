import { useQuery } from '@tanstack/react-query'
import { Section } from '@/services/section.service'
import { Sections } from '@/config/sections'

const useSectionData = (url: keyof typeof Sections) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['section', url],
    queryFn: () => Section.getSectionByUrl(Sections[url]),
    select: (data) => data.data.data.content,
})

  return { data, isLoading, error }
}

export { useSectionData }
