import React, { useState } from 'react'
import { Link } from 'react-router'
import { DocumentTextIcon, Cog6ToothIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { Button } from '@heroui/react'
import { Notify } from '@/services/notify'
import { docsConfigApi } from '@/services/docsConfigApi'

export const DocumentationNavigation: React.FC = () => {
  const [isRebuilding, setIsRebuilding] = useState(false)

  const handleRebuild = async () => {
    try {
      setIsRebuilding(true)
      const result = await docsConfigApi.rebuildDocs()
      
      if (result.success) {
        Notify.success('Documentation rebuild completed successfully!')
      } else {
        Notify.error(result.message || 'Failed to rebuild documentation')
      }
    } catch (error) {
      Notify.error('Failed to rebuild documentation')
    } finally {
      setIsRebuilding(false)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Documentation Management</h2>
        <Button
          color="primary"
          variant="flat"
          startContent={<ArrowPathIcon className="w-4 h-4" />}
          onPress={handleRebuild}
          isLoading={isRebuilding}
          isDisabled={isRebuilding}
        >
          {isRebuilding ? 'Rebuilding...' : 'Rebuild Docs'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Card */}
        <Link 
          to="/documentation/content"
          className="group block p-6 bg-content1 rounded-lg border border-divider hover:border-primary transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <DocumentTextIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                Content Management
              </h3>
              <p className="text-foreground/60 mt-1">
                Create, edit and organize your documentation content
              </p>
            </div>
          </div>
        </Link>

        {/* Settings Card */}
        <Link 
          to="/documentation/settings"
          className="group block p-6 bg-content1 rounded-lg border border-divider hover:border-primary transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Cog6ToothIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                Documentation Settings
              </h3>
              <p className="text-foreground/60 mt-1">
                Configure Docs settings and appearance
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}