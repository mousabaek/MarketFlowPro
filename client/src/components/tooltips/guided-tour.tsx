import React, { useState, useEffect } from 'react';
import { XCircle, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTooltip } from '@/contexts/tooltip-context';
import { useAuth } from '@/hooks/use-auth';
import { TourStep, TourProps } from './utils/tour-types';

const GuidedTour: React.FC<TourProps> = ({ 
  tourId, 
  steps, 
  onComplete 
}) => {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [overlayPosition, setOverlayPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  });
  
  const { showTooltip, dismissTooltip } = useTooltip();
  const { user } = useAuth();
  
  // Check if this tour should be shown
  useEffect(() => {
    // If user is a new user (fewer than 5 logins) and this tour hasn't been dismissed
    if (user && (!user.loginCount || user.loginCount < 5) && showTooltip(tourId)) {
      // Add slight delay before starting tour
      const timer = setTimeout(() => {
        setActive(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [tourId, showTooltip, user]);
  
  // Handle element targeting
  useEffect(() => {
    if (!active) return;
    
    const step = steps[currentStep];
    const element = document.querySelector(step.element) as HTMLElement;
    
    if (element) {
      setTargetElement(element);
      
      // Calculate position for the spotlight effect
      const rect = element.getBoundingClientRect();
      setOverlayPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
      
      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight effect to the target element
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'z-50');
      
      return () => {
        // Remove highlight effect
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'z-50');
      };
    }
  }, [active, currentStep, steps]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (!active) return;
    
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [active, currentStep]);
  
  const closeTour = () => {
    setActive(false);
    dismissTooltip(tourId);
    
    if (onComplete) {
      onComplete();
    }
  };
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Tour complete
      closeTour();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const calcTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%' };
    
    const step = steps[currentStep];
    const position = step.position || 'bottom';
    const rect = targetElement.getBoundingClientRect();
    
    switch (position) {
      case 'top':
        return {
          bottom: `${window.innerHeight - rect.top + window.scrollY + 20}px`,
          left: `${rect.left + window.scrollX + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          top: `${rect.bottom + window.scrollY + 20}px`,
          left: `${rect.left + window.scrollX + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: `${rect.top + window.scrollY + rect.height / 2}px`,
          right: `${window.innerWidth - rect.left + window.scrollX + 20}px`,
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          top: `${rect.top + window.scrollY + rect.height / 2}px`,
          left: `${rect.right + window.scrollX + 20}px`,
          transform: 'translateY(-50%)'
        };
      default:
        return {
          top: `${rect.bottom + window.scrollY + 20}px`,
          left: `${rect.left + window.scrollX + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
    }
  };
  
  if (!active) return null;
  
  const step = steps[currentStep];
  const tooltipPosition = calcTooltipPosition();
  
  return (
    <>
      {/* Overlay with spotlight effect */}
      <div className="fixed inset-0 z-50 bg-black/50 pointer-events-none" />
      <div 
        className="fixed z-50 pointer-events-none"
        style={{
          top: overlayPosition.top,
          left: overlayPosition.left,
          width: overlayPosition.width,
          height: overlayPosition.height,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
        }}
      />
      
      {/* Tooltip */}
      <div 
        className="fixed z-[60] bg-card border rounded-lg shadow-lg p-4 max-w-xs pointer-events-auto"
        style={tooltipPosition}
      >
        <div className="relative">
          <button 
            className="absolute top-0 right-0 text-muted-foreground hover:text-foreground"
            onClick={closeTour}
          >
            <XCircle size={16} />
            <span className="sr-only">Close tour</span>
          </button>
          
          <div className="mb-2">
            <h4 className="font-semibold text-sm">{step.title}</h4>
            <div className="text-xs text-muted-foreground mt-1">
              {step.content}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2"
                  onClick={prevStep}
                >
                  <ArrowLeft size={14} className="mr-1" /> 
                  Previous
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-7 px-2"
                  onClick={nextStep}
                >
                  Next <ArrowRight size={14} className="ml-1" />
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-7 px-2"
                  onClick={closeTour}
                >
                  Finish <Check size={14} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuidedTour;