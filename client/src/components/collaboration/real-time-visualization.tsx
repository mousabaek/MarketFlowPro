import { useState, useEffect, useRef } from 'react';
import { useWebSocketContext, CollaboratorInfo } from '../../hooks/use-websocket-context';
import { motion } from 'framer-motion';

interface CursorPosition {
  userId: string;
  userName: string;
  avatar?: string;
  x: number;
  y: number;
  lastUpdated: string;
}

export function RealTimeCollaboration() {
  const { collaborators, events, isConnected, userInfo, sendCollaborationEvent } = useWebSocketContext();
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Process cursor update events
  useEffect(() => {
    // Filter only cursor update events
    const cursorEvents = events.filter(event => event.type === 'cursor_update');
    
    if (cursorEvents.length > 0) {
      // Get the latest cursor update for each user
      const latestCursors = cursorEvents.reduce((acc, event) => {
        const userId = event.user.id;
        
        // Skip our own cursor
        if (userId === userInfo.userId) return acc;
        
        // Check if this is a newer update than what we have
        const existing = acc[userId];
        if (!existing || new Date(event.timestamp) > new Date(existing.lastUpdated)) {
          const details = event.details ? JSON.parse(event.details) : null;
          if (details && typeof details.x === 'number' && typeof details.y === 'number') {
            acc[userId] = {
              userId,
              userName: event.user.name,
              avatar: event.user.avatar,
              x: details.x,
              y: details.y,
              lastUpdated: event.timestamp
            };
          }
        }
        
        return acc;
      }, {} as Record<string, CursorPosition>);
      
      // Update cursors state
      setCursors(prev => ({
        ...prev,
        ...latestCursors
      }));
    }
  }, [events, userInfo.userId]);
  
  // Track mouse movement in container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isConnected) return;
    
    // Get container bounds
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to container (0-100%)
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Throttle cursor updates to avoid overwhelming the connection
    const throttled = throttleMouseMove(() => {
      // Send cursor position to server
      sendCollaborationEvent(
        'cursor_update',
        'move',
        'canvas',
        JSON.stringify({ x, y })
      );
    });
    
    throttled();
  };
  
  // Simple throttle function for mouse movements
  const throttleMouseMove = (callback: () => void, delay = 100) => {
    let lastCall = 0;
    
    return () => {
      const now = Date.now();
      if (now - lastCall < delay) return;
      
      lastCall = now;
      callback();
    };
  };
  
  // Clean old cursors that haven't been updated in a while
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors(prev => {
        const now = Date.now();
        const filtered = Object.entries(prev).reduce((acc, [userId, cursor]) => {
          // Remove cursors older than 10 seconds
          if (now - new Date(cursor.lastUpdated).getTime() < 10000) {
            acc[userId] = cursor;
          }
          return acc;
        }, {} as Record<string, CursorPosition>);
        
        return filtered;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] border border-border rounded-md bg-muted/30 cursor-crosshair"
      onMouseMove={handleMouseMove}
    >
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <p className="text-muted-foreground">
            Connect to the WebSocket to see real-time collaboration
          </p>
        </div>
      )}
      
      {/* Remote cursors */}
      {Object.entries(cursors).map(([userId, cursor]) => (
        <motion.div
          key={userId}
          className="absolute pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            x: `${cursor.x}%`,
            y: `${cursor.y}%`
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{ 
            left: 0,
            top: 0,
            transform: `translate(${cursor.x}%, ${cursor.y}%)` 
          }}
        >
          {/* Cursor icon */}
          <div className="relative">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path 
                d="M5 3L19 12L12 13L9 20L5 3Z" 
                fill="currentColor" 
                stroke="white" 
                strokeWidth="1" 
              />
            </svg>
            
            {/* User label */}
            <div className="absolute left-4 top-0 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded whitespace-nowrap">
              {cursor.userName}
            </div>
          </div>
        </motion.div>
      ))}
      
      {collaborators.length === 0 && isConnected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-xs p-4">
            <p className="text-muted-foreground text-sm">
              No collaborators are currently connected. Invite others to join or open this page in another browser window.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}