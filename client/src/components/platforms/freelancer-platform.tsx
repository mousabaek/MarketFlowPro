import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Platform } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, Sparkles, Copy, ExternalLink } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { FreelancerProjectDetails } from './freelancer-project-details';

interface FreelancerPlatformProps {
  platform: Platform;
}

export function FreelancerPlatform({ platform }: FreelancerPlatformProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [copiedProjectId, setCopiedProjectId] = useState<number | null>(null);
  
  // Test connection mutation
  const testConnection = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/platforms/${platform.id}/freelancer/test-connection`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platform.id}`] });
    }
  });
  
  // Get profile data query
  const profileQuery = useQuery({
    queryKey: [`/api/platforms/${platform.id}/freelancer/profile`],
    queryFn: ({ queryKey }) => apiRequest(queryKey[0]),
    enabled: platform.status === 'connected' && activeTab === 'profile',
  });
  
  // Get skill data query
  const skillsQuery = useQuery({
    queryKey: [`/api/platforms/${platform.id}/freelancer/skills`],
    queryFn: ({ queryKey }) => apiRequest(queryKey[0]),
    enabled: platform.status === 'connected' && activeTab === 'skills',
  });
  
  // Get project search query
  const projectsQuery = useQuery({
    queryKey: [`/api/platforms/${platform.id}/freelancer/projects`],
    queryFn: ({ queryKey }) => apiRequest(queryKey[0]),
    enabled: platform.status === 'connected' && activeTab === 'projects',
  });
  
  // Get bidding stats query
  const biddingStatsQuery = useQuery({
    queryKey: [`/api/platforms/${platform.id}/freelancer/bidding-stats`],
    queryFn: ({ queryKey }) => apiRequest(queryKey[0]),
    enabled: platform.status === 'connected' && activeTab === 'stats',
  });
  
  // Get current bids query
  const currentBidsQuery = useQuery({
    queryKey: [`/api/platforms/${platform.id}/freelancer/current-bids`],
    queryFn: ({ queryKey }) => apiRequest(queryKey[0]),
    enabled: platform.status === 'connected' && activeTab === 'bids',
  });
  
  // Function to handle copying project link to clipboard
  const copyProjectLink = (projectId: number) => {
    // Create the project URL (this would be the actual Freelancer.com URL in production)
    const projectUrl = `https://www.freelancer.com/projects/${projectId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(projectUrl).then(() => {
      setCopiedProjectId(projectId);
      toast({
        title: "Link copied!",
        description: "Project link has been copied to clipboard",
      });
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopiedProjectId(null);
      }, 2000);
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard",
        variant: "destructive",
      });
    });
  };
  
  // Connection status indicator
  const ConnectionStatus = () => {
    if (platform.status === 'connected') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Connected
        </Badge>
      );
    } else if (platform.status === 'error') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" /> Connection Error
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Disconnected
        </Badge>
      );
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Freelancer.com Platform</CardTitle>
            <CardDescription>
              Manage your Freelancer.com integration and projects
            </CardDescription>
          </div>
          <ConnectionStatus />
        </div>
      </CardHeader>
      
      <CardContent>
        {platform.status !== 'connected' && (
          <Alert className="mb-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Unable to connect to Freelancer.com API. Please check your API key and credentials.
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection.mutate()}
                  disabled={testConnection.isPending}
                >
                  {testConnection.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="bids">My Bids</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Platform Details</h3>
                  <div className="text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Name:</div>
                      <div>{platform.name}</div>
                      
                      <div className="text-muted-foreground">Type:</div>
                      <div>{platform.type}</div>
                      
                      <div className="text-muted-foreground">Status:</div>
                      <div>{platform.healthStatus || 'Unknown'}</div>
                      
                      <div className="text-muted-foreground">Last Synced:</div>
                      <div>{platform.lastSynced ? formatDate(platform.lastSynced) : 'Never'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" 
                      onClick={() => testConnection.mutate()}
                      disabled={testConnection.isPending}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start"
                      onClick={() => setActiveTab('projects')}>
                      Find Projects
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start"
                      onClick={() => setActiveTab('profile')}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Integration Info</h3>
                <p className="text-sm text-muted-foreground">
                  This integration allows Wolf Auto Marketer to automatically search for projects, 
                  analyze opportunities, and submit bids on Freelancer.com on your behalf. 
                  The API connection requires a valid Freelancer.com API key with appropriate permissions.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            {profileQuery.isPending ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : profileQuery.isError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load profile data. Please check your connection.
                </AlertDescription>
              </Alert>
            ) : profileQuery.data ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {profileQuery.data.result?.profile?.avatar && (
                    <img 
                      src={profileQuery.data.result.profile.avatar} 
                      alt="Profile" 
                      className="h-16 w-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-lg">
                      {profileQuery.data.result?.profile?.display_name || 'Freelancer User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Member since {profileQuery.data.result?.profile?.registration_date &&
                        formatDate(new Date(profileQuery.data.result.profile.registration_date * 1000))}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Profile Details</h4>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Username:</div>
                      <div>{profileQuery.data.result?.profile?.username}</div>
                      
                      <div className="text-muted-foreground">Public Name:</div>
                      <div>{profileQuery.data.result?.profile?.public_name}</div>
                      
                      <div className="text-muted-foreground">Role:</div>
                      <div>{profileQuery.data.result?.profile?.role}</div>
                      
                      <div className="text-muted-foreground">Status:</div>
                      <div>{profileQuery.data.result?.status}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Stats</h4>
                    <div className="text-sm grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Rating:</div>
                      <div>{profileQuery.data.result?.profile?.reputation?.overall}</div>
                      
                      <div className="text-muted-foreground">Reviews:</div>
                      <div>{profileQuery.data.result?.profile?.reputation?.reviews_count || 0}</div>
                      
                      <div className="text-muted-foreground">Completion Rate:</div>
                      <div>{profileQuery.data.result?.profile?.completion_rate || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No profile data available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="projects">
            {selectedProjectId ? (
              <FreelancerProjectDetails 
                platform={platform}
                projectId={selectedProjectId}
                onBack={() => setSelectedProjectId(null)}
              />
            ) : projectsQuery.isPending ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : projectsQuery.isError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load project data. Please check your connection.
                </AlertDescription>
              </Alert>
            ) : projectsQuery.data?.result?.projects ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    Found {projectsQuery.data.result.total || 0} projects
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => projectsQuery.refetch()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {Object.values(projectsQuery.data.result.projects).map((project: any) => (
                    <Card key={project.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{project.title}</CardTitle>
                          <Badge>
                            {project.currency?.sign}
                            {project.budget?.minimum} - {project.budget?.maximum}
                          </Badge>
                        </div>
                        <CardDescription>
                          Posted {formatDate(new Date(project.time_submitted * 1000))}
                          {project.bid_stats?.bid_count && ` • ${project.bid_stats.bid_count} bids`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {project.preview_description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.jobs?.map((job: any) => (
                            <Badge key={job.id} variant="outline" className="text-xs">
                              {job.name}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2 justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-grow"
                          onClick={() => setSelectedProjectId(project.id)}
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                          View Details
                        </Button>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={copiedProjectId === project.id ? "text-green-500" : ""}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyProjectLink(project.id);
                                }}>
                                {copiedProjectId === project.id ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>{copiedProjectId === project.id ? "Copied!" : "Copy Link"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://www.freelancer.com/projects/${project.id}`, '_blank');
                                }}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Open in Freelancer.com</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No projects available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="bids">
            {currentBidsQuery.isPending ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : currentBidsQuery.isError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load bids data. Please check your connection.
                </AlertDescription>
              </Alert>
            ) : currentBidsQuery.data?.result?.bids ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">
                    You have {Object.keys(currentBidsQuery.data.result.bids).length} active bids
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => currentBidsQuery.refetch()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {Object.values(currentBidsQuery.data.result.bids).map((bid: any) => (
                    <Card key={bid.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{bid.project_title || 'Project'}</CardTitle>
                          <Badge>
                            {bid.amount}
                          </Badge>
                        </div>
                        <CardDescription>
                          Bid placed {formatDate(new Date(bid.time_submitted * 1000))}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {bid.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex gap-2 justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-grow"
                        >
                          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                          View Details
                        </Button>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={copiedProjectId === bid.project_id ? "text-green-500" : ""}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyProjectLink(bid.project_id);
                                }}>
                                {copiedProjectId === bid.project_id ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>{copiedProjectId === bid.project_id ? "Copied!" : "Copy Link"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://www.freelancer.com/projects/${bid.project_id}`, '_blank');
                                }}>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <p>Open in Freelancer.com</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No active bids available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="skills">
            {skillsQuery.isPending ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : skillsQuery.isError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load skills data. Please check your connection.
                </AlertDescription>
              </Alert>
            ) : skillsQuery.data?.result?.jobs ? (
              <div className="space-y-4">
                <h3 className="font-medium">
                  Available Skills ({Object.values(skillsQuery.data.result.jobs).length})
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.values(skillsQuery.data.result.jobs).map((job: any) => (
                    <div key={job.id} className="bg-muted rounded p-2 text-sm">
                      {job.name}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No skills data available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats">
            {biddingStatsQuery.isPending ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : biddingStatsQuery.isError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load bidding statistics. Please check your connection.
                </AlertDescription>
              </Alert>
            ) : biddingStatsQuery.data?.result ? (
              <div className="space-y-4">
                <h3 className="font-medium">Bidding Statistics</h3>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Bids This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {biddingStatsQuery.data.result.monthly_bids || 0}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Total Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {biddingStatsQuery.data.result.total_projects || 0}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {biddingStatsQuery.data.result.success_rate || 0}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No statistics available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}