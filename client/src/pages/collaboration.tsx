import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { RealTimeCollaboration } from '../components/collaboration/real-time-visualization';
import { NetworkVisualization } from '../components/collaboration/network-visualization';
import { useWebSocketContext } from '../hooks/use-websocket-context';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  Users, Activity, MessageSquare, 
  Zap, Network, Share2, MousePointer, 
  RefreshCw, Check, ArrowRight
} from 'lucide-react';

export default function CollaborationPage() {
  const { isConnected, userInfo, setUserInfo, collaborators, connectionStats } = useWebSocketContext();
  const [userName, setUserName] = useState(userInfo?.userName || '');
  
  // Handle updating username in context
  const updateUsername = () => {
    if (userName.trim()) {
      setUserInfo({
        ...userInfo,
        userName: userName
      });
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Collaboration</h1>
          <p className="text-muted-foreground">
            Collaborate with team members in real-time
          </p>
        </div>
        <Badge
          variant={isConnected ? "default" : "destructive"}
          className="text-xs px-2 py-1 gap-1"
        >
          <div className="h-1.5 w-1.5 rounded-full bg-background"></div>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>
      
      {/* User Identity Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Your Identity</CardTitle>
              <CardDescription>
                How others see you in the collaboration space
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="user-name" className="text-sm font-medium mb-1.5 block">
                  Display Name
                </label>
                <div className="flex gap-2">
                  <Input 
                    id="user-name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your display name"
                    className="max-w-xs"
                  />
                  <Button onClick={updateUsername} size="sm">
                    <Check className="h-4 w-4 mr-1" />
                    Update
                  </Button>
                </div>
              </div>
              
              {userInfo?.userId && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    User ID
                  </label>
                  <div className="bg-muted p-2 rounded-md text-sm font-mono">
                    {userInfo.userId}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-1">Connection Statistics</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground mb-1">Messages Received</p>
                  <p className="text-lg font-bold">{connectionStats.messagesReceived}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground mb-1">Messages Sent</p>
                  <p className="text-lg font-bold">{connectionStats.messagesSent}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground mb-1">Active Collaborators</p>
                  <p className="text-lg font-bold">{collaborators.length}</p>
                </div>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs text-muted-foreground mb-1">Connection Status</p>
                  <p className="text-sm font-medium flex items-center">
                    <span className={`h-2 w-2 rounded-full mr-1.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Collaboration Features Tabs */}
      <Tabs defaultValue="visualization">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="visualization" className="flex items-center gap-1.5">
            <Network className="h-4 w-4" />
            <span>Visualization</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1.5">
            <Activity className="h-4 w-4" />
            <span>Activity Feed</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Visualization Tab */}
        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5 text-primary" />
                  <CardTitle>Real-Time Collaboration Visualization</CardTitle>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Live
                </Badge>
              </div>
              <CardDescription>
                See where team members are working in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RealTimeCollaboration />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-primary" />
                  <CardTitle>Collaboration Network</CardTitle>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Live
                </Badge>
              </div>
              <CardDescription>
                See the connections between team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NetworkVisualization />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Features Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Visualization Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <MousePointer className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Live Cursor Tracking</p>
                      <p className="text-xs text-muted-foreground">See where your collaborators are focusing</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Share2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Presence Awareness</p>
                      <p className="text-xs text-muted-foreground">Know who's online and active</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <Activity className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Activity Tracking</p>
                      <p className="text-xs text-muted-foreground">Monitor collaboration actions in real-time</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Getting Started Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-muted text-xs font-medium">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium">Set your display name</p>
                      <p className="text-xs text-muted-foreground">Customize how others see you during collaboration</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-muted text-xs font-medium">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium">Check connection status</p>
                      <p className="text-xs text-muted-foreground">Ensure your WebSocket connection is active</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-muted text-xs font-medium">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium">Share the page with others</p>
                      <p className="text-xs text-muted-foreground">Invite collaborators to join</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full text-sm" size="sm">
                    <ArrowRight className="h-3.5 w-3.5 mr-1" /> Learn more about collaboration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Activity Feed Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>
                Track all actions and events from your team in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-center">
                <div>
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-1">Activity feed coming soon</h3>
                  <p className="text-muted-foreground">We're working on an enhanced activity tracking system</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
              <CardDescription>
                Communicate with your team in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 text-center">
                <div>
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-1">Chat feature coming soon</h3>
                  <p className="text-muted-foreground">Our development team is implementing a robust chat system</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}