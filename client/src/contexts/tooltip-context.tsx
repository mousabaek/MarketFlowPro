import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { XCircle } from 'lucide-react';

// Types for tooltip context
interface TooltipContextType {
  tooltipsEnabled: boolean;
  toggleTooltips: () => void;
  showTooltip: (id: string) => boolean;
  dismissTooltip: (id: string) => void;
  resetAllTooltips: () => void;
}

// Context for dismissed tooltips
const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

// Tooltip provider props
interface TooltipProviderProps {
  children: ReactNode;
}

// Tooltip tracking
const LOCAL_STORAGE_KEY = 'wolf-auto-marketer-tooltips';

// Tooltip provider component
export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  const [tooltipsEnabled, setTooltipsEnabled] = useState<boolean>(true);
  const [dismissedTooltips, setDismissedTooltips] = useState<string[]>([]);
  
  // Load dismissed tooltips from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setTooltipsEnabled(data.enabled !== false);
        setDismissedTooltips(data.dismissed || []);
      }
    } catch (error) {
      console.error('Error loading tooltip preferences:', error);
    }
  }, []);
  
  // Save dismissed tooltips to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        enabled: tooltipsEnabled,
        dismissed: dismissedTooltips
      }));
    } catch (error) {
      console.error('Error saving tooltip preferences:', error);
    }
  }, [tooltipsEnabled, dismissedTooltips]);
  
  // Toggle tooltips on/off
  const toggleTooltips = () => {
    setTooltipsEnabled(prev => !prev);
  };
  
  // Check if a tooltip should be shown
  const showTooltip = (id: string): boolean => {
    if (!tooltipsEnabled) return false;
    return !dismissedTooltips.includes(id);
  };
  
  // Dismiss a specific tooltip
  const dismissTooltip = (id: string) => {
    if (!dismissedTooltips.includes(id)) {
      setDismissedTooltips(prev => [...prev, id]);
    }
  };
  
  // Reset all dismissed tooltips
  const resetAllTooltips = () => {
    setDismissedTooltips([]);
  };
  
  return (
    <TooltipContext.Provider value={{
      tooltipsEnabled,
      toggleTooltips,
      showTooltip,
      dismissTooltip,
      resetAllTooltips
    }}>
      {children}
    </TooltipContext.Provider>
  );
};

// Hook for accessing tooltip context
export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
};

// Tooltip text components
export const TooltipHeading: React.FC<{ children: ReactNode }> = ({ children }) => (
  <h4 className="font-semibold text-sm mb-1">{children}</h4>
);

export const TooltipText: React.FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-xs text-muted-foreground mb-2">{children}</p>
);

export const TooltipList: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ul className="list-disc text-xs ml-4 mb-2">{children}</ul>
);

export const TooltipItem: React.FC<{ children: ReactNode }> = ({ children }) => (
  <li className="mb-1">{children}</li>
);

// Contextual tooltip component that can be dismissed
interface ContextualTooltipProps {
  id: string;
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  highlight?: boolean;
  dismissable?: boolean;
  delay?: number;
}

export const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  id,
  children,
  content,
  side = 'bottom',
  align = 'center',
  highlight = false,
  dismissable = true,
  delay = 0
}) => {
  const { showTooltip, dismissTooltip } = useTooltip();
  const [visible, setVisible] = useState<boolean>(false);
  
  // Check if tooltip should be visible after a delay
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setVisible(showTooltip(id));
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(showTooltip(id));
    }
  }, [id, showTooltip, delay]);
  
  // Handle tooltip dismissal
  const handleDismiss = () => {
    dismissTooltip(id);
    setVisible(false);
  };
  
  if (!visible) return <>{children}</>;
  
  return (
    <div className="relative">
      {children}
      
      <div
        className={`absolute z-50 bg-card border rounded-lg shadow-lg p-3 max-w-xs ${getPositionClasses(side, align)}`}
      >
        {dismissable && (
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <XCircle size={16} />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
        
        <div className={dismissable ? "pr-5" : ""}>
          {content}
        </div>
        
        {/* Triangle pointer */}
        <div className={`absolute w-2 h-2 bg-card transform rotate-45 border ${getPointerClasses(side, align)}`} />
      </div>
      
      {highlight && (
        <div
          className="absolute inset-0 rounded-lg ring-2 ring-primary ring-offset-2 pointer-events-none"
          style={{ zIndex: 40 }}
        />
      )}
    </div>
  );
};

// Helper functions for positioning tooltips
const getPositionClasses = (side: string, align: string): string => {
  switch (side) {
    case 'top':
      return 'bottom-full mb-2';
    case 'right':
      return 'left-full ml-2';
    case 'bottom':
      return 'top-full mt-2';
    case 'left':
      return 'right-full mr-2';
    default:
      return 'top-full mt-2';
  }
};

const getPointerClasses = (side: string, align: string): string => {
  switch (side) {
    case 'top':
      return 'bottom-[-5px] left-1/2 transform -translate-x-1/2 border-b border-r';
    case 'right':
      return 'left-[-5px] top-1/2 transform -translate-y-1/2 border-l border-t';
    case 'bottom':
      return 'top-[-5px] left-1/2 transform -translate-x-1/2 border-l border-t';
    case 'left':
      return 'right-[-5px] top-1/2 transform -translate-y-1/2 border-r border-b';
    default:
      return 'top-[-5px] left-1/2 transform -translate-x-1/2 border-l border-t';
  }
};