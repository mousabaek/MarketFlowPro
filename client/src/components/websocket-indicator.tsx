import { useWebSocketContext } from '../hooks/use-websocket-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function WebSocketIndicator() {
  const { isConnected, connectionStats, reconnect } = useWebSocketContext();
  const { reconnectAttempts, messagesReceived, messagesSent } = connectionStats;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={!isConnected ? reconnect : undefined}
            className="rounded-full h-3 w-3 flex items-center justify-center transition-colors relative"
            style={{ 
              backgroundColor: isConnected ? '#10b981' : '#ef4444',
              cursor: isConnected ? 'default' : 'pointer'
            }}
          >
            {!isConnected && reconnectAttempts > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <span className="sr-only">
              {isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-xs">
            <p className="font-medium">
              {isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
            </p>
            {isConnected ? (
              <p className="text-muted-foreground mt-1">
                Messages: {messagesReceived} received, {messagesSent} sent
              </p>
            ) : (
              <p className="text-muted-foreground mt-1">
                Reconnect attempts: {reconnectAttempts}
                <br />
                <span className="text-primary">Click to reconnect</span>
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}