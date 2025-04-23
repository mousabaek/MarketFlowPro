import { useState } from 'react';
import { useWebSocketContext, CollaboratorInfo } from '../../hooks/use-websocket-context';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Users, Clock } from 'lucide-react';

export default function PresenceIndicator() {
  const { isConnected, collaborators } = useWebSocketContext();

  // Format time difference as a human-readable string
  const formatTimeSince = (timestamp: string) => {
    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diffMs = now.getTime() - date.getTime();
      
      // Under a minute
      if (diffMs < 60000) {
        return 'just now';
      }
      
      // Under an hour
      if (diffMs < 3600000) {
        const minutes = Math.floor(diffMs / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      
      // Under a day
      if (diffMs < 86400000) {
        const hours = Math.floor(diffMs / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }
      
      // Fallback to date format
      return date.toLocaleTimeString();
    } catch (e) {
      return 'unknown time';
    }
  };
  
  // Generate avatar fallback text from username
  const getAvatarFallback = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  // If not connected, don't show the component
  if (!isConnected) {
    return null;
  }
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-1.5">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {collaborators.length === 0 
            ? 'No active users' 
            : `${collaborators.length} active user${collaborators.length > 1 ? 's' : ''}`}
        </span>
      </div>
      
      <div className="flex flex-wrap -space-x-2">
        {collaborators.map((person) => (
          <HoverCard key={person.userId} openDelay={300} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div className="inline-block cursor-pointer">
                <Avatar className="h-8 w-8 border-2 border-background hover:ring-2 ring-primary transition-all duration-200">
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback className="text-xs">
                    {getAvatarFallback(person.userName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-60" align="start">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback>
                      {getAvatarFallback(person.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-medium">{person.userName}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Joined {formatTimeSince(person.joinedAt)}</span>
                  </div>
                  {person.lastActive && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Last active {formatTimeSince(person.lastActive)}</span>
                    </div>
                  )}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
        
        {collaborators.length === 0 && (
          <div className="flex h-8 w-auto items-center justify-center rounded-full bg-muted px-3 text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            No one else is here
          </div>
        )}
      </div>
    </div>
  );
}