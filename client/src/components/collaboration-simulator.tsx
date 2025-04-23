import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useWebSocket } from '@/hooks/use-websocket';
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, Zap, MessageSquare, ChevronsUpDown, Sparkles, Send, FileText } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function CollaborationSimulator() {
  const { isConnected, sendMessage } = useWebSocket();
  const [eventType, setEventType] = useState<string>('message');
  const [messageText, setMessageText] = useState<string>('');
  const [actionType, setActionType] = useState<string>('updated');
  const [targetObject, setTargetObject] = useState<string>('workflow');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [autoSimulation, setAutoSimulation] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(5); // seconds
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const [eventCount, setEventCount] = useState<number>(0);
  const [lastEventTime, setLastEventTime] = useState<string>('');
  const [simulationActive, setSimulationActive] = useState<boolean>(false);

  // Function to generate a message
  const generateMessage = () => {
    const messages = [
      "Just updated the Amazon product recommendations. Looking good!",
      "Found an issue with the ClickBank API connection. Looking into it.",
      "The Etsy integration is working great now!",
      "Can someone review my Freelancer.com workflow?",
      "I optimized the opportunity matcher. It's now 30% faster.",
      "Added 5 new product categories to the Amazon scanner.",
      "Working on improving conversion rates for affiliate links.",
      "Just hit a new milestone: 1,000 successful automations!",
      "Need help with the payment integration. Anyone available?",
      "Updated documentation for the new workflow features."
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Function to generate an action
  const generateAction = () => {
    const actions = ['created', 'updated', 'deleted', 'optimized', 'analyzed', 'fixed', 'deployed', 'configured'];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  // Function to generate a target
  const generateTarget = () => {
    const targets = [
      'Amazon Associates workflow', 
      'ClickBank integration', 
      'Etsy product scanner', 
      'Freelancer.com connector', 
      'opportunity matcher', 
      'payment gateway', 
      'user dashboard', 
      'affiliate links', 
      'product recommendations', 
      'conversion tracker'
    ];
    
    return targets[Math.floor(Math.random() * targets.length)];
  };

  // Send a simulated event
  const sendSimulatedEvent = () => {
    if (!isConnected) return;
    
    // Track event statistics
    setEventCount(prev => prev + 1);
    setLastEventTime(new Date().toLocaleTimeString());
    setSimulationActive(true);
    
    // Create a short flash of activity
    setTimeout(() => {
      setSimulationActive(false);
    }, 500);
    
    if (eventType === 'message') {
      sendMessage({
        type: 'message',
        message: messageText || generateMessage()
      });
    } else if (eventType === 'action') {
      sendMessage({
        type: 'user_action',
        action: actionType || generateAction(),
        target: targetObject || generateTarget(),
        details: messageText || 'No additional details'
      });
    } else if (eventType === 'activity') {
      sendMessage({
        type: 'activity',
        activityType: actionType || generateAction(),
        target: targetObject || generateTarget(),
        message: messageText || `${actionType || generateAction()} the ${targetObject || generateTarget()} successfully.`
      });
    }
    
    // Clear message input after sending
    setMessageText('');
  };

  // Toggle auto simulation
  const toggleAutoSimulation = (value: boolean) => {
    setAutoSimulation(value);
    
    if (value) {
      // Start interval for auto simulation
      const interval = setInterval(() => {
        // Randomly choose an event type
        const eventTypes = ['message', 'action', 'activity'];
        const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        setEventType(randomEventType);
        
        // Set random values for other fields
        setActionType(generateAction());
        setTargetObject(generateTarget());
        
        // Track event statistics
        setEventCount(prev => prev + 1);
        setLastEventTime(new Date().toLocaleTimeString());
        setSimulationActive(true);
        
        // Create a short flash of activity
        setTimeout(() => {
          setSimulationActive(false);
        }, 500);
        
        // Send the event
        sendMessage({
          type: randomEventType === 'message' ? 'message' : 
                randomEventType === 'action' ? 'user_action' : 'activity',
          message: generateMessage(),
          action: generateAction(),
          activityType: generateAction(),
          target: generateTarget(),
          details: `Auto-generated ${randomEventType} event`
        });
        
      }, simulationSpeed * 1000);
      
      setSimulationInterval(interval);
    } else {
      // Clear interval when turning off auto simulation
      if (simulationInterval) {
        clearInterval(simulationInterval);
        setSimulationInterval(null);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              Collaboration Simulator
              {simulationActive && (
                <Badge variant="outline" className="ml-2 bg-primary/5 text-primary border-primary/20 gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse"/>
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <span>Test real-time collaboration features</span>
              {eventCount > 0 && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {eventCount} event{eventCount !== 1 ? 's' : ''} sent
                </Badge>
              )}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={isExpanded ? "outline" : "ghost"}
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-md" 
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="sr-only">{isExpanded ? "Collapse" : "Expand"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {isExpanded ? "Collapse simulator" : "Expand simulator"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <>
          <CardContent className="space-y-4 pb-3">
            <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-md">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Auto Simulation</h4>
                    <p className="text-xs text-muted-foreground">
                      Automatically generate random events
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {autoSimulation ? 'On' : 'Off'}
                  </span>
                  <Switch 
                    id="auto-simulation" 
                    checked={autoSimulation} 
                    onCheckedChange={toggleAutoSimulation}
                    disabled={!isConnected}
                  />
                </div>
              </div>
              
              {autoSimulation && (
                <div className="flex flex-col w-full gap-1 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="speed" className="text-sm font-medium">
                      Simulation Speed
                    </Label>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                      {simulationSpeed}s interval
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Fast</span>
                    <Slider
                      id="speed"
                      value={[simulationSpeed]}
                      min={1}
                      max={15}
                      step={1}
                      onValueChange={(value) => setSimulationSpeed(value[0])}
                      disabled={!autoSimulation || !isConnected}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground">Slow</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-type" className="flex items-center gap-2 mb-1.5">
                <FileText className="h-4 w-4 text-primary" />
                <span>Event Type</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={eventType === 'message' ? 'default' : 'outline'} 
                  className={`flex flex-col items-center justify-center py-3 h-auto ${eventType === 'message' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/5'}`}
                  onClick={() => setEventType('message')}
                  disabled={autoSimulation}
                >
                  <div className={`p-1.5 rounded-full ${eventType === 'message' ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                    <MessageSquare className={`h-4 w-4 ${eventType === 'message' ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  <span className="mt-1 text-xs font-medium">Message</span>
                </Button>
                <Button
                  type="button"
                  variant={eventType === 'action' ? 'default' : 'outline'} 
                  className={`flex flex-col items-center justify-center py-3 h-auto ${eventType === 'action' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/5'}`}
                  onClick={() => setEventType('action')}
                  disabled={autoSimulation}
                >
                  <div className={`p-1.5 rounded-full ${eventType === 'action' ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                    <Zap className={`h-4 w-4 ${eventType === 'action' ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  <span className="mt-1 text-xs font-medium">User Action</span>
                </Button>
                <Button
                  type="button"
                  variant={eventType === 'activity' ? 'default' : 'outline'} 
                  className={`flex flex-col items-center justify-center py-3 h-auto ${eventType === 'activity' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/5'}`}
                  onClick={() => setEventType('activity')}
                  disabled={autoSimulation}
                >
                  <div className={`p-1.5 rounded-full ${eventType === 'activity' ? 'bg-primary-foreground/20' : 'bg-primary/10'}`}>
                    <Users className={`h-4 w-4 ${eventType === 'activity' ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  <span className="mt-1 text-xs font-medium">Activity</span>
                </Button>
              </div>
            </div>
            
            {(eventType === 'action' || eventType === 'activity') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action-type">Action</Label>
                  <Select 
                    value={actionType} 
                    onValueChange={setActionType}
                    disabled={autoSimulation}
                  >
                    <SelectTrigger id="action-type">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="updated">Updated</SelectItem>
                      <SelectItem value="deleted">Deleted</SelectItem>
                      <SelectItem value="optimized">Optimized</SelectItem>
                      <SelectItem value="analyzed">Analyzed</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="deployed">Deployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-object">Target</Label>
                  <Select 
                    value={targetObject} 
                    onValueChange={setTargetObject}
                    disabled={autoSimulation}
                  >
                    <SelectTrigger id="target-object">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="Amazon Associates workflow">Amazon Workflow</SelectItem>
                      <SelectItem value="ClickBank integration">ClickBank Integration</SelectItem>
                      <SelectItem value="Etsy connection">Etsy Connection</SelectItem>
                      <SelectItem value="Freelancer.com profile">Freelancer Profile</SelectItem>
                      <SelectItem value="opportunity matcher">Opportunity Matcher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="message-text">
                {eventType === 'message' ? 'Message Text' : 'Additional Details'}
              </Label>
              <Textarea
                id="message-text"
                placeholder={eventType === 'message' ? "Enter your message..." : "Enter additional details..."}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-[80px]"
                disabled={autoSimulation}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 pt-0">
            <div className="flex justify-between w-full items-center">
              <div className="flex gap-2 flex-wrap">
                {!isConnected && (
                  <Badge variant="destructive" className="gap-1">
                    <span className="h-2 w-2 rounded-full bg-background animate-pulse"></span>
                    Disconnected
                  </Badge>
                )}
                
                {autoSimulation && isConnected && (
                  <Badge variant="outline" className="gap-1 text-primary border-primary">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    Auto-sending every {simulationSpeed}s
                  </Badge>
                )}

                {eventCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="gap-1 cursor-help">
                          <Sparkles className="h-3 w-3" />
                          {eventCount} event{eventCount !== 1 ? 's' : ''} sent
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">Last event sent at {lastEventTime || 'N/A'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <Button 
                onClick={sendSimulatedEvent} 
                disabled={!isConnected || autoSimulation}
                className={`relative ${simulationActive ? 'animate-pulse' : ''}`}
                size="sm"
              >
                <span className={`absolute inset-0 rounded-md ${simulationActive ? 'bg-primary/20 animate-ping' : 'bg-transparent'}`}></span>
                <Send className="h-4 w-4 mr-2" />
                Send Event
              </Button>
            </div>

            {/* Simulation details display */}
            {(autoSimulation || eventCount > 0) && (
              <div className="w-full px-3 py-2 bg-muted/50 rounded-md text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-muted-foreground">Simulation Status</span>
                  {simulationActive && (
                    <span className="flex items-center gap-1 text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                      Active
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Events Sent:</span>
                    <span>{eventCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Event:</span>
                    <span>{lastEventTime || 'N/A'}</span>
                  </div>
                  {autoSimulation && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Auto-send:</span>
                        <span className="text-primary">Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interval:</span>
                        <span>{simulationSpeed}s</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}