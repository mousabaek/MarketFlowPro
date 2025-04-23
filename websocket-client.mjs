import WebSocket from 'ws';

// Get host from environment
const host = 'localhost:3000';
const wsUrl = `ws://${host}/ws`;

console.log(`Connecting to WebSocket server at: ${wsUrl}`);
const socket = new WebSocket(wsUrl);

socket.on('open', function open() {
  console.log('WebSocket connection established');
  socket.send(JSON.stringify({
    type: 'test',
    message: 'Hello from test client',
    timestamp: new Date().toISOString()
  }));
});

socket.on('message', function incoming(data) {
  console.log(`Received message: ${data}`);
});

socket.on('error', function error(err) {
  console.error(`WebSocket error: ${err.message}`);
});

socket.on('close', function close(code, reason) {
  console.log(`WebSocket connection closed: ${code} - ${reason}`);
});

// Keep the process running
setTimeout(() => {
  console.log('Test client shutting down');
  socket.close();
  process.exit(0);
}, 5000);
