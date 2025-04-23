import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WifiOff, Wifi, AlertCircle, CheckCircle2 } from "lucide-react";
import { useWebSocket } from '@/hooks/use-websocket';

/**
 * WebSocket Status Indicator
 * Shows the current state of the WebSocket connection
 */
export default function WebSocketStatus() {
  const { isConnected, error } = useWebSocket();
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
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
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <div className="font-medium">WebSocket Status</div>
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
              <div className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-950 p-1.5 rounded-sm mt-1">
                {errorMessage || "An error occurred with the WebSocket connection"}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {isConnected 
                ? "Real-time collaboration features are available." 
                : "Reconnecting automatically... Real-time features are currently unavailable."}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}