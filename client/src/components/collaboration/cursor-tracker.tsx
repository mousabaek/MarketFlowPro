import { useEffect, useState, useCallback } from 'react';
import { useWebSocketContext } from '../../hooks/use-websocket-context';
import { motion, AnimatePresence } from 'framer-motion';

type CursorPosition = {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
  lastUpdated: number;
};

export default function CursorTracker() {
  const { isConnected, lastMessage, sendCollaborationEvent, collaborators, userInfo } = useWebSocketContext();
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
  const userId = userInfo.userId;
  const userName = userInfo.userName || 'Guest';
  
  // Generate a random color for each user
  const generateColor = (userId: string) => {
    // Simple hash function for consistent colors per user
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };
  
  // Track mouse movement and send updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle to send updates at most every 50ms
      const now = Date.now();
      const lastSent = (window as any)._lastCursorUpdate || 0;
      
      if (now - lastSent > 50) {
        (window as any)._lastCursorUpdate = now;
        
        // Send cursor position using collaboration event
        sendCollaborationEvent('cursor_update', 'move', JSON.stringify({
          userId: userId,
          userName: userName,
          position: {
            x: e.clientX,
            y: e.clientY,
            timestamp: now
          }
        }));
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isConnected, sendCollaborationEvent, userId, userName]);
  
  // Process incoming cursor updates
  useEffect(() => {
    if (!lastMessage) return;
    
    try {
      // Look for cursor_update event type
      if (lastMessage.type === 'event' && lastMessage.event?.type === 'cursor_update') {
        // Parse the target which contains cursor position data
        const cursorData = JSON.parse(lastMessage.event?.target || '{}');
        const { userId: remoteUserId, userName, position } = cursorData;
        
        // Ignore our own cursor
        if (remoteUserId === userId) return;
        
        setCursors(prev => ({
          ...prev,
          [remoteUserId]: {
            userId: remoteUserId,
            userName: userName || collaborators.find(c => c.userId === remoteUserId)?.userName || 'Unknown',
            x: position.x,
            y: position.y,
            color: prev[remoteUserId]?.color || generateColor(remoteUserId),
            lastUpdated: Date.now()
          }
        }));
      }
    } catch (err) {
      console.error('Error processing cursor message:', err);
    }
  }, [lastMessage, userId, collaborators]);
  
  // Clean up stale cursors (inactive for more than 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const updated = {...prev};
        let hasChanges = false;
        
        Object.keys(updated).forEach(userId => {
          if (now - updated[userId].lastUpdated > 5000) {
            delete updated[userId];
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Render all active cursors
  return (
    <AnimatePresence>
      {Object.values(cursors).map(cursor => (
        <motion.div
          key={cursor.userId}
          className="fixed pointer-events-none z-50"
          initial={{ x: cursor.x, y: cursor.y, opacity: 0 }}
          animate={{ 
            x: cursor.x, 
            y: cursor.y,
            opacity: 1 
          }}
          exit={{ opacity: 0 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 120,
            mass: 0.5
          }}
        >
          <div 
            className="relative"
            style={{ color: cursor.color }}
          >
            {/* Custom cursor */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4L20 20" />
              <path d="M4 20L20 4" />
            </svg>
            
            {/* User name tag */}
            <div 
              className="absolute left-5 top-0 px-2 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.userName}
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}