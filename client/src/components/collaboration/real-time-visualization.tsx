import { useState, useEffect, useRef } from 'react';
import { useWebSocketContext } from '../../hooks/use-websocket-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Activity, Users, Zap, AlertTriangle, Edit, User, 
  Settings, Save, RefreshCw, Eye, EyeOff 
} from 'lucide-react';

interface CollaborationEvent {
  id: string;
  type: 'join' | 'leave' | 'action' | 'update' | 'message';
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
  const [userId, setUserId] = useState<string>(`user-${Math.floor(Math.random() * 1000)}`);
  const [userName, setUserName] = useState<string>('You');
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const throttleRef = useRef<number>(0);
  
  // Connect to WebSocket using context
  const { isConnected, lastMessage, sendMessage } = useWebSocketContext();
  
  // Process incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      // Check if the message is a collaboration event or cursor update
      const data = lastMessage as any;
      if (data.type === 'collaboration_event') {
        handleCollaborationEvent(data.event);
      } else if (data.type === 'cursor_update') {
        handleCursorUpdate(data);
      } else if (data.type === 'join' || data.type === 'leave' || data.type === 'action' || data.type === 'update') {
        // Direct event handling for simpler message formats
        handleCollaborationEvent(data);
      }
    } catch (err) {
      console.error("Error processing WebSocket message:", err);
    }
  }, [lastMessage]);
  
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
      case 'message': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
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
  
  // Simulation mode data
  const simulatedUsers = [
    { id: 'sim-1', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 'sim-2', name: 'Mike Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 'sim-3', name: 'Emily Rodriguez', avatar: '' },
    { id: 'sim-4', name: 'Alex Kim', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' }
  ];
  
  // Handle simulation mode
  useEffect(() => {
    if (!simulationMode) {
      // If turning off simulation, clear any simulated data
      setActiveCollaborators(prev => prev.filter(c => !c.userId.startsWith('sim-')));
      setCollaborationEvents(prev => prev.filter(e => !e.user.id.startsWith('sim-')));
      return;
    }
    
    // Add simulated users when simulation mode is turned on
    const timestamp = new Date().toISOString();
    
    // Add users
    simulatedUsers.forEach(user => {
      // Create join event
      const joinEvent: CollaborationEvent = {
        id: `sim-event-${Math.random().toString(36).substring(2, 9)}`,
        type: 'join',
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        timestamp,
        action: 'joined the collaboration'
      };
      
      // Add event
      setCollaborationEvents(prev => [joinEvent, ...prev]);
      
      // Add to active collaborators
      setActiveCollaborators(prev => {
        if (prev.some(c => c.userId === user.id)) return prev;
        return [...prev, {
          userId: user.id,
          userName: user.name,
          avatar: user.avatar,
          position: { 
            x: 10 + Math.random() * 80, // Random position
            y: 10 + Math.random() * 80
          },
          lastSeen: timestamp
        }];
      });
    });
    
    // Create simulated movements and activities
    const simulationInterval = setInterval(() => {
      if (!simulationMode) return;
      
      // Randomly choose a user to perform an action
      const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
      const currentTime = new Date().toISOString();
      const actionTypes = ['action', 'update', 'action', 'message'];
      const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      
      // Move users around
      setActiveCollaborators(prev => {
        return prev.map(c => {
          if (c.userId.startsWith('sim-')) {
            return {
              ...c,
              position: {
                // Small random movement
                x: Math.max(5, Math.min(95, c.position.x + (Math.random() - 0.5) * 10)),
                y: Math.max(5, Math.min(95, c.position.y + (Math.random() - 0.5) * 10))
              },
              lastSeen: currentTime
            };
          }
          return c;
        });
      });
      
      // Random chance to add an event
      if (Math.random() > 0.7) {
        let event: CollaborationEvent;
        
        if (actionType === 'action') {
          const actions = ['updated', 'created', 'modified', 'reviewed'];
          const targets = ['Amazon product listing', 'Etsy workflow', 'ClickBank campaign', 'marketing strategy'];
          
          event = {
            id: `sim-event-${Math.random().toString(36).substring(2, 9)}`,
            type: 'action',
            user: {
              id: randomUser.id,
              name: randomUser.name,
              avatar: randomUser.avatar
            },
            timestamp: currentTime,
            action: actions[Math.floor(Math.random() * actions.length)],
            target: targets[Math.floor(Math.random() * targets.length)]
          };
        } else if (actionType === 'message') {
          const messages = [
            'Has anyone reviewed the new ClickBank products?',
            'I updated the Amazon pricing strategy.',
            'Just found a great opportunity on Etsy!',
            'The conversion rates are improving on our latest campaign.'
          ];
          
          event = {
            id: `sim-event-${Math.random().toString(36).substring(2, 9)}`,
            type: 'message',
            user: {
              id: randomUser.id,
              name: randomUser.name,
              avatar: randomUser.avatar
            },
            timestamp: currentTime,
            details: messages[Math.floor(Math.random() * messages.length)]
          };
        } else {
          event = {
            id: `sim-event-${Math.random().toString(36).substring(2, 9)}`,
            type: 'update',
            user: {
              id: randomUser.id,
              name: randomUser.name,
              avatar: randomUser.avatar
            },
            timestamp: currentTime,
            action: 'updated their status'
          };
        }
        
        setCollaborationEvents(prev => [event, ...prev]);
      }
    }, 3000);
    
    return () => clearInterval(simulationInterval);
  }, [simulationMode]);
  
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
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> Real-Time Visualization
            </h3>
            {!isConnected && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Connection required for cursor tracking</span>
              </div>
            )}
          </div>
          
          <div 
            ref={visualizationRef} 
            className="relative h-[180px] bg-muted/30 rounded-md border overflow-hidden mb-4"
            onMouseMove={(e) => {
              if (!visualizationRef.current || !isConnected) return;
              
              // Get cursor position as percentage of container
              const rect = visualizationRef.current.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              
              // Send position update (user ID would typically be from authentication)
              sendMessage({
                type: 'cursor_update',
                userId: userId, 
                userName: userName, // This would come from authentication in a real app
                position: { x, y }
              });
            }}
          >
            {/* Grid lines for better spatial reference */}
            <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
              <div className="border-r border-dashed border-muted-foreground/10"></div>
              <div className="border-r border-dashed border-muted-foreground/10"></div>
              <div className="border-r border-dashed border-muted-foreground/10"></div>
            </div>
            <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
              <div className="border-b border-dashed border-muted-foreground/10"></div>
              <div className="border-b border-dashed border-muted-foreground/10"></div>
              <div className="border-b border-dashed border-muted-foreground/10"></div>
            </div>
            
            {/* Collaborator avatars */}
            {activeCollaborators.map((collaborator) => (
              <div
                key={collaborator.userId}
                className="absolute pointer-events-none"
                style={{
                  left: `${collaborator.position.x}%`,
                  top: `${collaborator.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'left 0.2s ease-out, top 0.2s ease-out' // Smooth movement
                }}
              >
                <div className="flex flex-col items-center">
                  <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback>
                      {collaborator.userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="mt-1 text-xs bg-background px-1.5 py-0.5 rounded-sm shadow-sm">
                    {collaborator.userName}
                  </span>
                </div>
              </div>
            ))}
            
            {activeCollaborators.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <p className="text-muted-foreground text-sm">Move your cursor in this area</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isConnected 
                    ? 'Your cursor and other collaborators will appear here' 
                    : 'Connect to the WebSocket to enable cursor tracking'}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* User identification and controls */}
        <div className="rounded-md border bg-card p-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
            <User className="h-4 w-4" /> Identity & Controls
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-id" className="text-xs">
                  User ID
                </Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="user-id"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Enter user ID"
                    disabled={!isConnected}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => setUserId(`user-${Math.floor(Math.random() * 1000)}`)}
                    disabled={!isConnected}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-name" className="text-xs">
                  Display Name
                </Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="user-name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Enter display name"
                    disabled={!isConnected}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => sendMessage({
                      type: 'join',
                      id: `event-${Math.random().toString(36).substring(2, 9)}`,
                      user: {
                        id: userId,
                        name: userName
                      },
                      timestamp: new Date().toISOString(),
                      action: 'joined the collaboration'
                    })}
                    disabled={!isConnected || !userName.trim()}
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="simulation-mode"
                  checked={simulationMode}
                  onCheckedChange={setSimulationMode}
                  disabled={!isConnected}
                />
                <Label htmlFor="simulation-mode" className="text-sm cursor-pointer">
                  Simulation Mode
                </Label>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Send a leave event for the current user
                  if (isConnected) {
                    sendMessage({
                      type: 'leave',
                      id: `event-${Math.random().toString(36).substring(2, 9)}`,
                      user: {
                        id: userId,
                        name: userName
                      },
                      timestamp: new Date().toISOString(),
                      action: 'left the collaboration'
                    });
                  }
                  
                  // Reset events and collaborators
                  setCollaborationEvents([]);
                  setActiveCollaborators([]);
                }}
                className="text-xs h-8"
              >
                Clear All Events
              </Button>
            </div>
          </div>
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