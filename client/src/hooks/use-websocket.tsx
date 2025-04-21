import { useState, useEffect, useCallback, useRef } from 'react';
import * as WebSocketClient from '@/lib/websocket';

interface WebSocketHookOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (data: any) => void;
  onError?: (event: Event) => void;
  autoConnect?: boolean;
}

/**
 * Custom React hook for WebSocket communication
 */
export function useWebSocket(options: WebSocketHookOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | object | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const onOpenRef = useRef(options.onOpen);
  const onCloseRef = useRef(options.onClose);
  const onMessageRef = useRef(options.onMessage);
  const onErrorRef = useRef(options.onError);
  
  // Update refs when options change
  useEffect(() => {
    onOpenRef.current = options.onOpen;
    onCloseRef.current = options.onClose;
    onMessageRef.current = options.onMessage;
    onErrorRef.current = options.onError;
  }, [options.onOpen, options.onClose, options.onMessage, options.onError]);
  
  // Handle connect event
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setError(null);
    if (onOpenRef.current) {
      onOpenRef.current();
    }
  }, []);
  
  // Handle disconnect event
  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    if (onCloseRef.current) {
      onCloseRef.current();
    }
  }, []);
  
  // Handle message event
  const handleMessage = useCallback((event: MessageEvent) => {
    let parsedData: any;
    
    try {
      // Try to parse as JSON
      parsedData = JSON.parse(event.data);
    } catch (e) {
      // If not JSON, use raw data
      parsedData = event.data;
    }
    
    setLastMessage(parsedData);
    
    if (onMessageRef.current) {
      onMessageRef.current(parsedData);
    }
  }, []);
  
  // Handle error event
  const handleError = useCallback((event: Event) => {
    const err = new Error('WebSocket error');
    setError(err);
    
    if (onErrorRef.current) {
      onErrorRef.current(event);
    }
  }, []);
  
  // Set up WebSocket listeners
  useEffect(() => {
    WebSocketClient.addConnectListener(handleConnect);
    WebSocketClient.addDisconnectListener(handleDisconnect);
    WebSocketClient.addMessageListener(handleMessage);
    WebSocketClient.addErrorListener(handleError);
    
    // If autoConnect is true or undefined (default to true)
    if (options.autoConnect !== false) {
      WebSocketClient.initWebSocket();
    }
    
    return () => {
      WebSocketClient.removeConnectListener(handleConnect);
      WebSocketClient.removeDisconnectListener(handleDisconnect);
      WebSocketClient.removeMessageListener(handleMessage);
      WebSocketClient.removeErrorListener(handleError);
    };
  }, [handleConnect, handleDisconnect, handleMessage, handleError, options.autoConnect]);
  
  // Connect to WebSocket server
  const connect = useCallback(() => {
    WebSocketClient.initWebSocket();
  }, []);
  
  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    WebSocketClient.closeWebSocket();
  }, []);
  
  // Send message to WebSocket server
  const sendMessage = useCallback((message: string | object) => {
    return WebSocketClient.sendMessage(message);
  }, []);
  
  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage
  };
}

export default useWebSocket;