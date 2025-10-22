#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🔍 Testing WebSocket connection...');

const socket = io('https://tycoin.app', {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
});

// Connect to the live-logs namespace
const liveLogsSocket = socket.of('/live-logs');

liveLogsSocket.on('connect', () => {
  console.log('✅ Live-logs namespace connected successfully!');
  console.log('📡 Socket ID:', liveLogsSocket.id);
  
  // Test subscription
  liveLogsSocket.emit('subscribe-logs', { logType: 'all' });
});

liveLogsSocket.on('connect_error', (error) => {
  console.error('❌ Live-logs namespace connection failed:', error.message);
  console.error('🔍 Error details:', error);
});

liveLogsSocket.on('log-history', (history) => {
  console.log('📜 Received log history:', history.length, 'lines');
});

liveLogsSocket.on('log-update', (newLines) => {
  console.log('🔄 Received new log lines:', newLines.length);
});

liveLogsSocket.on('log-subscribed', (data) => {
  console.log('✅ Subscribed to logs:', data.filename);
});

liveLogsSocket.on('log-error', (error) => {
  console.error('❌ Log error:', error.message);
});

// Test after 5 seconds
setTimeout(() => {
  console.log('🧪 Test completed, disconnecting...');
  liveLogsSocket.disconnect();
  process.exit(0);
}, 5000);
