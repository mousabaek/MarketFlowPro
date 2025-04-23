import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebSocketClient from '@/lib/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  connectionStats: {
    messagesReceived: number;
    messagesSent: number;
    lastConnectedAt: string | null;
    reconnectAttempts: number;
  };
  connectionError: Error | null;
  sendMessage: (message: string | object) => boolean;
  reconnect: () => void;
}

const defaultContextValue: WebSocketContextType = {
  isConnected: false,
  lastMessage: null,
  connectionStats: {
    messagesReceived: 0,
    messagesSent: 0,
    lastConnectedAt: null,
    reconnectAttempts: 0
  },
  connectionError: null,
  sendMessage: () => false,
  reconnect: () => {}
};

export const WebSocketContext = createContext<WebSocketContextType>(defaultContextValue);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [connectionStats, setConnectionStats] = useState<{
    messagesReceived: number;
    messagesSent: number;
    lastConnectedAt: string | null;
    reconnectAttempts: number;
  }>({
    messagesReceived: 0,
    messagesSent: 0,
    lastConnectedAt: null,
    reconnectAttempts: 0,
  });

  // Handle WebSocket connection events
  const handleOpen = () => {
    setIsConnected(true);
    setConnectionError(null);
    setConnectionStats(prev => ({
      ...prev,
      lastConnectedAt: new Date().toISOString(),
      reconnectAttempts: 0
    }));
  };

  // Handle WebSocket message events
  const handleMessage = (event: MessageEvent) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      setLastMessage(data);
      
      setConnectionStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1
      }));
    } catch (e) {
      // Handle non-JSON messages
      setLastMessage(event.data);
      
      setConnectionStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1
      }));
    }
  };

  // Handle WebSocket close events
  const handleClose = () => {
    setIsConnected(false);
    setConnectionStats(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1
    }));
  };

  // Handle WebSocket error events
  const handleError = (event: Event) => {
    setConnectionError(new Error('WebSocket connection error'));
  };

  // Initialize WebSocket connection on component mount
  useEffect(() => {
    WebSocketClient.addConnectListener(handleOpen);
    WebSocketClient.addMessageListener(handleMessage);
    WebSocketClient.addDisconnectListener(handleClose);
    WebSocketClient.addErrorListener(handleError);
    
    // Initialize connection if needed
    if (!isConnected) {
      WebSocketClient.initWebSocket();
    }
    
    // Cleanup on unmount
    return () => {
      WebSocketClient.removeConnectListener(handleOpen);
      WebSocketClient.removeMessageListener(handleMessage);
      WebSocketClient.removeDisconnectListener(handleClose);
      WebSocketClient.removeErrorListener(handleError);
    };
  }, []);

  // Send message through WebSocket
  const sendMessage = (message: string | object): boolean => {
    const result = WebSocketClient.sendMessage(message);
    
    if (result) {
      setConnectionStats(prev => ({
        ...prev,
        messagesSent: prev.messagesSent + 1
      }));
    }
    
    return result;
  };

  // Reconnect WebSocket
  const reconnect = () => {
    WebSocketClient.closeWebSocket();
    setTimeout(() => {
      WebSocketClient.initWebSocket();
    }, 500);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        lastMessage,
        connectionStats,
        connectionError,
        sendMessage,
        reconnect
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  
  return context;
};