import { useEffect, useState } from 'react';
import { useWebSocketContext } from '../hooks/use-websocket-context';
import CursorTracker from './collaboration/cursor-tracker';
import ActivityFeed from './collaboration/activity-feed';
import PresenceIndicator from './collaboration/presence-indicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Users, MessageSquare, Activity, RefreshCw } from 'lucide-react';

export default function CollaborationSpace() {
  const { isConnected, sendMessage, connectionStats } = useWebSocketContext();
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Generate a random user ID and name on first load
  useEffect(() => {
    if (!userId) {
      const randomId = `user-${Math.random().toString(36).substring(2, 15)}`;
      const randomName = `User ${randomId.substring(5, 8)}`;
      
      setUserId(randomId);
      setUsername(randomName);
      
      // Store the user ID globally for cursor tracking to ignore own cursor
      (window as any)._currentUserId = randomId;
    }
  }, [userId]);
  
  // Join the collaboration space when connection is established
  useEffect(() => {
    if (isConnected && userId && username) {
      sendMessage({
        type: 'join',
        user: {
          id: userId,
          name: username
        }
      });
      
      // Send presence update every minute to indicate user is still active
      const interval = setInterval(() => {
        sendMessage({
          type: 'presence',
          user: {
            id: userId,
            name: username
          },
          timestamp: new Date().toISOString()
        });
      }, 60000);
      
      // Leave the space when unmounting
      return () => {
        clearInterval(interval);
        
        if (isConnected) {
          sendMessage({
            type: 'leave',
            user: {
              id: userId,
              name: username
            }
          });
        }
      };
    }
  }, [isConnected, userId, username, sendMessage]);
  
  // Send chat message
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessage({
      type: 'message',
      user: {
        id: userId,
        name: username
      },
      message: message
    });
    
    setMessage('');
  };
  
  // Toggle the expanded/collapsed state
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <>
      {/* Real-time cursor tracking */}
      <CursorTracker />
      
      {/* Collaboration panel */}
      <div className={`fixed bottom-4 right-4 w-80 z-40 transition-all duration-300 ${isCollapsed ? 'h-12' : 'h-[400px]'}`}>
        <Card className="h-full flex flex-col shadow-lg border-primary/20">
          <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 border-b cursor-pointer" onClick={toggleCollapsed}>
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Collaboration Space
              {isConnected && <div className="ml-2 h-1.5 w-1.5 rounded-full bg-green-500"></div>}
            </CardTitle>
            
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {isCollapsed ? (
                <MessageSquare className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          
          {!isCollapsed && (
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium">Your Profile</h4>
                  <Badge variant="outline" className="text-xs">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your display name"
                    className="h-8 text-sm"
                  />
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-xs">
                    {username.slice(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 p-3 overflow-y-auto">
                  <ActivityFeed />
                </div>
                
                <div className="p-3 border-t bg-muted/20">
                  <PresenceIndicator />
                  
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Send a message..."
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="h-8 px-2"
                      onClick={handleSendMessage}
                      disabled={!isConnected || !message.trim()}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}