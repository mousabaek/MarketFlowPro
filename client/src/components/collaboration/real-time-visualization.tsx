import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, Users, Zap } from 'lucide-react';

interface CollaborationEvent {
  id: string;
  type: 'join' | 'leave' | 'action' | 'update';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  action?: string;
  target?: string;
  details?: string;
  position?: { x: number; y: number };
}

interface CollaboratorPosition {
  userId: string;
  userName: string;
  avatar?: string;
  position: { x: number; y: number };
  lastSeen: string;
}

export function RealTimeCollaboration() {
  const [collaborationEvents, setCollaborationEvents] = useState<CollaborationEvent[]>([]);
  const [activeCollaborators, setActiveCollaborators] = useState<CollaboratorPosition[]>([]);
  const visualizationRef = useRef<HTMLDivElement>(null);
  
  // Connect to WebSocket
  const { isConnected, lastMessage } = useWebSocket({
    onMessage: (data) => {
      // Handle different types of collaboration messages
      if (data && typeof data === 'object') {
        if (data.type === 'collaboration_event') {
          handleCollaborationEvent(data.event);
        } else if (data.type === 'cursor_update') {
          handleCursorUpdate(data);
        }
      }
    }
  });
  
  // Process collaboration events
  const handleCollaborationEvent = (event: CollaborationEvent) => {
    // Add event to the list
    setCollaborationEvents(prev => [event, ...prev].slice(0, 50));
    
    // Update active collaborators based on the event
    if (event.type === 'join') {
      setActiveCollaborators(prev => {
        // Don't add duplicate
        if (prev.some(c => c.userId === event.user.id)) {
          return prev;
        }
        
        return [...prev, {
          userId: event.user.id,
          userName: event.user.name,
          avatar: event.user.avatar,
          position: { x: 0, y: 0 },
          lastSeen: event.timestamp
        }];
      });
    } else if (event.type === 'leave') {
      setActiveCollaborators(prev => 
        prev.filter(c => c.userId !== event.user.id)
      );
    }
  };
  
  // Handle cursor position updates
  const handleCursorUpdate = (data: any) => {
    if (data.userId && data.position) {
      setActiveCollaborators(prev => {
        const existing = prev.findIndex(c => c.userId === data.userId);
        
        if (existing >= 0) {
          // Update existing collaborator
          const updated = [...prev];
          updated[existing] = {
            ...updated[existing],
            position: data.position,
            lastSeen: new Date().toISOString()
          };
          return updated;
        }
        
        // If we don't have this user (shouldn't happen, but just in case)
        return prev;
      });
    }
  };
  
  // Get event badge color
  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'join': return 'bg-green-100 text-green-800 border-green-200';
      case 'leave': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'action': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'update': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Clean up inactive collaborators (inactive for more than 5 minutes)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      setActiveCollaborators(prev => 
        prev.filter(c => new Date(c.lastSeen) > fiveMinutesAgo)
      );
    }, 60000); // Check every minute
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Real-Time Collaboration</CardTitle>
            <CardDescription>
              See team activities as they happen
            </CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
            {isConnected ? (
              <>
                <Zap className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active collaborators */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Users className="h-4 w-4" /> Active Collaborators
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeCollaborators.length > 0 ? (
              activeCollaborators.map((collaborator) => (
                <div 
                  key={collaborator.userId}
                  className="flex items-center gap-2 p-1.5 px-2.5 bg-muted rounded-full"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback className="text-xs">
                      {collaborator.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{collaborator.userName}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active collaborators</p>
            )}
          </div>
        </div>
        
        {/* Visualization area */}
        <div 
          ref={visualizationRef} 
          className="relative h-[150px] bg-muted/30 rounded-md border overflow-hidden mb-4"
        >
          {activeCollaborators.map((collaborator) => (
            <div
              key={collaborator.userId}
              className="absolute pointer-events-none"
              style={{
                left: `${collaborator.position.x}%`,
                top: `${collaborator.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex flex-col items-center">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={collaborator.avatar} />
                  <AvatarFallback>
                    {collaborator.userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="mt-1 text-xs bg-background px-1.5 py-0.5 rounded-sm">
                  {collaborator.userName}
                </span>
              </div>
            </div>
          ))}
          
          {activeCollaborators.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Collaborators will appear here</p>
            </div>
          )}
        </div>
        
        {/* Activity feed */}
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Activity className="h-4 w-4" /> Recent Activities
          </h3>
          <ScrollArea className="h-[200px] rounded-md border">
            {collaborationEvents.length > 0 ? (
              <div className="space-y-3 p-4">
                {collaborationEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Avatar className="h-6 w-6 mt-0.5">
                      <AvatarImage src={event.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {event.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{event.user.name}</p>
                        <Badge 
                          variant="outline" 
                          className={getEventBadgeColor(event.type)}
                        >
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {event.action} {event.target && <span className="font-medium">{event.target}</span>}
                        {event.details && `: ${event.details}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTime(event.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-4">
                <p className="text-muted-foreground text-sm">No recent activities</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default RealTimeCollaboration;