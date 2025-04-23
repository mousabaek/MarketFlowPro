import { useEffect, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';

export interface CursorTrackerProps {
  userId: string;
  containerRef: React.RefObject<HTMLElement>;
  enabled?: boolean;
  throttleMs?: number;
}

/**
 * Cursor Tracker Component
 * Tracks the cursor position within a container and sends the data via WebSocket
 */
export function CursorTracker({
  userId,
  containerRef,
  enabled = true,
  throttleMs = 100
}: CursorTrackerProps) {
  const { sendMessage, isConnected } = useWebSocket();
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (!enabled || !isConnected || !containerRef.current) return;
    
    // Function to handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      // Get the container's bounding box
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate position as percentage of container dimensions
      const position = {
        x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
        y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
      };
      
      // Store the current position
      lastPositionRef.current = position;
      
      // Throttle sending updates
      const now = Date.now();
      if (now - lastSentTimeRef.current >= throttleMs) {
        sendMessage({
          type: 'cursor_update',
          userId,
          position
        });
        lastSentTimeRef.current = now;
      }
    };
    
    // Function to send position update (used by throttle)
    const sendPositionUpdate = () => {
      if (!lastPositionRef.current || !isConnected) return;
      
      sendMessage({
        type: 'cursor_update',
        userId,
        position: lastPositionRef.current
      });
      
      lastSentTimeRef.current = Date.now();
    };
    
    // Set up throttled updates for positions that happen between throttle intervals
    const throttleInterval = setInterval(() => {
      if (lastPositionRef.current && 
          Date.now() - lastSentTimeRef.current >= throttleMs) {
        sendPositionUpdate();
      }
    }, throttleMs);
    
    // Add event listener to container
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      clearInterval(throttleInterval);
    };
  }, [userId, containerRef, enabled, isConnected, sendMessage, throttleMs]);
  
  // This component doesn't render anything
  return null;
}

export default CursorTracker;