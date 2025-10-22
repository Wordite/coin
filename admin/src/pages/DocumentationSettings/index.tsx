import { Link } from 'react-router'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { DocumentationSettings } from '../Documentation/ui/DocumentationSettings'
import { DocumentationNavigation } from '../Documentation/ui/DocumentationNavigation'

export default function DocumentationSettingsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Documentation Settings</h1>
        <p className="text-foreground/60">Configure Docs settings and appearance</p>
      </div>
      
      <DocumentationNavigation />
      
      <DocumentationSettings />
    </div>
  )
}