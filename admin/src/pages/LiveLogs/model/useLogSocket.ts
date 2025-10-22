import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export const useLogSocket = () => {
  const [logs, setLogs] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    
    console.log('[LOG SOCKET] 🔍 Debug info:')
    console.log('[LOG SOCKET] Backend URL:', backendUrl)
    console.log('[LOG SOCKET] Current location:', window.location.href)
    console.log('[LOG SOCKET] Protocol:', window.location.protocol)
    console.log('[LOG SOCKET] Namespace: /live-logs')
    
    const socket = io(`${backendUrl}/live-logs`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })
    
    socket.on('connect', () => {
      console.log('[LOG SOCKET] ✅ Connected to server')
      setIsConnected(true)
    })
    
    socket.on('disconnect', (reason) => {
      console.log('[LOG SOCKET] ❌ Disconnected from server. Reason:', reason)
      setIsConnected(false)
    })
    
    socket.on('connect_error', (error) => {
      console.error('[LOG SOCKET] ❌ Connection error:', error)
      setIsConnected(false)
    })
    
    socket.on('log-history', (history: string[]) => {
      console.log('[LOG SOCKET] 📜 Received log history:', history.length, 'lines')
      console.log('[LOG SOCKET] First few lines:', history.slice(0, 3))
      setLogs(history)
    })
    
    socket.on('log-update', (newLines: string[]) => {
      console.log('[LOG SOCKET] 🔄 Received new log lines:', newLines.length)
      setLogs(prev => {
        const updated = [...newLines, ...prev]
        // Keep only last 1000 lines for performance
        return updated.slice(0, 1000)
      })
    })
    
    socket.on('log-subscribed', (data: { filename: string }) => {
      console.log('[LOG SOCKET] ✅ Subscribed to logs:', data.filename)
    })
    
    socket.on('log-unsubscribed', (data: { filename: string }) => {
      console.log('[LOG SOCKET] 📤 Unsubscribed from logs:', data.filename)
    })
    
    socket.on('log-error', (error: { message: string }) => {
      console.error('[LOG SOCKET] ❌ Error:', error.message)
    })
    
    // Subscribe to all logs initially
    console.log('[LOG SOCKET] 📡 Emitting subscribe-logs event')
    socket.emit('subscribe-logs', { logType: 'all' })
    
    socketRef.current = socket
    
    return () => {
      console.log('[LOG SOCKET] 🧹 Cleaning up socket connection')
      socket.disconnect()
    }
  }, [])

  const subscribeToLogs = (logType: string, filename?: string) => {
    if (socketRef.current) {
      socketRef.current.emit('subscribe-logs', { logType, filename })
    }
  }

  const unsubscribeFromLogs = (filename: string) => {
    if (socketRef.current) {
      socketRef.current.emit('unsubscribe-logs', { filename })
    }
  }

  const getLogFiles = () => {
    if (socketRef.current) {
      socketRef.current.emit('get-log-files')
    }
  }

  return { 
    logs, 
    isConnected, 
    subscribeToLogs, 
    unsubscribeFromLogs, 
    getLogFiles 
  }
}
