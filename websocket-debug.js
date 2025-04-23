import { WebSocketServer } from 'ws';

// Create a WebSocket server on port 3001 for testing
const wss = new WebSocket.Server({ port: 3001 });

console.log('WebSocket debug server started on ws://localhost:3001');

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
    // Echo the message back
    ws.send(JSON.stringify({ 
      type: 'echo', 
      message: message.toString(),
      timestamp: new Date().toISOString()
    }));
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
  
  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'welcome', 
    message: 'Connected to WebSocket debug server',
    timestamp: new Date().toISOString()
  }));
});

// Clean shutdown
process.on('SIGINT', () => {
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});