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
import { useWebSocketContext } from '../hooks/use-websocket-context';
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ActivityIcon,
  Clock,
  ChevronsUpDown, 
  FileText, 
  MessageSquare, 
  Repeat,
  Send, 
  Sparkles, 
  Timer,
  Users, 
  Zap 
} from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function CollaborationSimulator() {
  const { isConnected, sendMessage } = useWebSocketContext();
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
  
  // Track recent events for the log display
  interface RecentEvent {
    type: 'message' | 'action' | 'activity';
    title: string;
    description: string;
    time: string;
  }
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  
  // Helper functions for event display
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-3 w-3 text-blue-500" />;
      case 'action':
        return <Zap className="h-3 w-3 text-amber-500" />;
      case 'activity':
        return <Users className="h-3 w-3 text-green-500" />;
      default:
        return <ActivityIcon className="h-3 w-3 text-gray-500" />;
    }
  };
  
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'action':
        return 'bg-amber-100 dark:bg-amber-900/30';
      case 'activity':
        return 'bg-green-100 dark:bg-green-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

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
    const currentTime = new Date().toLocaleTimeString();
    setLastEventTime(currentTime);
    setSimulationActive(true);
    
    // Create a short flash of activity
    setTimeout(() => {
      setSimulationActive(false);
    }, 500);
    
    // Create message content
    const messageContent = messageText || generateMessage();
    const action = actionType || generateAction();
    const target = targetObject || generateTarget();
    
    // Create the event
    if (eventType === 'message') {
      sendMessage({
        type: 'message',
        message: messageContent
      });
      
      // Add to recent events log
      addRecentEvent({
        type: 'message',
        title: 'New Message',
        description: messageContent,
        time: currentTime
      });
      
    } else if (eventType === 'action') {
      const details = messageText || 'No additional details';
      
      sendMessage({
        type: 'user_action',
        action,
        target,
        details
      });
      
      // Add to recent events log
      addRecentEvent({
        type: 'action',
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${target}`,
        description: details,
        time: currentTime
      });
      
    } else if (eventType === 'activity') {
      const activityMessage = messageText || `${action} the ${target} successfully.`;
      
      sendMessage({
        type: 'activity',
        activityType: action,
        target,
        message: activityMessage
      });
      
      // Add to recent events log
      addRecentEvent({
        type: 'activity',
        title: `Activity: ${action}`,
        description: activityMessage,
        time: currentTime
      });
    }
    
    // Clear message input after sending
    setMessageText('');
  };
  
  // Helper to add a recent event to the log (keeps only the last 10)
  const addRecentEvent = (event: RecentEvent) => {
    setRecentEvents(prev => [event, ...prev].slice(0, 10));
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
        
        // Generate random values for the event
        const randomMessage = generateMessage();
        const randomAction = generateAction();
        const randomTarget = generateTarget();
        const currentTime = new Date().toLocaleTimeString();
        
        // Set random values for UI display
        setActionType(randomAction);
        setTargetObject(randomTarget);
        
        // Track event statistics
        setEventCount(prev => prev + 1);
        setLastEventTime(currentTime);
        setSimulationActive(true);
        
        // Create a short flash of activity
        setTimeout(() => {
          setSimulationActive(false);
        }, 500);
        
        // Prepare event data based on type
        if (randomEventType === 'message') {
          // Send the message event
          sendMessage({
            type: 'message',
            message: randomMessage
          });
          
          // Add to recent events log
          addRecentEvent({
            type: 'message',
            title: 'New Message',
            description: randomMessage,
            time: currentTime
          });
          
        } else if (randomEventType === 'action') {
          // Send the action event
          sendMessage({
            type: 'user_action',
            action: randomAction,
            target: randomTarget,
            details: `Auto-generated user action`
          });
          
          // Add to recent events log
          addRecentEvent({
            type: 'action',
            title: `${randomAction.charAt(0).toUpperCase() + randomAction.slice(1)} ${randomTarget}`,
            description: `Auto-generated user action on ${randomTarget}`,
            time: currentTime
          });
          
        } else if (randomEventType === 'activity') {
          // Create activity message
          const activityMessage = `${randomAction} the ${randomTarget} automatically`;
          
          // Send the activity event
          sendMessage({
            type: 'activity',
            activityType: randomAction,
            target: randomTarget,
            message: activityMessage
          });
          
          // Add to recent events log
          addRecentEvent({
            type: 'activity',
            title: `Activity: ${randomAction}`,
            description: activityMessage,
            time: currentTime
          });
        }
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

            {/* Simulation details and event log display */}
            {(autoSimulation || eventCount > 0) && (
              <div className="w-full border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/80 border-b">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Simulation Dashboard</span>
                    {simulationActive && (
                      <span className="flex items-center gap-1 text-primary text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                        Active
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3 w-3" />
                      Events Sent
                    </span>
                    <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {eventCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Last Event
                    </span>
                    <span className="font-mono">{lastEventTime || 'N/A'}</span>
                  </div>
                  {autoSimulation && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Repeat className="h-3 w-3" />
                          Auto-send
                        </span>
                        <span className="text-primary font-medium">Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Timer className="h-3 w-3" />
                          Interval
                        </span>
                        <span className="font-medium">{simulationSpeed}s</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Event log */}
                <div className="px-3 py-2 bg-muted/80 border-t border-b">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xs">Recent Events</span>
                    <Badge variant="outline" className="text-[10px] h-5 gap-1">
                      <ActivityIcon className="h-3 w-3" />
                      Live
                    </Badge>
                  </div>
                </div>
                
                <div className="max-h-32 overflow-y-auto divide-y divide-border/30 bg-muted/5">
                  {recentEvents.length > 0 ? (
                    recentEvents.map((event, index) => (
                      <div key={index} className="px-3 py-2 text-xs flex items-start gap-2">
                        <div className={`p-1 rounded-full ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-medium truncate">
                              {event.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {event.time}
                            </span>
                          </div>
                          <p className="text-muted-foreground truncate">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-xs text-center text-muted-foreground">
                      No events yet. Start simulation to see events.
                    </div>
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