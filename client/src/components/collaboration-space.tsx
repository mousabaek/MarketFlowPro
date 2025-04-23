import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, MessageSquare, Activity, RefreshCw } from "lucide-react";

interface CollaborationEvent {
  id: string;
  type: 'join' | 'leave' | 'action' | 'message' | 'presence' | 'activity';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  action?: string;
  target?: string;
  details?: string;
}

interface Collaborator {
  userId: string;
  userName: string;
  avatar?: string;
  joinedAt: string;
  isActive?: boolean;
  lastSeen?: string;
}

// Sample dummy data for simulation mode
const dummyCollaborators: Collaborator[] = [
  { 
    userId: 'user-1', 
    userName: 'Sarah Johnson', 
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    joinedAt: new Date(Date.now() - 3600000).toISOString(),
    isActive: true
  },
  { 
    userId: 'user-2', 
    userName: 'Mike Chen', 
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    joinedAt: new Date(Date.now() - 7200000).toISOString(),
    isActive: true
  },
  { 
    userId: 'user-3', 
    userName: 'Emily Rodriguez', 
    joinedAt: new Date(Date.now() - 1800000).toISOString(),
    isActive: false,
    lastSeen: new Date(Date.now() - 900000).toISOString()
  }
];

const dummyEvents: CollaborationEvent[] = [
  {
    id: 'event-1',
    type: 'join',
    user: { id: 'user-1', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'joined the collaboration'
  },
  {
    id: 'event-2',
    type: 'action',
    user: { id: 'user-1', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    timestamp: new Date(Date.now() - 3300000).toISOString(),
    action: 'updated',
    target: 'Amazon Associates workflow'
  },
  {
    id: 'event-3',
    type: 'join',
    user: { id: 'user-2', name: 'Mike Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    action: 'joined the collaboration'
  },
  {
    id: 'event-4',
    type: 'message',
    user: { id: 'user-2', name: 'Mike Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    details: 'I updated the Amazon pricing strategy. Could someone review it?'
  },
  {
    id: 'event-5',
    type: 'join',
    user: { id: 'user-3', name: 'Emily Rodriguez' },
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    action: 'joined the collaboration'
  },
  {
    id: 'event-6',
    type: 'action',
    user: { id: 'user-3', name: 'Emily Rodriguez' },
    timestamp: new Date(Date.now() - 2100000).toISOString(),
    action: 'created',
    target: 'ClickBank product promotion'
  },
  {
    id: 'event-7',
    type: 'message',
    user: { id: 'user-1', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    details: 'The new Etsy integration looks great! Nice work team.'
  },
  {
    id: 'event-8',
    type: 'action',
    user: { id: 'user-2', name: 'Mike Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    timestamp: new Date(Date.now() - 1500000).toISOString(),
    action: 'updated',
    target: 'Freelancer.com credentials'
  },
  {
    id: 'event-9',
    type: 'leave',
    user: { id: 'user-3', name: 'Emily Rodriguez' },
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    action: 'left the collaboration'
  },
  {
    id: 'event-10',
    type: 'activity',
    user: { id: 'user-1', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    timestamp: new Date(Date.now() - 900000).toISOString(),
    action: 'completed scan',
    target: 'opportunity matcher',
    details: 'Found 7 new opportunities matching your profile'
  }
];

export default function CollaborationSpace() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'users' | 'chat'>('activity');
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  
  // Use WebSocket hook
  const { isConnected, lastMessage, sendMessage } = useWebSocket({
    autoConnect: !simulationMode,
    onMessage: (data) => {
      if (data.type === 'welcome') {
        // Handle welcome message with list of active collaborators
        if (data.activeCollaborators) {
          setCollaborators(data.activeCollaborators);
        }
      } else if (['join', 'leave', 'action', 'message', 'presence', 'activity'].includes(data.type)) {
        // Handle collaboration events
        setEvents(prev => [...prev, data].slice(-100)); // Keep last 100 events
        
        // Update collaborators list based on events
        if (data.type === 'join') {
          setCollaborators(prev => {
            const existing = prev.findIndex(c => c.userId === data.user.id);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = {
                ...updated[existing],
                isActive: true,
                userName: data.user.name,
                avatar: data.user.avatar
              };
              return updated;
            } else {
              return [...prev, {
                userId: data.user.id,
                userName: data.user.name,
                avatar: data.user.avatar,
                joinedAt: data.timestamp,
                isActive: true
              }];
            }
          });
        } else if (data.type === 'leave') {
          setCollaborators(prev => {
            return prev.map(c => 
              c.userId === data.user.id 
                ? { ...c, isActive: false, lastSeen: data.timestamp } 
                : c
            );
          });
        }
      }
    }
  });
  
  // Scroll to bottom of events when new ones arrive
  useEffect(() => {
    if (eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);
  
  // Handle simulation mode
  useEffect(() => {
    if (simulationMode) {
      setCollaborators(dummyCollaborators);
      setEvents(dummyEvents);
    } else {
      // Reset if switching from simulation to real mode
      setCollaborators([]);
      setEvents([]);
    }
  }, [simulationMode]);
  
  // Function to send a message
  const sendChatMessage = (message: string) => {
    sendMessage({
      type: 'message',
      message
    });
  };
  
  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'activity' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setActiveTab('activity')}
            className="gap-1.5"
          >
            <Activity className="h-4 w-4" />
            Activity
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setActiveTab('users')}
            className="gap-1.5"
          >
            <Users className="h-4 w-4" />
            Users {collaborators.filter(c => c.isActive).length > 0 && 
              <Badge variant="secondary" className="ml-1 text-xs">
                {collaborators.filter(c => c.isActive).length}
              </Badge>
            }
          </Button>
          <Button 
            variant={activeTab === 'chat' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setActiveTab('chat')}
            className="gap-1.5"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch 
            id="simulation" 
            checked={simulationMode} 
            onCheckedChange={setSimulationMode}
          />
          <label htmlFor="simulation" className="text-xs text-muted-foreground cursor-pointer">
            Simulation Mode
          </label>
        </div>
      </div>
      
      {/* Activity Feed */}
      {activeTab === 'activity' && (
        <ScrollArea className="h-[300px] border rounded-md bg-background">
          <div className="p-4 space-y-3">
            {events.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Activity className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {simulationMode 
                    ? 'Switch simulation mode off to see real activity' 
                    : 'Activities will appear here as users interact with the platform'}
                </p>
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className="flex gap-3 text-sm">
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      {event.user.avatar && (
                        <AvatarImage src={event.user.avatar} alt={event.user.name} />
                      )}
                      <AvatarFallback>
                        {event.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{event.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                    
                    {/* Join/Leave event */}
                    {(event.type === 'join' || event.type === 'leave') && (
                      <p className="text-muted-foreground">{event.action}</p>
                    )}
                    
                    {/* Action event */}
                    {event.type === 'action' && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">{event.action}</span>
                        {event.target && <span> {event.target}</span>}
                      </p>
                    )}
                    
                    {/* Message event */}
                    {event.type === 'message' && (
                      <div className="bg-muted/40 rounded-md p-2">{event.details}</div>
                    )}
                    
                    {/* Activity event */}
                    {event.type === 'activity' && (
                      <div>
                        <p className="text-muted-foreground">
                          <span className="font-medium">{event.action}</span>
                          {event.target && <span> on {event.target}</span>}
                        </p>
                        {event.details && (
                          <p className="text-xs text-muted-foreground mt-1">{event.details}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={eventsEndRef} />
          </div>
        </ScrollArea>
      )}
      
      {/* Users List */}
      {activeTab === 'users' && (
        <ScrollArea className="h-[300px] border rounded-md bg-background">
          <div className="p-4 space-y-4">
            {collaborators.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Users className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No users connected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {simulationMode 
                    ? 'Switch simulation mode off to see real users' 
                    : 'Users will appear here as they connect to the platform'}
                </p>
              </div>
            ) : (
              <>
                {/* Active Users */}
                <div>
                  <h3 className="font-medium mb-2 text-sm">Active Now</h3>
                  <div className="space-y-3">
                    {collaborators.filter(c => c.isActive).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active users</p>
                    ) : (
                      collaborators.filter(c => c.isActive).map(user => (
                        <div key={user.userId} className="flex items-center gap-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="relative">
                                  <Avatar className="h-10 w-10">
                                    {user.avatar && <AvatarImage src={user.avatar} alt={user.userName} />}
                                    <AvatarFallback>
                                      {user.userName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">{user.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Online since {formatRelativeTime(user.joinedAt)}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div>
                            <p className="font-medium text-sm">{user.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              Active for {formatRelativeTime(user.joinedAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              
                {/* Inactive Users */}
                {collaborators.filter(c => !c.isActive).length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Recently Active</h3>
                    <div className="space-y-3">
                      {collaborators.filter(c => !c.isActive).map(user => (
                        <div key={user.userId} className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 opacity-70">
                            {user.avatar && <AvatarImage src={user.avatar} alt={user.userName} />}
                            <AvatarFallback>
                              {user.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-muted-foreground">{user.userName}</p>
                            {user.lastSeen && (
                              <p className="text-xs text-muted-foreground">
                                Last seen {formatRelativeTime(user.lastSeen)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      )}
      
      {/* Chat */}
      {activeTab === 'chat' && (
        <div className="h-[300px] border rounded-md bg-background flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {events.filter(e => e.type === 'message').length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {simulationMode 
                      ? 'Switch simulation mode off to see real messages' 
                      : 'Send a message to start the conversation'}
                  </p>
                </div>
              ) : (
                events
                  .filter(e => e.type === 'message')
                  .map(event => (
                    <div key={event.id} className="flex gap-3 text-sm">
                      <div className="flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          {event.user.avatar && (
                            <AvatarImage src={event.user.avatar} alt={event.user.name} />
                          )}
                          <AvatarFallback>
                            {event.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{event.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(event.timestamp)}
                          </span>
                        </div>
                        <div className="bg-muted/40 rounded-md p-2">{event.details}</div>
                      </div>
                    </div>
                  ))
              )}
              <div ref={eventsEndRef} />
            </div>
          </ScrollArea>
          
          <div className="border-t p-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              disabled={!isConnected || simulationMode}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  sendChatMessage(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button 
              size="sm" 
              disabled={!isConnected || simulationMode}
              onClick={() => {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (input && input.value.trim()) {
                  sendChatMessage(input.value.trim());
                  input.value = '';
                }
              }}
            >
              Send
            </Button>
          </div>
        </div>
      )}
      
      {!isConnected && !simulationMode && (
        <div className="text-center py-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Reconnecting...
          </Button>
        </div>
      )}
    </div>
  );
}