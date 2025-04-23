import { useEffect, useState } from 'react';
import { useWebSocketContext } from '../../hooks/use-websocket-context';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Activity,
  User,
  Edit,
  MessageSquare,
  FileSymlink,
  UserPlus,
  UploadCloud,
  Download,
  Clock,
  RefreshCw
} from 'lucide-react';

type CollaborationEvent = {
  id: string;
  type: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  action?: string;
  target?: string;
  details?: string;
};

export default function ActivityFeed() {
  const { lastMessage } = useWebSocketContext();
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  // Process incoming events
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      if (lastMessage.type === 'collaboration_event') {
        const event = lastMessage.event as CollaborationEvent;
        
        // Add to events list (limit to most recent 50)
        setEvents(prev => {
          // Check if we already have this event
          if (prev.some(e => e.id === event.id)) {
            return prev;
          }
          
          // Add new event at the beginning of the array
          const updated = [event, ...prev];
          
          // Limit to 50 events to avoid performance issues
          return updated.slice(0, 50);
        });
      }
    } catch (err) {
      console.error('Error processing activity message:', err);
    }
  }, [lastMessage]);

  // Toggle event details
  const toggleDetails = (id: string) => {
    setExpandedDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get icon based on event type
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'edit':
        return <Edit className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'join':
        return <UserPlus className="h-4 w-4" />;
      case 'leave':
        return <User className="h-4 w-4" />;
      case 'upload':
        return <UploadCloud className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'link':
        return <FileSymlink className="h-4 w-4" />;
      case 'presence':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Format timestamp to local time
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '00:00';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between bg-muted/30">
        <h3 className="font-medium text-sm flex items-center gap-1.5">
          <Activity className="h-4 w-4" />
          Collaboration Activity
        </h3>
        <div className="bg-primary/10 text-primary text-xs py-1 px-2 rounded-full flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Live
        </div>
      </div>
      
      <ScrollArea className="h-[300px]">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
            <Activity className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Activities will appear here as collaborators take actions</p>
          </div>
        ) : (
          <ul className="divide-y">
            {events.map(event => (
              <li 
                key={event.id} 
                className="p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex gap-2">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {getEventIcon(event.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium truncate">{event.user.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.action}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    
                    {event.target && (
                      <div className="mt-1 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-sm">
                        {event.target}
                      </div>
                    )}
                    
                    {event.details && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleDetails(event.id)}
                          className="text-xs text-primary hover:underline focus:outline-none"
                        >
                          {expandedDetails[event.id] ? 'Hide details' : 'Show details'}
                        </button>
                        
                        {expandedDetails[event.id] && (
                          <pre className="mt-1 text-xs bg-muted p-2 rounded-sm overflow-auto max-h-20">
                            {event.details}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}