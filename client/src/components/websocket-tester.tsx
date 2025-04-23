import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useWebSocketContext } from '../hooks/use-websocket-context';
import { Clipboard, Send, Zap, Terminal } from 'lucide-react';

export default function WebSocketTester() {
  const { isConnected, lastMessage, connectionStats, sendMessage } = useWebSocketContext();
  const [testMessage, setTestMessage] = useState("Hello WebSocket Server!");
  const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
  
  // Track received messages
  useEffect(() => {
    if (lastMessage) {
      setReceivedMessages(prev => [lastMessage, ...prev].slice(0, 10));
    }
  }, [lastMessage]);
  
  // Function to send a test message
  const sendTestMessage = () => {
    if (isConnected) {
      sendMessage({
        type: 'test',
        message: testMessage,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  // Function to format JSON for display
  const formatJSON = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return String(obj);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">WebSocket Tester</CardTitle>
            <CardDescription>
              Test WebSocket connection and send messages
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input 
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              placeholder="Enter a test message"
            />
            <Button 
              onClick={sendTestMessage}
              disabled={!isConnected}
              className="gap-1.5"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
          
          <div className="bg-muted p-3 rounded-md text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-sm mb-2">
              <Terminal className="h-4 w-4" />
              <span>Connection Stats</span>
            </div>
            <div>Messages Received: {connectionStats.messagesReceived}</div>
            <div>Messages Sent: {connectionStats.messagesSent}</div>
            <div>Reconnect Attempts: {connectionStats.reconnectAttempts}</div>
            {connectionStats.lastConnectedAt && (
              <div>Connected At: {new Date(connectionStats.lastConnectedAt).toLocaleString()}</div>
            )}
          </div>
        </div>
        
        {receivedMessages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Received Messages
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {receivedMessages.map((msg, idx) => (
                <div key={idx} className="bg-muted p-2 rounded-md">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">Message {idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(formatJSON(msg));
                      }}
                    >
                      <Clipboard className="h-3 w-3" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                  <pre className="text-xs overflow-auto">{formatJSON(msg)}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}