import { WebSocketProvider as WSProvider, WebSocketContext, UserInfo } from '../hooks/use-websocket-context';
import WebSocketStatus from './websocket-status';

interface WebSocketProviderProps {
  children: React.ReactNode;
  initialUserInfo?: UserInfo;
}

export function WebSocketProvider({ children, initialUserInfo }: WebSocketProviderProps) {
  return (
    <WSProvider initialUserInfo={initialUserInfo}>
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