import { useState, useEffect } from 'react';
import { useWebSocketContext, CollaborationEvent } from '../../hooks/use-websocket-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function JoinNotification() {
  const [notifications, setNotifications] = useState<CollaborationEvent[]>([]);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const { events } = useWebSocketContext();
  
  // Watch for join events
  useEffect(() => {
    // Only look at the most recent event
    if (events.length > 0) {
      const latestEvent = events[0];
      if (latestEvent.type === 'join') {
        // Add this join event to our notifications
        setNotifications(prev => {
          // Check if we already have this notification
          if (prev.some(n => n.id === latestEvent.id)) {
            return prev;
          }
          return [latestEvent, ...prev].slice(0, 5); // Keep last 5
        });
        
        // Mark it as visible
        setVisible(prev => ({
          ...prev,
          [latestEvent.id]: true
        }));
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setVisible(prev => ({
            ...prev,
            [latestEvent.id]: false
          }));
        }, 5000);
      }
    }
  }, [events]);
  
  // Dismiss a notification
  const dismissNotification = (id: string) => {
    setVisible(prev => ({
      ...prev,
      [id]: false
    }));
  };
  
  // Format time
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {notifications.map((notification) => (
          visible[notification.id] && (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-xs border border-primary/10"
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 rounded-full p-1.5">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium">New Collaborator</p>
                </div>
                <button 
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mt-2 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={notification.user.avatar} />
                  <AvatarFallback>
                    {notification.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{notification.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined at {formatTime(notification.timestamp)}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </div>
  );
}