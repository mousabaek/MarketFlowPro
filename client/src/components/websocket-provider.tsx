import { WebSocketProvider as WSProvider, WebSocketContext } from '../hooks/use-websocket-context';
import WebSocketStatus from './websocket-status';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  return (
    <WSProvider>
      <>
        {children}
        <WebSocketStatus />
      </>
    </WSProvider>
  );
}

// Also export the context directly for components to use
export { WebSocketContext } from '../hooks/use-websocket-context';
export { useWebSocketContext } from '../hooks/use-websocket-context';