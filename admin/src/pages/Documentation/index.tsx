import { DocumentationNavigation } from './ui/DocumentationNavigation'
import { useBranding } from '@/hooks/useBranding'

export default function DocumentationPage() {
  const { branding, loading, getImageUrl } = useBranding()

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-content2 rounded mb-2 w-1/3"></div>
          <div className="h-4 bg-content2 rounded mb-8 w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-content2 rounded"></div>
            <div className="h-32 bg-content2 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex items-center gap-4">
        {branding?.logoUrl && (
          <img 
            src={getImageUrl(branding.logoUrl)} 
            alt="Logo" 
            className="w-12 h-12 object-contain"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {branding?.title || 'Documentation Management'}
          </h1>
          <p className="text-foreground/60">
            {branding?.description || 'Manage your documentation content and settings'}
          </p>
        </div>
      </div>

      <DocumentationNavigation />
    </div>
  )
}