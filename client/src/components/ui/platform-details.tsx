import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Platform, Activity, Workflow } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './card';
import { Button } from './button';
import { Badge } from './badge';
import { formatDate } from '@/lib/utils';
import { 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { ActivityList } from './activity-card';

interface PlatformDetailsProps {
  platformId: number;
  onClose: () => void;
}

export function PlatformDetails({ platformId, onClose }: PlatformDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: platform, isLoading: platformLoading } = useQuery<Platform>({
    queryKey: ['/api/platforms', platformId],
    enabled: !!platformId,
  });
  
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { platformId }],
    enabled: !!platformId,
  });

  const { data: workflows = [], isLoading: workflowsLoading } = useQuery<Workflow[]>({
    queryKey: ['/api/workflows', { platformId }],
    enabled: !!platformId,
  });

  if (platformLoading || !platform) {
    return (
      <Card className="w-full h-full">
        <CardContent className="pt-6">
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string | null) => {
    if (status === 'connected') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'limited') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = (status: string | null) => {
    if (status === 'connected') return 'Connected';
    if (status === 'limited') return 'Limited';
    if (status === 'disconnected') return 'Disconnected';
    return 'Error';
  };

  const handleFixConnectorError = () => {
    alert('Fixing connector error...');
    // Implement error fixing logic here
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center">
              {platform.name}
              <Badge 
                className={`ml-2 ${
                  platform.status === 'connected' ? 'bg-green-100 text-green-800' : 
                  platform.status === 'limited' ? 'bg-amber-100 text-amber-800' : 
                  'bg-red-100 text-red-800'
                }`}
              >
                {getStatusText(platform.status)}
              </Badge>
            </CardTitle>
            <CardDescription>
              {platform.type} platform • Last synced: {platform.lastSynced ? formatDate(platform.lastSynced) : 'Never'}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => alert('Refresh started')}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={() => alert('Settings opened')}>
              <Settings className="mr-1 h-4 w-4" />
              Settings
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {platform.status === 'error' && (
        <div className="mx-6 my-2 p-3 bg-red-50 text-red-700 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Connection error: Authentication failed. Please check API credentials.</span>
          </div>
          <Button size="sm" variant="destructive" onClick={handleFixConnectorError}>
            Fix Issue
          </Button>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="mx-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">API Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    {getStatusIcon(platform.healthStatus)}
                    <span className="ml-2">{platform.healthStatus || 'Unknown'}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workflows.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Connection Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="capitalize">{platform.type}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>{activities[0]?.timestamp ? formatDate(activities[0]?.timestamp) : 'No activity'}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">API Details</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">API Key</p>
                    <p className="text-sm font-mono">•••••••••••••{platform.apiKey?.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">API Secret</p>
                    <p className="text-sm font-mono">{platform.apiSecret ? '•••••••••••••••' : 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Live Monitoring</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-medium">AI Agent Status: {platform.status === 'connected' ? 'Active' : 'Inactive'}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      {platform.status === 'connected' 
                        ? 'Agent is currently monitoring the platform for new opportunities.' 
                        : 'Agent is not currently monitoring this platform.'}
                    </p>
                  </div>
                  <Button variant="outline" className="border-blue-500 text-blue-700">
                    {platform.status === 'connected' ? 'Watch Live' : 'Activate Agent'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="activity">
          <CardContent>
            <h3 className="text-lg font-medium mb-4">Recent Activities</h3>
            {activitiesLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : activities.length > 0 ? (
              <ActivityList activities={activities} />
            ) : (
              <div className="text-center py-10 text-gray-500">No activities found for this platform</div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="workflows">
          <CardContent>
            <h3 className="text-lg font-medium mb-4">Connected Workflows</h3>
            {workflowsLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : workflows.length > 0 ? (
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <Card key={workflow.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{workflow.name}</CardTitle>
                        <Badge className={`${workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {workflow.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500">
                        Last Run: {workflow.lastRun ? formatDate(workflow.lastRun) : 'Never'} • 
                        Success Rate: {workflow.successRate}%
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">No workflows found for this platform</div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="logs">
          <CardContent>
            <h3 className="text-lg font-medium mb-4">Connection Logs</h3>
            <div className="bg-gray-50 p-4 rounded-md font-mono text-sm h-60 overflow-y-auto">
              <div className="text-gray-600">[{new Date().toISOString()}] Connecting to {platform.name} API...</div>
              <div className="text-green-600">[{new Date(Date.now() - 1000).toISOString()}] Successfully authenticated with {platform.name}</div>
              <div className="text-blue-600">[{new Date(Date.now() - 2000).toISOString()}] Fetching available resources...</div>
              <div className="text-blue-600">[{new Date(Date.now() - 3000).toISOString()}] Retrieved 24 resources from API</div>
              <div className="text-amber-600">[{new Date(Date.now() - 60000).toISOString()}] Rate limit warning: 80% of limit reached</div>
              <div className="text-green-600">[{new Date(Date.now() - 120000).toISOString()}] Connection established</div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" onClick={onClose}>Close</Button>
        {platform.status !== 'connected' && (
          <Button onClick={() => alert('Reconnecting...')}>Reconnect</Button>
        )}
      </CardFooter>
    </Card>
  );
}