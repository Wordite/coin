import { Button, Input, Switch } from '@heroui/react'
import { 
  TrashIcon, 
  ArrowDownTrayIcon, 
  MagnifyingGlassIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'

interface LogControlsProps {
  autoScroll: boolean
  onAutoScrollChange: (value: boolean) => void
  onClearLogs: () => void
  onDownloadLogs: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
}

export const LogControls = ({
  autoScroll,
  onAutoScrollChange,
  onClearLogs,
  onDownloadLogs,
  searchTerm,
  onSearchChange
}: LogControlsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-default-50 rounded-lg">
      {/* Auto-scroll Toggle */}
      <div className="flex items-center gap-2">
        <Switch
          isSelected={autoScroll}
          onValueChange={onAutoScrollChange}
          size="sm"
          color="primary"
        />
        <span className="text-sm font-medium">Auto-scroll</span>
        {autoScroll ? (
          <PlayIcon className="w-4 h-4 text-success" />
        ) : (
          <PauseIcon className="w-4 h-4 text-warning" />
        )}
      </div>

      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onValueChange={onSearchChange}
          startContent={<MagnifyingGlassIcon className="w-4 h-4" />}
          size="sm"
          variant="bordered"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="light"
          color="warning"
          startContent={<TrashIcon className="w-4 h-4" />}
          onPress={onClearLogs}
        >
          Clear
        </Button>
        
        <Button
          size="sm"
          variant="light"
          color="primary"
          startContent={<ArrowDownTrayIcon className="w-4 h-4" />}
          onPress={onDownloadLogs}
        >
          Download
        </Button>
      </div>
    </div>
  )
}
