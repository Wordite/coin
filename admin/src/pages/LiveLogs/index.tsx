import { useState, useEffect, useRef } from 'react'
import { Card, CardBody, Button, Switch, Chip, Tabs, Tab } from '@heroui/react'
import { 
  PlayIcon, 
  PauseIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  CommandLineIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { LogViewer } from './ui/LogViewer'
import { LogControls } from './ui/LogControls'
import { useLogSocket } from './model/useLogSocket'

const LiveLogs = () => {
  const { logs, isConnected } = useLogSocket()
  const [autoScroll, setAutoScroll] = useState(true)
  const [selectedLogType, setSelectedLogType] = useState('all')
  const [filteredLogs, setFilteredLogs] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const logViewerRef = useRef<HTMLDivElement>(null)

  // Filter logs based on selected type and search term
  useEffect(() => {
    let filtered = logs

    // Filter by log type
    if (selectedLogType !== 'all') {
      filtered = filtered.filter(log => {
        const level = log.toLowerCase()
        if (selectedLogType === 'error') {
          return level.includes('error') || level.includes('fatal')
        } else if (selectedLogType === 'warn') {
          return level.includes('warn')
        } else if (selectedLogType === 'info') {
          return level.includes('info')
        }
        return true
      })
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(log => 
        log.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredLogs(filtered)
  }, [logs, selectedLogType, searchTerm])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logViewerRef.current) {
      logViewerRef.current.scrollTop = logViewerRef.current.scrollHeight
    }
  }, [filteredLogs, autoScroll])

  const handleClearLogs = () => {
    setFilteredLogs([])
  }

  const handleDownloadLogs = () => {
    const logContent = filteredLogs.join('\n')
    const blob = new Blob([logContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getLogLevelColor = (log: string) => {
    const level = log.toLowerCase()
    if (level.includes('error') || level.includes('fatal')) {
      return 'text-red-400'
    } else if (level.includes('warn')) {
      return 'text-yellow-400'
    } else if (level.includes('info')) {
      return 'text-blue-400'
    }
    return 'text-gray-300'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CommandLineIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Live Server Logs</h1>
            <p className="text-foreground/60">Real-time monitoring of backend logs</p>
          </div>
        </div>
        
        {/* Connection Status */}
        <Chip
          color={isConnected ? 'success' : 'danger'}
          variant="flat"
          startContent={
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          }
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </Chip>
      </div>

      {/* Controls */}
      <LogControls
        autoScroll={autoScroll}
        onAutoScrollChange={setAutoScroll}
        onClearLogs={handleClearLogs}
        onDownloadLogs={handleDownloadLogs}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedLogType={selectedLogType}
        onLogTypeChange={setSelectedLogType}
      />

      {/* Log Viewer */}
      <Card>
        <CardBody className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-divider">
            <div className="flex items-center gap-4">
              <Tabs
                selectedKey={selectedLogType}
                onSelectionChange={(key) => setSelectedLogType(key as string)}
                size="sm"
              >
                <Tab key="all" title="All Logs" />
                <Tab key="error" title="Errors" />
                <Tab key="warn" title="Warnings" />
                <Tab key="info" title="Info" />
              </Tabs>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <span>{filteredLogs.length} lines</span>
              {autoScroll && (
                <div className="flex items-center gap-1">
                  <PlayIcon className="w-4 h-4" />
                  <span>Auto-scroll</span>
                </div>
              )}
            </div>
          </div>

          <LogViewer
            ref={logViewerRef}
            logs={filteredLogs}
            getLogLevelColor={getLogLevelColor}
          />
        </CardBody>
      </Card>
    </div>
  )
}

export default LiveLogs
