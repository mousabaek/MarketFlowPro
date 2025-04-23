import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebSocketClient from '../lib/websocket';

export interface CollaboratorInfo {
  userId: string;
  userName: string;
  avatar?: string;
  joinedAt: string;
  lastActive?: string;
}

export interface CollaborationEvent {
  id: string;
  type: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  action?: string;
  target?: string;
  details?: string;
}

export interface UserInfo {
  userId: string;
  userName: string;
  avatar?: string;
}

export interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  collaborators: CollaboratorInfo[];
  events: CollaborationEvent[];
  userInfo: UserInfo;
  connectionStats: {
    messagesReceived: number;
    messagesSent: number;
    lastConnectedAt: string | null;
    reconnectAttempts: number;
  };
  connectionError: Error | null;
  sendMessage: (message: string | object) => boolean;
  sendCollaborationEvent: (type: string, action: string, target?: string, details?: string) => boolean;
  sendJoinEvent: () => boolean;
  sendLeaveEvent: () => boolean;
  setUserInfo: (userInfo: UserInfo) => void;
  reconnect: () => void;
}

const defaultContextValue: WebSocketContextType = {
  isConnected: false,
  lastMessage: null,
  collaborators: [],
  events: [],
  userInfo: { userId: '', userName: '' },
  connectionStats: {
    messagesReceived: 0,
    messagesSent: 0,
    lastConnectedAt: null,
    reconnectAttempts: 0
  },
  connectionError: null,
  sendMessage: () => false,
  sendCollaborationEvent: () => false,
  sendJoinEvent: () => false,
  sendLeaveEvent: () => false,
  setUserInfo: () => {},
  reconnect: () => {}
};

export const WebSocketContext = createContext<WebSocketContextType>(defaultContextValue);

interface WebSocketProviderProps {
  children: React.ReactNode;
  initialUserInfo?: UserInfo;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children,
  initialUserInfo = { userId: '', userName: '' }
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo);
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
      
      // Process different types of messages
      if (data && data.type) {
        switch (data.type) {
          case 'collaborators':
            // Update collaborators list
            if (Array.isArray(data.collaborators)) {
              setCollaborators(data.collaborators);
            }
            break;
          
          case 'collaborator_joined':
            // Add new collaborator to list
            if (data.collaborator) {
              setCollaborators(prev => {
                // Check if already exists
                const exists = prev.some(c => c.userId === data.collaborator.userId);
                if (exists) return prev;
                return [...prev, data.collaborator];
              });
              
              // Add join event
              if (data.event) {
                setEvents(prev => [data.event, ...prev].slice(0, 50)); // Limit to 50 events
              }
            }
            break;
          
          case 'collaborator_left':
            // Remove collaborator from list
            if (data.userId) {
              setCollaborators(prev => prev.filter(c => c.userId !== data.userId));
              
              // Add leave event
              if (data.event) {
                setEvents(prev => [data.event, ...prev].slice(0, 50)); // Limit to 50 events
              }
            }
            break;
          
          case 'activity':
          case 'cursor_update':
          case 'message':
          case 'presence':
            // Add event to events list
            if (data.event) {
              setEvents(prev => [data.event, ...prev].slice(0, 50)); // Limit to 50 events
            }
            break;
            
          default:
            console.log('Unhandled message type:', data.type);
        }
      }
      
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

  // Send collaboration event
  const sendCollaborationEvent = (type: string, action: string, target?: string, details?: string): boolean => {
    const message = {
      type: type,
      action: action,
      target: target || '',
      details: details || '',
      timestamp: new Date().toISOString()
    };
    
    return sendMessage(message);
  };

  // Send join event
  const sendJoinEvent = (): boolean => {
    const message = {
      type: 'join',
      user: {
        id: userInfo.userId,
        name: userInfo.userName,
        avatar: userInfo.avatar
      },
      timestamp: new Date().toISOString()
    };
    
    return sendMessage(message);
  };

  // Send leave event
  const sendLeaveEvent = (): boolean => {
    const message = {
      type: 'leave',
      user: {
        id: userInfo.userId,
        name: userInfo.userName,
        avatar: userInfo.avatar
      },
      timestamp: new Date().toISOString()
    };
    
    return sendMessage(message);
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
        collaborators,
        events,
        userInfo,
        connectionStats,
        connectionError,
        sendMessage,
        sendCollaborationEvent,
        sendJoinEvent,
        sendLeaveEvent,
        setUserInfo,
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