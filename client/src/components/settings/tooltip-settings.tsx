import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTooltip } from '@/contexts/tooltip-context';
import { HelpCircle, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';

const TooltipSettings = () => {
  const { tooltipsDisabled, toggleTooltips, resetTooltips, dismissedTooltips } = useTooltip();
  
  // Count number of dismissed tooltips
  const dismissedCount = Object.keys(dismissedTooltips).filter(key => dismissedTooltips[key]).length;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HelpCircle className="h-5 w-5 mr-2 text-primary" />
          Tooltip Settings
        </CardTitle>
        <CardDescription>Manage contextual tooltips and help hints</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="tooltip-toggle">Enable Contextual Help</Label>
            <p className="text-sm text-muted-foreground">
              Show helpful tooltips while navigating the app
            </p>
          </div>
          <Switch 
            id="tooltip-toggle"
            checked={!tooltipsDisabled}
            onCheckedChange={() => toggleTooltips()}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Dismissed Tooltips</Label>
            <p className="text-sm text-muted-foreground">
              {dismissedCount === 0
                ? 'No tooltips have been dismissed'
                : `${dismissedCount} tooltip${dismissedCount === 1 ? '' : 's'} dismissed`}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={resetTooltips}
            disabled={dismissedCount === 0}
          >
            <RefreshCw className="h-4 w-4" /> 
            Reset Tooltips
          </Button>
        </div>
        
        <div className="rounded-md bg-muted p-4 text-sm">
          <p className="text-muted-foreground">
            Tooltips are shown to help you navigate and understand the platform.
            Dismissed tooltips won't appear again until you reset them.
            More experienced users will see fewer tooltips automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TooltipSettings;