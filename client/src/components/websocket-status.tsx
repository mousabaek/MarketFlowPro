import { useEffect, useState, useContext } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WebSocketContext } from '../hooks/use-websocket-context';

export default function WebSocketStatus() {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    console.error('WebSocketStatus must be used within a WebSocketProvider');
    return null;
  }
  
  const { isConnected, connectionStats, connectionError, reconnect } = context;
  const { reconnectAttempts } = connectionStats;
  const [isVisible, setIsVisible] = useState(false);

  // Show status message only after delay if connection issues persist
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (!isConnected && (reconnectAttempts > 0 || connectionError)) {
      timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // Show after 5 seconds of connection issues
    } else {
      setIsVisible(false);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isConnected, reconnectAttempts, connectionError]);

  const handleReconnect = () => {
    reconnect();
  };

  if (!isVisible) return null;

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto max-w-sm z-50 shadow-lg">
      <AlertTitle className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500"></div>
        WebSocket Disconnected
      </AlertTitle>
      <AlertDescription className="text-xs mt-2">
        Real-time communication is currently unavailable. 
        Some features may be limited.
      </AlertDescription>
      <div className="mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReconnect}
          className="text-xs h-7 px-2"
        >
          Reconnect
        </Button>
      </div>
    </Alert>
  );
}