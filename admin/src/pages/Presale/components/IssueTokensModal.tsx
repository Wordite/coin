import React, { useState, useEffect } from 'react'
import { api } from '@/app/api'

interface IssueTokensModalProps {
  processId: string
  onClose: () => void
}

interface ProcessStatus {
  status: 'running' | 'completed' | 'failed'
  startTime: string
  processed: number
  total: number
  users: Array<{
    userId: string
    wallet: string
    amount: number
    status: 'success' | 'failed'
    timestamp: string
    signature?: string
    error?: string
  }>
  error?: string
}

export const IssueTokensModal: React.FC<IssueTokensModalProps> = ({ processId, onClose }) => {
  const [status, setStatus] = useState<ProcessStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await api.get(`/user/issue-all-tokens/${processId}/status`)
        setStatus(response.data)
        setLoading(false)
        
        // Stop polling if process is completed or failed
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          return
        }
      } catch (error) {
        console.error('Failed to fetch process status:', error)
        setLoading(false)
      }
    }

    // Poll every second
    const interval = setInterval(pollStatus, 1000)
    
    // Initial poll
    pollStatus()

    return () => clearInterval(interval)
  }, [processId])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500'
      case 'failed': return 'text-red-500'
      case 'running': return 'text-blue-500'
      case 'completed': return 'text-green-600'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'failed': return '❌'
      case 'running': return '⏳'
      case 'completed': return '🎉'
      default: return '⏸️'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading process status...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="text-center">
            <p className="text-red-500">Failed to load process status</p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Issuing Tokens</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">
              {getStatusIcon(status.status)} {status.status.toUpperCase()}
            </span>
            <span className={`font-bold ${getStatusColor(status.status)}`}>
              {status.processed}/{status.total} users
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(status.processed / status.total) * 100}%` }}
            ></div>
          </div>
          
          {status.error && (
            <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded text-red-700">
              <strong>Error:</strong> {status.error}
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Processed Users:</h3>
          {status.users.length === 0 ? (
            <p className="text-gray-500 italic">No users processed yet...</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {status.users.map((user, index) => (
                <div 
                  key={`${user.userId}-${index}`}
                  className={`p-3 rounded border-l-4 ${
                    user.status === 'success' 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm text-gray-600">
                          {user.wallet}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)} {user.status}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-sm text-gray-600">
                        {user.status === 'success' ? (
                          <>
                            <span className="font-semibold">Purchased {user.amount} tokens</span>
                            <span className="mx-2">→</span>
                            <span className="text-green-600 font-semibold">Sent {user.amount} tokens ✓</span>
                            {user.signature && (
                              <div className="mt-1 text-xs text-gray-500 font-mono">
                                TX: {user.signature}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-red-600">
                            Failed: {user.error || 'Unknown error'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {formatTime(user.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end space-x-3">
          {(status.status === 'completed' || status.status === 'failed') && (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
