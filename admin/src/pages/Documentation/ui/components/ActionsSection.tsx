import { Button, Spinner } from '@heroui/react'

interface ActionsSectionProps {
  saving: boolean
  rebuilding: boolean
  onSave: () => void
  onRebuild: () => void
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  saving,
  rebuilding,
  onSave,
  onRebuild
}) => {
  return (
    <div className="flex gap-4 justify-end">
      <Button
        color="secondary"
        variant="flat"
        onPress={onRebuild}
        disabled={rebuilding}
        className="dark"
        startContent={rebuilding ? <Spinner size="sm" /> : null}
      >
        {rebuilding ? 'Rebuilding...' : 'Rebuild Docs'}
      </Button>
      
      <Button
        color="primary"
        onPress={onSave}
        disabled={saving}
        className="dark"
        startContent={saving ? <Spinner size="sm" /> : null}
      >
        {saving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  )
}