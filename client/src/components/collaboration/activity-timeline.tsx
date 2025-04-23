import { useState, useEffect } from 'react';
import { useWebSocketContext, CollaborationEvent } from '../../hooks/use-websocket-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { 
  MousePointer, MessageSquare, UserPlus, UserMinus, 
  Edit, PanelTop, Activity, Layers, Zap
} from 'lucide-react';

interface TimelineItem {
  id: string;
  eventType: string;
  action?: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  details?: string;
}

export function ActivityTimeline() {
  const { events, isConnected } = useWebSocketContext();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  
  // Process events into timeline items
  useEffect(() => {
    if (events.length === 0) return;
    
    // Convert events to timeline items
    const items = events.map<TimelineItem>(event => ({
      id: event.id,
      eventType: event.type,
      action: event.action,
      timestamp: event.timestamp,
      user: event.user,
      details: event.details
    }));
    
    // Sort by timestamp, newest first
    items.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Take most recent 50 items
    setTimelineItems(items.slice(0, 50));
  }, [events]);
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };
  
  // Get relative time (e.g. "2 minutes ago")
  const getRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      // Convert to seconds
      const diffSecs = Math.floor(diffMs / 1000);
      
      if (diffSecs < 60) {
        return 'just now';
      }
      
      // Convert to minutes
      const diffMins = Math.floor(diffSecs / 60);
      
      if (diffMins < 60) {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      }
      
      // Convert to hours
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      }
      
      // If older than a day, show the date
      return date.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };
  
  // Get icon for event type
  const getEventIcon = (eventType: string, action?: string) => {
    switch (eventType) {
      case 'cursor_update':
        return <MousePointer className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'join':
        return <UserPlus className="h-4 w-4" />;
      case 'leave':
        return <UserMinus className="h-4 w-4" />;
      case 'whiteboard':
        return action === 'clear' 
          ? <Layers className="h-4 w-4" /> 
          : <Edit className="h-4 w-4" />;
      case 'presence':
        return <PanelTop className="h-4 w-4" />;
      case 'activity':
        return <Activity className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };
  
  // Get badge variant based on event type
  const getBadgeVariant = (eventType: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (eventType) {
      case 'join':
        return 'default';
      case 'leave':
        return 'destructive';
      case 'message':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  // Get event description
  const getEventDescription = (item: TimelineItem): string => {
    switch (item.eventType) {
      case 'cursor_update':
        return `moved their cursor`;
      case 'message':
        return `sent a message: "${item.details?.substring(0, 30)}${item.details && item.details.length > 30 ? '...' : ''}"`;
      case 'join':
        return `joined the collaboration`;
      case 'leave':
        return `left the collaboration`;
      case 'whiteboard':
        if (item.action === 'stroke') return 'drew on the whiteboard';
        if (item.action === 'text') return 'added text to the whiteboard';
        if (item.action === 'clear') return 'cleared the whiteboard';
        return 'updated the whiteboard';
      case 'presence':
        return `updated their status`;
      case 'activity':
        return item.action || 'performed an action';
      default:
        return `performed a ${item.eventType} action`;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Activity className="h-4 w-4" /> Activity Timeline
        </h3>
        <Badge variant="outline" className="gap-1.5 text-xs">
          {timelineItems.length} Events
        </Badge>
      </div>
      
      <ScrollArea className="h-[500px] rounded-md border p-4">
        {timelineItems.length > 0 ? (
          <div className="space-y-8">
            {timelineItems.map((item) => (
              <div key={item.id} className="relative">
                {/* Timeline line */}
                <div className="absolute left-3.5 top-5 h-full w-px bg-border" 
                  style={{ height: 'calc(100% + 1rem)' }}></div>
                
                <div className="flex gap-3">
                  {/* Event icon */}
                  <div className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border bg-background`}>
                    {getEventIcon(item.eventType, item.action)}
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={item.user.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {item.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{item.user.name}</p>
                        <p className="text-sm text-muted-foreground">{getEventDescription(item)}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getBadgeVariant(item.eventType)} className="text-[11px]">
                          {item.eventType}
                        </Badge>
                        <time className="text-xs text-muted-foreground" title={formatTime(item.timestamp)}>
                          {getRelativeTime(item.timestamp)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isConnected ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No activity yet. Start collaborating to see events here.</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Connect to see collaboration activity.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}