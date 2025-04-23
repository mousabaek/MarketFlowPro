import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { RealTimeCollaboration } from '../components/collaboration/real-time-visualization';
import { NetworkVisualization } from '../components/collaboration/network-visualization';
import { SharedWhiteboard } from '../components/collaboration/shared-whiteboard';
import { ActivityTimeline } from '../components/collaboration/activity-timeline';
import { ChatPanel } from '../components/collaboration/chat-panel';
import { useWebSocketContext } from '../hooks/use-websocket-context';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  Users, Activity, MessageSquare, 
  Zap, Network, Share2, MousePointer, 
  RefreshCw, Check, ArrowRight, Edit
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-5 w-5 text-primary" />
                    <CardTitle>Real-Time Cursor Tracking</CardTitle>
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
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-primary" />
                  <CardTitle>Shared Whiteboard</CardTitle>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  Live
                </Badge>
              </div>
              <CardDescription>
                Draw and collaborate in real-time with your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SharedWhiteboard />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Activity Feed Tab */}
        <TabsContent value="activity">
          <div className="grid grid-cols-1 gap-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>
                  Track all actions and events from your team in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityTimeline />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="h-[700px]">
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
              <CardDescription>
                Communicate with your team in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-full pb-6">
              <div className="h-full">
                <ChatPanel />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}