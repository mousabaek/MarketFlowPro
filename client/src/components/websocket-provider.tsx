import { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';

// Context to hold WebSocket connection state and functions
interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: string | object) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// WebSocket provider component
interface WebSocketProviderProps {
  children: ReactNode;
  userId?: string;
  userName?: string;
  avatar?: string;
}

export function WebSocketProvider({
  children,
  userId,
  userName,
  avatar
}: WebSocketProviderProps) {
  // Use the WebSocket hook with auto-connect and user info
  const websocket = useWebSocket({
    autoConnect: true,
    userInfo: {
      userId,
      userName,
      avatar
    }
  });

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use the WebSocket context
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  
  return context;
}