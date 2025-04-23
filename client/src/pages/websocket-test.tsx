import WebSocketTester from '../components/websocket-tester';
import WebSocketStatus from '../components/websocket-status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Info, Server } from 'lucide-react';
import { useWebSocketContext } from '../hooks/use-websocket-context';

export default function WebSocketTestPage() {
  const { isConnected } = useWebSocketContext();
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WebSocket Testing</h1>
          <p className="text-muted-foreground">
            Test and debug WebSocket functionality
          </p>
        </div>
        <Badge
          variant={isConnected ? "default" : "destructive"}
          className="text-xs px-2 py-1 gap-1"
        >
          <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-background' : 'bg-background'}`}></div>
          {isConnected ? "WebSocket Connected" : "WebSocket Disconnected"}
        </Badge>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>WebSocket Connection Info</CardTitle>
              <CardDescription>
                Details about the current WebSocket connection
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                Connection Status
              </h3>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isConnected 
                    ? 'Successfully connected to the WebSocket server' 
                    : 'No connection to the WebSocket server'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Info className="h-4 w-4" />
                WebSocket Information
              </h3>
              <div className="bg-muted p-3 rounded-md">
                <dl className="text-sm grid grid-cols-2 gap-1">
                  <dt className="font-medium">URL:</dt>
                  <dd>`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`</dd>
                  
                  <dt className="font-medium">Protocol:</dt>
                  <dd>{window.location.protocol === 'https:' ? 'WSS (Secure)' : 'WS'}</dd>
                  
                  <dt className="font-medium">Implementation:</dt>
                  <dd>Custom React Context</dd>
                </dl>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <WebSocketTester />
      
      {/* The WebSocketStatus component will only appear if there's a connection error */}
      <WebSocketStatus />
    </div>
  );
}