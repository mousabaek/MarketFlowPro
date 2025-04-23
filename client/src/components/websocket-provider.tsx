import { WebSocketProvider as WSProvider } from '@/hooks/use-websocket-context';
import { WebSocketStatus } from './websocket-status';

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