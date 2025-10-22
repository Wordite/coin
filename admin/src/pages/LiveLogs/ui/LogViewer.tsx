import { forwardRef, useEffect, useRef } from 'react'
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  BugAntIcon,
  DocumentTextIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface LogViewerProps {
  logs: string[]
}

interface ParsedLog {
  timestamp?: string
  level: string
  context?: string
  message: string
  raw: string
}

const parseLogLine = (logLine: string): ParsedLog => {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(logLine)
    return {
      timestamp: parsed.timestamp || parsed.time,
      level: parsed.level || 'info',
      context: parsed.context,
      message: parsed.message || logLine,
      raw: logLine
    }
  } catch {
    // If not JSON, try to extract level from text
    const levelMatch = logLine.match(/\b(error|warn|info|debug)\b/i)
    const level = levelMatch ? levelMatch[1].toLowerCase() : 'info'
    
    return {
      level,
      message: logLine,
      raw: logLine
    }
  }
}

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'error':
      return 'text-red-400 border-red-500/30 bg-red-500/5'
    case 'warn':
    case 'warning':
      return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5'
    case 'info':
      return 'text-blue-400 border-blue-500/30 bg-blue-500/5'
    case 'debug':
      return 'text-gray-400 border-gray-500/30 bg-gray-500/5'
    default:
      return 'text-gray-300 border-gray-500/30 bg-gray-500/5'
  }
}

const getLevelIcon = (level: string) => {
  switch (level.toLowerCase()) {
    case 'error':
      return <XCircleIcon className="w-4 h-4 text-red-400" />
    case 'warn':
    case 'warning':
      return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
    case 'info':
      return <InformationCircleIcon className="w-4 h-4 text-blue-400" />
    case 'debug':
      return <BugAntIcon className="w-4 h-4 text-gray-400" />
    default:
      return <DocumentTextIcon className="w-4 h-4 text-gray-300" />
  }
}

export const LogViewer = forwardRef<HTMLDivElement, LogViewerProps>(
  ({ logs }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight
      }
    }, [logs])

    return (
      <div
        ref={ref}
        className="h-[calc(100vh-300px)] overflow-y-auto bg-[#0d1117] text-[#d4d4d4] font-mono text-xs"
        style={{ fontFamily: 'JetBrains Mono, Consolas, monospace' }}
      >
        <div ref={containerRef} className="p-2 space-y-0.5">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="flex flex-col items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-gray-600" />
                <span>No logs available</span>
                <span className="text-xs text-gray-600">Logs will appear here when available</span>
              </div>
            </div>
          ) : (
            logs.map((log, index) => {
              const parsed = parseLogLine(log)
              const levelColor = getLevelColor(parsed.level)
              const levelIcon = getLevelIcon(parsed.level)
              
              return (
                <div
                  key={index}
                  className={`py-1 px-2 rounded hover:bg-gray-800/30 transition-colors border-l-2 ${levelColor} group`}
                >
                  <div className="flex items-center gap-2">
                    {/* Line number */}
                    <span className="text-gray-600 text-xs flex-shrink-0 font-mono w-8">
                      {String(index + 1).padStart(3, '0')}
                    </span>
                    
                    {/* Level icon */}
                    <div className="flex-shrink-0">
                      {levelIcon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {/* Timestamp */}
                      {parsed.timestamp && (
                        <span className="text-gray-500 text-xs font-mono flex-shrink-0">
                          {parsed.timestamp}
                        </span>
                      )}
                      
                      {/* Context */}
                      {parsed.context && (
                        <span className="text-gray-400 text-xs bg-gray-800 px-1.5 py-0.5 rounded flex-shrink-0">
                          {parsed.context}
                        </span>
                      )}
                      
                      {/* Message */}
                      <span className="text-gray-200 break-words text-xs">
                        {parsed.message}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }
)

LogViewer.displayName = 'LogViewer'
