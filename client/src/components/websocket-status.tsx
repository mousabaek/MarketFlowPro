import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Wifi, WifiOff, ArrowUp, ArrowDown, RefreshCw, Radio, Megaphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

/**
 * WebSocket Status Component
 * Shows connection status and allows sending test messages
 */
export function WebSocketStatus() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<string[]>([]);
  const { isConnected, lastMessage, error, sendMessage, connect, disconnect } = useWebSocket({
    onOpen: () => {
      toast({
        title: 'WebSocket Connected',
        description: 'Successfully connected to the WebSocket server',
      });
    },
    onClose: () => {
      toast({
        title: 'WebSocket Disconnected',
        description: 'Connection to the WebSocket server was closed',
        variant: 'destructive',
      });
    },
    onError: () => {
      toast({
        title: 'WebSocket Error',
        description: 'An error occurred with the WebSocket connection',
        variant: 'destructive',
      });
    },
    onMessage: (data) => {
      // Process received message
      console.log('WebSocket message received:', data);
    },
  });

  // Update messages when new message is received
  useEffect(() => {
    if (lastMessage) {
      const messageText = typeof lastMessage === 'string' 
        ? lastMessage 
        : JSON.stringify(lastMessage);
      
      setMessages(prev => [messageText, ...prev].slice(0, 5));
    }
  }, [lastMessage]);

  // Send a test message
  const sendTestMessage = () => {
    const testMessage = {
      type: 'ping',
      timestamp: new Date().toISOString(),
      data: {
        test: 'Hello from Wolf Auto Marketer'
      }
    };

    if (sendMessage(testMessage)) {
      toast({
        title: 'Message Sent',
        description: 'Test message was sent successfully',
      });
    } else {
      toast({
        title: 'Send Failed',
        description: 'Failed to send test message',
        variant: 'destructive',
      });
    }
  };

  // State for broadcast message
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  // State for direct message
  const [directMessage, setDirectMessage] = useState('');
  const directMessageRef = useRef<HTMLInputElement>(null);
  
  // Send a broadcast message via REST API
  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast({
        title: 'Broadcast Failed',
        description: 'Please enter a message to broadcast',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsBroadcasting(true);
      const response = await fetch('/api/websocket-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: broadcastMessage }),
        credentials: 'include'
      });
      
      const result = await response.json();
      setBroadcastResult(`Broadcast sent to ${result.clientCount} clients`);
      toast({
        title: 'Broadcast Sent',
        description: `Message broadcast to ${result.clientCount} connected clients`,
      });
      
      // Clear the input
      setBroadcastMessage('');
    } catch (error) {
      toast({
        title: 'Broadcast Failed',
        description: 'Failed to send broadcast message',
        variant: 'destructive',
      });
      setBroadcastResult('Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };
  
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-5 w-5 text-green-500" />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Connected
              </Badge>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-red-500" />
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Disconnected
              </Badge>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          {isConnected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
              className="flex gap-1 items-center"
            >
              <ArrowDown className="h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={connect}
              className="flex gap-1 items-center"
            >
              <ArrowUp className="h-4 w-4" />
              Connect
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="messages" className="p-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="direct">Direct Send</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-4">
          {messages.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Received Messages:</h3>
              <div className="bg-muted p-2 rounded-md text-xs font-mono max-h-48 overflow-y-auto">
                {messages.map((msg, idx) => (
                  <div key={idx} className="py-1 border-b border-border/30 last:border-0">
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No messages received yet</p>
              <p className="text-xs mt-1">Connect to the WebSocket server and wait for messages</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="direct" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="direct-message">Direct Message</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="direct-message"
                  value={directMessage}
                  onChange={(e) => setDirectMessage(e.target.value)}
                  placeholder="Enter a message to send directly"
                  ref={directMessageRef}
                  disabled={!isConnected}
                />
                <Button
                  onClick={() => {
                    if (directMessage.trim()) {
                      sendMessage({
                        type: 'direct',
                        message: directMessage,
                        timestamp: new Date().toISOString()
                      });
                      setDirectMessage('');
                      directMessageRef.current?.focus();
                    }
                  }}
                  disabled={!isConnected || !directMessage.trim()}
                >
                  Send
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Sends a message directly to the server through the WebSocket connection
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={sendTestMessage}
                disabled={!isConnected}
                className="flex gap-1 items-center"
              >
                <RefreshCw className="h-4 w-4" />
                Send Test Ping
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="broadcast" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="broadcast-message">Broadcast Message</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="broadcast-message"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter a message to broadcast to all clients"
                />
                <Button 
                  onClick={sendBroadcast}
                  disabled={isBroadcasting || !broadcastMessage.trim()}
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Broadcast
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Broadcasts a message to all connected clients via the REST API
              </p>
            </div>
            
            {broadcastResult && (
              <div className="p-2 bg-muted rounded-md text-sm">
                {broadcastResult}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="p-3 mx-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
          <p className="font-medium">WebSocket Error:</p>
          <p>{error.toString()}</p>
        </div>
      )}
    </Card>
  );
}

export default WebSocketStatus;