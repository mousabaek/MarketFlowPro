import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Types of tooltips available in the system
export type TooltipId = 
  | 'dashboard-welcome'
  | 'platform-connection'
  | 'create-workflow'
  | 'story-generator'
  | 'earnings-dashboard'
  | 'withdrawal-process'
  | 'platforms-integration';

interface ContextualTooltipProps {
  id: TooltipId;
  title: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  showOnce?: boolean;
}

/**
 * Contextual tooltip component that provides helpful hints to new users
 */
export const ContextualTooltip = ({
  id,
  title,
  children,
  position = 'bottom',
  width = '300px',
  showOnce = true,
}: ContextualTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  // Check if the tooltip has been seen before
  useEffect(() => {
    const checkTooltipSeen = () => {
      // Get the seen tooltips from localStorage
      const seenTooltips = JSON.parse(localStorage.getItem('seenTooltips') || '[]');
      
      // Check if this tooltip has been seen
      if (!seenTooltips.includes(id)) {
        setIsVisible(true);
        
        // If showOnce is true, mark as seen
        if (showOnce) {
          const updatedSeenTooltips = [...seenTooltips, id];
          localStorage.setItem('seenTooltips', JSON.stringify(updatedSeenTooltips));
        }
      }
    };
    
    // Wait a moment before showing tooltip (gives UI time to render)
    const timer = setTimeout(() => {
      checkTooltipSeen();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id, showOnce]);

  // Function to dismiss the tooltip
  const dismissTooltip = () => {
    setIsVisible(false);
  };

  // Function to reset all seen tooltips (for demo purposes)
  const resetAllTooltips = () => {
    localStorage.removeItem('seenTooltips');
    toast({
      title: "Tooltips Reset",
      description: "All tooltips will appear again on your next visit.",
    });
  };

  if (!isVisible) return null;

  // Position styles for different tooltip positions
  const positionStyles = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'bottom-[-6px] left-1/2 transform -translate-x-1/2 border-t-primary border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-[-6px] left-1/2 transform -translate-x-1/2 border-b-primary border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-[-6px] top-1/2 transform -translate-y-1/2 border-l-primary border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-[-6px] top-1/2 transform -translate-y-1/2 border-r-primary border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div 
      className="absolute z-50" 
      style={{ width }}
    >
      <div className={`absolute ${positionStyles[position]}`}>
        <div className="bg-primary text-white rounded-lg shadow-lg p-4 animate-fade-in-up">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold">{title}</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full text-white hover:bg-primary-foreground hover:text-primary" 
              onClick={dismissTooltip}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <div className="text-sm">{children}</div>
          
          <div className="mt-3 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs text-white hover:bg-primary-foreground hover:text-primary border-white"
              onClick={resetAllTooltips}
            >
              Reset All Tips
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="text-xs"
              onClick={dismissTooltip}
            >
              Got it
            </Button>
          </div>
        </div>
        {/* Tooltip arrow */}
        <div className={`absolute w-0 h-0 border-[6px] ${arrowStyles[position]}`}></div>
      </div>
    </div>
  );
};

// Utility function to reset all tooltips
export const resetAllTooltips = () => {
  localStorage.removeItem('seenTooltips');
};

// Utility function to check if a specific tooltip has been seen
export const hasSeenTooltip = (id: TooltipId): boolean => {
  const seenTooltips = JSON.parse(localStorage.getItem('seenTooltips') || '[]');
  return seenTooltips.includes(id);
};