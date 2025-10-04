import { marked } from 'marked'
import { useEffect, useRef } from 'react'
import '@/app/styles/markdown.css'

const DynamicPageContent = ({ markdown }: { markdown: string }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && markdown) {
      ref.current.innerHTML = marked.parse(markdown) as string
    }
  }, [markdown])

  return <section className='markdown min-h-screen' ref={ref} />
}

export { DynamicPageContent }
