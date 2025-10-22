import { forwardRef, useEffect, useRef } from 'react'

interface LogViewerProps {
  logs: string[]
  getLogLevelColor: (log: string) => string
}

export const LogViewer = forwardRef<HTMLDivElement, LogViewerProps>(
  ({ logs, getLogLevelColor }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight
      }
    }, [logs])

    return (
      <div
        ref={ref}
        className="h-[calc(100vh-300px)] overflow-y-auto bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm"
        style={{ fontFamily: 'Courier New, monospace' }}
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
            logs.map((log, index) => (
              <div
                key={index}
                className={`py-1 px-2 rounded hover:bg-gray-800/50 transition-colors border-l-2 border-transparent hover:border-gray-600 ${getLogLevelColor(log)}`}
                style={{
                  borderLeftColor: log.toLowerCase().includes('error') ? '#ef4444' : 
                                 log.toLowerCase().includes('warn') ? '#f59e0b' : 
                                 log.toLowerCase().includes('info') ? '#3b82f6' : 'transparent'
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 text-xs flex-shrink-0 mt-0.5">
                    {String(index + 1).padStart(4, '0')}
                  </span>
                  <span className="flex-1 break-all">{log}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }
)

LogViewer.displayName = 'LogViewer'
