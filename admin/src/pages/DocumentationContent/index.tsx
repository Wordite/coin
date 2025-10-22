import { Link } from 'react-router'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { DocumentationContent } from '../Documentation/ui/DocumentationContent'
import { DocumentationNavigation } from '../Documentation/ui/DocumentationNavigation'

export default function DocumentationContentPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Documentation Content</h1>
        <p className="text-foreground/60">Manage your documentation content and structure</p>
      </div>
      
      <DocumentationNavigation />
      
      <DocumentationContent />
    </div>
  )
}