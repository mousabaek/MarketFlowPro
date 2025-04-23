import { useState, useEffect, useCallback } from 'react';
import * as WebSocketClient from '@/lib/websocket';

interface WebSocketOptions {
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
  userInfo?: {
    userId?: string;
    userName?: string;
    avatar?: string;
  };
}

/**
 * React hook for managing WebSocket connections
 * Provides state and methods for interacting with WebSockets
 */
export function useWebSocket(options: WebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<string | object | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStats, setConnectionStats] = useState<{
    messagesReceived: number;
    messagesSent: number;
    lastConnectedAt: string | null;
    reconnectAttempts: number;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  }>({
    messagesReceived: 0,
    messagesSent: 0,
    lastConnectedAt: null,
    reconnectAttempts: 0,
    connectionStatus: 'disconnected',
  });

  // Handle WebSocket open event
  const handleOpen = useCallback(() => {
    setIsConnected(true);
    setError(null);
    
    // Update connection statistics
    setConnectionStats(prev => ({
      ...prev,
      lastConnectedAt: new Date().toISOString(),
      connectionStatus: 'connected',
      reconnectAttempts: 0
    }));
    
    if (options.onOpen) {
      options.onOpen();
    }
  }, [options]);

  // Handle WebSocket message event
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      // Try to parse JSON message
      const data = JSON.parse(event.data);
      setLastMessage(data);
      
      // Update message count
      setConnectionStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1,
      }));
      
      if (options.onMessage) {
        options.onMessage(data);
      }
    } catch (e) {
      // Handle plain text message
      setLastMessage(event.data);
      
      // Update message count
      setConnectionStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1,
      }));
      
      if (options.onMessage) {
        options.onMessage(event.data);
      }
    }
  }, [options]);

  // Handle WebSocket close event
  const handleClose = useCallback(() => {
    setIsConnected(false);
    
    // Update connection statistics
    setConnectionStats(prev => ({
      ...prev,
      connectionStatus: 'disconnected',
    }));
    
    if (options.onClose) {
      options.onClose();
    }
  }, [options]);

  // Handle WebSocket error event
  const handleError = useCallback((event: Event) => {
    const err = new Error('WebSocket connection error');
    setError(err);
    
    // Update connection statistics
    setConnectionStats(prev => ({
      ...prev,
      connectionStatus: 'error',
    }));
    
    if (options.onError) {
      options.onError(err);
    }
  }, [options]);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    // Add event listeners
    WebSocketClient.addConnectListener(handleOpen);
    WebSocketClient.addMessageListener(handleMessage);
    WebSocketClient.addDisconnectListener(handleClose);
    WebSocketClient.addErrorListener(handleError);
    
    // Initialize connection
    WebSocketClient.initWebSocket(options.userInfo);
  }, [handleOpen, handleMessage, handleClose, handleError, options.userInfo]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    // Remove event listeners
    WebSocketClient.removeConnectListener(handleOpen);
    WebSocketClient.removeMessageListener(handleMessage);
    WebSocketClient.removeDisconnectListener(handleClose);
    WebSocketClient.removeErrorListener(handleError);
    
    // Close connection
    WebSocketClient.closeWebSocket();
    
    setIsConnected(false);
  }, [handleOpen, handleMessage, handleClose, handleError]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: string | object): boolean => {
    const result = WebSocketClient.sendMessage(message);
    
    // If message was sent successfully, update the counter
    if (result) {
      setConnectionStats(prev => ({
        ...prev,
        messagesSent: prev.messagesSent + 1,
      }));
    }
    
    return result;
  }, []);

  // Setup WebSocket connection and listeners
  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [options.autoConnect, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    connectionStats
  };
}