import { Button, Spinner } from '@heroui/react'

interface ActionsSectionProps {
  saving: boolean
  onSave: () => void
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  saving,
  onSave
}) => {
  return (
    <div className="flex gap-4 justify-end">
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