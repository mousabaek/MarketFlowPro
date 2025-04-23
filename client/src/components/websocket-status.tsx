import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertCircle, 
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2, 
  Clock, 
  Wifi, 
  WifiOff 
} from "lucide-react";
import { useWebSocketContext } from '@/components/websocket-provider';
import { Separator } from '@/components/ui/separator';

// Helper function to get a user-friendly connection status label
function getConnectionStatusLabel(status: string | undefined | null): string {
  if (!status) return 'Unknown';
  
  switch (status) {
    case 'connected':
      return 'Active';
    case 'connecting':
      return 'Connecting';
    case 'reconnecting':
      return 'Reconnecting';
    case 'disconnected':
      return 'Disconnected';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
}

/**
 * WebSocket Status Indicator
 * Shows the current state of the WebSocket connection
 */
export default function WebSocketStatus() {
  const { isConnected, error, connectionStats = {
    messagesReceived: 0,
    messagesSent: 0,
    lastConnectedAt: null,
    reconnectAttempts: 0,
    connectionStatus: 'disconnected',
  }} = useWebSocketContext();
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastConnected, setLastConnected] = useState<string | null>(null);
  
  // Format the ISO timestamp to a readable format
  useEffect(() => {
    if (connectionStats?.lastConnectedAt) {
      try {
        const date = new Date(connectionStats.lastConnectedAt);
        setLastConnected(date.toLocaleTimeString());
      } catch (e) {
        setLastConnected(connectionStats.lastConnectedAt);
      }
    }
  }, [connectionStats?.lastConnectedAt]);
  
  // Track error state
  useEffect(() => {
    if (error) {
      setHasError(true);
      setErrorMessage(error.message);
      
      // Clear error after 5 seconds
      const timer = setTimeout(() => {
        setHasError(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5">
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className="h-6 px-2 cursor-help transition-all"
            >
              {isConnected ? (
                <Wifi className="h-3.5 w-3.5 mr-1" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 mr-1" />
              )}
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            
            {hasError && (
              <Badge 
                variant="outline" 
                className="h-6 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 cursor-help"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Error
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-0">
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">WebSocket Status</div>
              <Badge 
                variant={isConnected ? "outline" : "destructive"} 
                className="h-5 text-[10px]"
              >
                {getConnectionStatusLabel(connectionStats?.connectionStatus || 'disconnected')}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs">
              {isConnected ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              )}
              {isConnected 
                ? "Connected to real-time collaboration server" 
                : "Disconnected from real-time collaboration server"}
            </div>
            
            {hasError && (
              <div className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-950 p-1.5 rounded-sm">
                {errorMessage || "An error occurred with the WebSocket connection"}
              </div>
            )}
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-[11px]">
                <ArrowDownToLine className="h-3 w-3 text-blue-500" />
                <span className="text-muted-foreground">Messages received:</span>
                <span className="ml-auto font-medium">{connectionStats?.messagesReceived || 0}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[11px]">
                <ArrowUpFromLine className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">Messages sent:</span>
                <span className="ml-auto font-medium">{connectionStats?.messagesSent || 0}</span>
              </div>
              
              {lastConnected && (
                <div className="flex items-center gap-1.5 text-[11px] col-span-2">
                  <Clock className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">Last connected:</span>
                  <span className="ml-auto font-mono text-[10px]">{lastConnected}</span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted/30 p-1.5 rounded-sm">
              {isConnected 
                ? "Wolf Auto Marketer collaboration features are fully active and available." 
                : "Reconnecting automatically... Real-time features are currently unavailable."}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}