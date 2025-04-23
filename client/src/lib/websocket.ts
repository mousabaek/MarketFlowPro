/**
 * WebSocket client for the Wolf Auto Marketer
 * This utility handles WebSocket connections to the server
 */

let socket: WebSocket | null = null;
let isConnecting = false;
let reconnectTimer: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 3000;

type MessageListener = (event: MessageEvent) => void;
type ConnectionListener = () => void;
type ErrorListener = (event: Event) => void;

const messageListeners: MessageListener[] = [];
const connectListeners: ConnectionListener[] = [];
const disconnectListeners: ConnectionListener[] = [];
const errorListeners: ErrorListener[] = [];

/**
 * Initialize WebSocket connection
 * @param userInfo Optional user information to include in the connection
 */
export function initWebSocket(userInfo?: { 
  userId?: string, 
  userName?: string, 
  avatar?: string 
}): WebSocket | null {
  // WebSocket.OPEN is 1, WebSocket.CONNECTING is 0
  if (socket && (socket.readyState === 1 || socket.readyState === 0)) {
    return socket;
  }

  if (isConnecting) {
    return null;
  }

  try {
    isConnecting = true;
    
    // Determine protocol based on page protocol (http or https)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    // Build URL with user info as query parameters if provided
    // In development, we default to localhost:3000 if we can't connect to the current host
    let host = window.location.host;
    
    // Development fallback for Replit preview
    if (host.includes('replit.dev') || host.includes('replit.app')) {
      console.log('Using development fallback for WebSocket connection');
      host = `${window.location.hostname}:3000`;
    }
    
    let wsUrl = `${protocol}//${host}/ws`;
    
    if (userInfo) {
      const params = new URLSearchParams();
      if (userInfo.userId) params.append('userId', userInfo.userId);
      if (userInfo.userName) params.append('userName', userInfo.userName);
      if (userInfo.avatar) params.append('avatar', userInfo.avatar);
      
      if (params.toString()) {
        wsUrl += `?${params.toString()}`;
      }
    }
    
    // Create WebSocket
    socket = new WebSocket(wsUrl);
    
    // Setup event handlers
    socket.onopen = handleOpen;
    socket.onmessage = handleMessage;
    socket.onclose = handleClose;
    socket.onerror = handleError;
    
    return socket;
  } catch (error) {
    console.error('WebSocket initialization error:', error);
    isConnecting = false;
    return null;
  }
}

/**
 * Close WebSocket connection
 */
export function closeWebSocket(): void {
  if (socket && socket.readyState === 1) { // WebSocket.OPEN is 1
    socket.close();
  }
  
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

/**
 * Send message through WebSocket
 */
export function sendMessage(message: string | object): boolean {
  if (!socket || socket.readyState !== 1) { // WebSocket.OPEN is 1
    console.error('WebSocket not connected');
    return false;
  }
  
  try {
    const data = typeof message === 'string' ? message : JSON.stringify(message);
    socket.send(data);
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
}

/**
 * Add message listener
 */
export function addMessageListener(listener: MessageListener): void {
  messageListeners.push(listener);
}

/**
 * Remove message listener
 */
export function removeMessageListener(listener: MessageListener): void {
  const index = messageListeners.indexOf(listener);
  if (index !== -1) {
    messageListeners.splice(index, 1);
  }
}

/**
 * Add connect listener
 */
export function addConnectListener(listener: ConnectionListener): void {
  connectListeners.push(listener);
}

/**
 * Remove connect listener
 */
export function removeConnectListener(listener: ConnectionListener): void {
  const index = connectListeners.indexOf(listener);
  if (index !== -1) {
    connectListeners.splice(index, 1);
  }
}

/**
 * Add disconnect listener
 */
export function addDisconnectListener(listener: ConnectionListener): void {
  disconnectListeners.push(listener);
}

/**
 * Remove disconnect listener
 */
export function removeDisconnectListener(listener: ConnectionListener): void {
  const index = disconnectListeners.indexOf(listener);
  if (index !== -1) {
    disconnectListeners.splice(index, 1);
  }
}

/**
 * Add error listener
 */
export function addErrorListener(listener: ErrorListener): void {
  errorListeners.push(listener);
}

/**
 * Remove error listener
 */
export function removeErrorListener(listener: ErrorListener): void {
  const index = errorListeners.indexOf(listener);
  if (index !== -1) {
    errorListeners.splice(index, 1);
  }
}

/**
 * Handle WebSocket open event
 */
function handleOpen(): void {
  console.log('WebSocket connection established');
  isConnecting = false;
  reconnectAttempts = 0;
  
  // Notify all connect listeners
  connectListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('Error in connect listener:', error);
    }
  });
}

/**
 * Handle WebSocket message event
 */
function handleMessage(event: MessageEvent): void {
  // Notify all message listeners
  messageListeners.forEach(listener => {
    try {
      listener(event);
    } catch (error) {
      console.error('Error in message listener:', error);
    }
  });
}

/**
 * Handle WebSocket close event
 */
function handleClose(): void {
  console.log('WebSocket connection closed');
  socket = null;
  isConnecting = false;
  
  // Notify all disconnect listeners
  disconnectListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('Error in disconnect listener:', error);
    }
  });
  
  // Attempt to reconnect
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
    
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    
    reconnectTimer = setTimeout(() => {
      initWebSocket();
    }, reconnectDelay);
  } else {
    console.error('Maximum reconnect attempts reached');
  }
}

/**
 * Handle WebSocket error event
 */
function handleError(event: Event): void {
  console.error('WebSocket error:', event);
  
  // Notify all error listeners
  errorListeners.forEach(listener => {
    try {
      listener(event);
    } catch (error) {
      console.error('Error in error listener:', error);
    }
  });
}

// Auto-initialize when the module is loaded
setTimeout(() => {
  initWebSocket();
}, 1000);

export default {
  initWebSocket,
  closeWebSocket,
  sendMessage,
  addMessageListener,
  removeMessageListener,
  addConnectListener,
  removeConnectListener,
  addDisconnectListener,
  removeDisconnectListener,
  addErrorListener,
  removeErrorListener
};