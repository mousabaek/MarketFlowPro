import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TooltipButtonProps extends ButtonProps {
  tooltipContent: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * A button with a help icon that triggers a tooltip when hovered or clicked
 */
const TooltipButton: React.FC<TooltipButtonProps> = ({
  tooltipContent,
  side = 'top',
  align = 'center',
  buttonSize = 'icon',
  className = '',
  ...buttonProps
}) => {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={buttonSize}
            className={`rounded-full p-0 h-7 w-7 ${className}`}
            {...buttonProps}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(!open);
              if (buttonProps.onClick) {
                buttonProps.onClick(e);
              }
            }}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className="max-w-sm p-4"
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipButton;