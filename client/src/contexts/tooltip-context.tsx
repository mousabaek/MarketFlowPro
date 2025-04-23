import React, { createContext, useState, useContext, useEffect } from 'react';
import { TooltipId } from '@/components/contextual-tooltip';
import { useToast } from '@/hooks/use-toast';

interface TooltipContextType {
  // Check if a tooltip has been seen before
  hasSeenTooltip: (id: TooltipId) => boolean;
  
  // Mark a tooltip as seen
  markTooltipAsSeen: (id: TooltipId) => void;
  
  // Reset all tooltips to be shown again
  resetAllTooltips: () => void;
  
  // Reset a specific tooltip
  resetTooltip: (id: TooltipId) => void;
  
  // Toggle user's preference for seeing tooltips
  tooltipsEnabled: boolean;
  toggleTooltips: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seenTooltips, setSeenTooltips] = useState<TooltipId[]>([]);
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
  const { toast } = useToast();
  
  // Load seen tooltips from localStorage on mount
  useEffect(() => {
    const loadedTooltips = localStorage.getItem('seenTooltips');
    if (loadedTooltips) {
      setSeenTooltips(JSON.parse(loadedTooltips));
    }
    
    const tooltipsEnabledSetting = localStorage.getItem('tooltipsEnabled');
    if (tooltipsEnabledSetting !== null) {
      setTooltipsEnabled(tooltipsEnabledSetting === 'true');
    }
  }, []);
  
  // Save seen tooltips to localStorage when they change
  useEffect(() => {
    localStorage.setItem('seenTooltips', JSON.stringify(seenTooltips));
  }, [seenTooltips]);
  
  // Save tooltips enabled setting to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tooltipsEnabled', tooltipsEnabled.toString());
  }, [tooltipsEnabled]);
  
  const hasSeenTooltip = (id: TooltipId): boolean => {
    return seenTooltips.includes(id) || !tooltipsEnabled;
  };
  
  const markTooltipAsSeen = (id: TooltipId) => {
    if (!seenTooltips.includes(id)) {
      setSeenTooltips(prev => [...prev, id]);
    }
  };
  
  const resetAllTooltips = () => {
    setSeenTooltips([]);
    toast({
      title: "Tooltips Reset",
      description: "All tooltips will appear again on your next visit.",
    });
  };
  
  const resetTooltip = (id: TooltipId) => {
    setSeenTooltips(prev => prev.filter(tooltipId => tooltipId !== id));
    toast({
      title: "Tooltip Reset",
      description: `The "${id}" tooltip will appear again on your next visit.`,
    });
  };
  
  const toggleTooltips = () => {
    setTooltipsEnabled(prev => !prev);
    toast({
      title: tooltipsEnabled ? "Tooltips Disabled" : "Tooltips Enabled",
      description: tooltipsEnabled 
        ? "You won't see tooltips anymore." 
        : "You'll now see tooltips for features you haven't explored.",
    });
  };
  
  return (
    <TooltipContext.Provider
      value={{
        hasSeenTooltip,
        markTooltipAsSeen,
        resetAllTooltips,
        resetTooltip,
        tooltipsEnabled,
        toggleTooltips,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
};

export const useTooltips = (): TooltipContextType => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltips must be used within a TooltipProvider');
  }
  return context;
};