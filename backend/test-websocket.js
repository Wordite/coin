#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🔍 Testing WebSocket connection...');

const socket = io('https://tycoin.app', {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  namespace: '/live-logs',
  timeout: 10000,
  forceNew: true
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('📡 Socket ID:', socket.id);
  
  // Test subscription
  socket.emit('subscribe-logs', { logType: 'all' });
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection failed:', error.message);
  console.error('🔍 Error details:', error);
});

socket.on('log-history', (history) => {
  console.log('📜 Received log history:', history.length, 'lines');
});

socket.on('log-update', (newLines) => {
  console.log('🔄 Received new log lines:', newLines.length);
});

socket.on('log-subscribed', (data) => {
  console.log('✅ Subscribed to logs:', data.filename);
});

socket.on('log-error', (error) => {
  console.error('❌ Log error:', error.message);
});

// Test after 5 seconds
setTimeout(() => {
  console.log('🧪 Test completed, disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 5000);
