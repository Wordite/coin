import { forwardRef, useEffect, useRef } from 'react'

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
      return '❌'
    case 'warn':
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    case 'debug':
      return '🐛'
    default:
      return '📝'
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
        className="h-[calc(100vh-300px)] overflow-y-auto bg-[#0d1117] text-[#d4d4d4] font-mono text-sm"
        style={{ fontFamily: 'JetBrains Mono, Consolas, monospace' }}
      >
        <div ref={containerRef} className="p-4 space-y-1">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-xs">📝</span>
                </div>
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
                  className={`py-2 px-3 rounded-lg hover:bg-gray-800/30 transition-all duration-200 border-l-4 ${levelColor} group`}
                >
                  <div className="flex items-start gap-3">
                    {/* Line number */}
                    <span className="text-gray-600 text-xs flex-shrink-0 mt-1 font-mono">
                      {String(index + 1).padStart(4, '0')}
                    </span>
                    
                    {/* Level icon */}
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {levelIcon}
                    </span>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header with timestamp and context */}
                      <div className="flex items-center gap-2 mb-1">
                        {parsed.timestamp && (
                          <span className="text-gray-500 text-xs font-mono">
                            {parsed.timestamp}
                          </span>
                        )}
                        {parsed.context && (
                          <span className="text-gray-400 text-xs bg-gray-800 px-2 py-0.5 rounded">
                            {parsed.context}
                          </span>
                        )}
                        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded ${levelColor}`}>
                          {parsed.level}
                        </span>
                      </div>
                      
                      {/* Message */}
                      <div className="text-gray-200 break-words">
                        {parsed.message}
                      </div>
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
