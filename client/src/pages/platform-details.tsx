import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  RefreshCw, 
  Settings, 
  Trash2, 
  PlayCircle, 
  PauseCircle, 
  Activity, 
  AlertCircle,
  BarChart3,
  ListChecks,
  ShoppingCart,
  Store,
  ShoppingBag,
  Briefcase,
  Building,
  Link2,
  WrenchIcon,
  Eye
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Import platform-specific components
import FreelancerProjectDetails from "@/components/platforms/freelancer-project-details";
import AmazonProductListings from "@/components/platforms/amazon-product-listings";
import EtsyListings from "@/components/platforms/etsy-listings";

export default function PlatformDetails() {
  const [, location] = useLocation();
  const [match, params] = useRoute("/platforms/:id");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPlatformDialogOpen, setIsPlatformDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!match) {
      return;
    }
  }, [match]);

  const platformId = match ? parseInt(params.id) : null;
  
  // Fetch platform details
  const { data: platform, isLoading, isError } = useQuery({
    queryKey: [`/api/platforms/${platformId}`],
    enabled: !!platformId,
  });
  
  // Fetch platform workflows
  const { data: workflows = [] } = useQuery({
    queryKey: ["/api/workflows", platformId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/workflows?platformId=${platformId}`);
      return res.json();
    },
    enabled: !!platformId,
  });
  
  if (!match) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Platform not found</h2>
          <p className="text-gray-500 mb-4">The platform you're looking for doesn't exist.</p>
          <Button onClick={() => location('/connections')}>Go to Connections</Button>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => location('/connections')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (isError || !platform) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">Failed to load platform</h2>
          <p className="text-gray-500 mb-4">There was an error loading the platform details.</p>
          <Button onClick={() => location('/connections')}>Go to Connections</Button>
        </div>
      </div>
    );
  }
  
  const handleDelete = async () => {
    try {
      await apiRequest("DELETE", `/api/platforms/${platformId}`);
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      toast({
        title: "Platform deleted",
        description: `${platform.name} has been disconnected successfully.`
      });
      location('/connections');
    } catch (error) {
      toast({
        title: "Error deleting platform",
        description: "Failed to delete the platform. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleStatusChange = async (status: string) => {
    try {
      await apiRequest("PATCH", `/api/platforms/${platformId}`, {
        status
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}`] });
      
      toast({
        title: status === "connected" ? "Platform activated" : "Platform paused",
        description: `${platform.name} has been ${status === "connected" ? "activated" : "paused"} successfully.`
      });
    } catch (error) {
      toast({
        title: "Error updating platform",
        description: "Failed to update the platform status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleRefresh = async () => {
    toast({
      title: "Refreshing data",
      description: `Syncing data from ${platform.name}...`
    });
    
    // Simulate platform refresh
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}`] });
      toast({
        title: "Data refreshed",
        description: `${platform.name} data has been synced successfully.`
      });
    }, 1500);
  };
  
  // Helper function to get platform-specific action buttons
  const renderPlatformSpecificButtons = () => {
    if (platform.type === "freelance") {
      return (
        <Button variant="outline" onClick={() => setActiveTab("projects")}>
          <ListChecks className="h-4 w-4 mr-1" />
          View Projects
        </Button>
      );
    } else if (platform.type === "affiliate") {
      if (platform.name === "Amazon Associates") {
        return (
          <Button variant="outline" onClick={() => setActiveTab("products")}>
            <ShoppingCart className="h-4 w-4 mr-1" />
            Browse Products
          </Button>
        );
      } else if (platform.name === "Etsy") {
        return (
          <Button variant="outline" onClick={() => setActiveTab("listings")}>
            <ShoppingBag className="h-4 w-4 mr-1" />
            Browse Listings
          </Button>
        );
      }
    }
    
    return null;
  };
  
  // Function to get platform icon
  const getPlatformIcon = () => {
    const iconProps = { className: "h-12 w-12 text-primary" };
    
    switch(platform.name.toLowerCase()) {
      // Affiliate platforms
      case "clickbank":
        return <ShoppingCart {...iconProps} />;
      case "amazon associates":
        return <Store {...iconProps} />;
      case "etsy":
        return <ShoppingBag {...iconProps} />;
        
      // Freelance platforms  
      case "fiverr":
        return <Briefcase {...iconProps} />;
      case "upwork":
        return <Building {...iconProps} />;
      case "freelancer.com":
        return <WrenchIcon {...iconProps} />;
        
      // Default icon
      default:
        return <Link2 {...iconProps} />;
    }
  };
  
  // Function to render platform-specific content
  const renderPlatformSpecificContent = () => {
    switch(platform.name) {
      case "Freelancer.com":
        return <FreelancerProjectDetails platformId={platformId} />;
      case "Amazon Associates":
        return <AmazonProductListings platformId={platformId} />;
      case "Etsy":
        return <EtsyListings platformId={platformId} />;
      default:
        return (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Content coming soon</h3>
            <p className="text-gray-500">
              Detailed content for this platform is currently being developed
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => location('/connections')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{platform.name}</h1>
          <Badge 
            variant={platform.status === "connected" ? "default" : "secondary"}
            className="ml-3"
          >
            {platform.status === "connected" ? "Active" : "Paused"}
          </Badge>
          {platform.healthStatus === "error" && (
            <Badge variant="destructive" className="ml-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              Connection Error
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {platform.status === "connected" ? (
            <Button variant="outline" size="icon" onClick={() => handleStatusChange("disconnected")}>
              <PauseCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="icon" onClick={() => handleStatusChange("connected")}>
              <PlayCircle className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="destructive" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle>Overview</CardTitle>
                <CardDescription>{platform.type === "freelance" ? "Freelance Platform" : "Affiliate Platform"}</CardDescription>
              </div>
              {getPlatformIcon()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Connection Status</h3>
                <p className="text-sm font-medium">
                  {platform.healthStatus === "healthy" ? (
                    <span className="text-green-600">Healthy</span>
                  ) : platform.healthStatus === "warning" ? (
                    <span className="text-amber-600">Warning</span>
                  ) : (
                    <span className="text-red-600">Error</span>
                  )}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Synced</h3>
                <p className="text-sm font-medium">
                  {new Date().toLocaleString()}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Active Workflows</h3>
                <p className="text-sm font-medium">
                  {workflows.filter(w => w.status === "active").length} / {workflows.length}
                </p>
              </div>
              
              {/* Platform-specific stats */}
              {platform.type === "freelance" && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Projects Found</h3>
                    <p className="text-sm font-medium">256</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bids Submitted</h3>
                    <p className="text-sm font-medium">32</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Projects Won</h3>
                    <p className="text-sm font-medium">8</p>
                  </div>
                </>
              )}
              
              {platform.type === "affiliate" && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Products Tracked</h3>
                    <p className="text-sm font-medium">127</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Links Generated</h3>
                    <p className="text-sm font-medium">562</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Est. Monthly Revenue</h3>
                    <p className="text-sm font-medium">$235.80</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button variant="secondary" className="w-full" onClick={() => setActiveTab("analytics")}>
              <BarChart3 className="h-4 w-4 mr-1" />
              View Analytics
            </Button>
            
            {renderPlatformSpecificButtons()}
            
            <Button variant="outline" className="w-full" onClick={() => location(`/workflows?platformId=${platformId}`)}>
              <Activity className="h-4 w-4 mr-1" />
              Manage Workflows
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {platform.type === "freelance" && (
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                )}
                {platform.type === "affiliate" && platform.name === "Amazon Associates" && (
                  <TabsTrigger value="products">Products</TabsTrigger>
                )}
                {platform.type === "affiliate" && platform.name === "Etsy" && (
                  <TabsTrigger value="listings">Listings</TabsTrigger>
                )}
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-2">
            <TabsContent value="overview" className="mt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">$1,248.65</div>
                      <p className="text-xs text-green-600">↑ 12% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">76%</div>
                      <p className="text-xs text-green-600">↑ 4% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">Active Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">Across 5 workflows</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium">
                              {platform.type === "freelance" 
                                ? `New project found: Web Development Project #${i+1}` 
                                : `Product sale: Item #${i+1}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(Date.now() - i * 3600000).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={i % 2 === 0 ? "default" : "secondary"}>
                            {i % 2 === 0 ? "New" : "Processed"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="projects" className="mt-0">
              {platform.name === "Freelancer.com" && (
                <FreelancerProjectDetails platformId={platformId} />
              )}
            </TabsContent>
            
            <TabsContent value="products" className="mt-0">
              {platform.name === "Amazon Associates" && (
                <AmazonProductListings platformId={platformId} />
              )}
            </TabsContent>
            
            <TabsContent value="listings" className="mt-0">
              {platform.name === "Etsy" && (
                <EtsyListings platformId={platformId} />
              )}
            </TabsContent>
            
            <TabsContent value="workflows" className="mt-0">
              <div className="space-y-4">
                {workflows.length > 0 ? (
                  <div className="space-y-4">
                    {workflows.map(workflow => (
                      <Card key={workflow.id}>
                        <CardHeader className="p-4">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base">{workflow.name}</CardTitle>
                            <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                              {workflow.status === "active" ? "Active" : "Paused"}
                            </Badge>
                          </div>
                          <CardDescription>{workflow.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Success Rate</p>
                              <p className="font-medium">{workflow.successRate}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Run</p>
                              <p className="font-medium">{workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : "Never"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Next Run</p>
                              <p className="font-medium">{workflow.nextRun ? new Date(workflow.nextRun).toLocaleString() : "Not scheduled"}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button variant="outline" size="sm" onClick={() => location(`/workflows/${workflow.id}`)}>
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">No workflows yet</h3>
                    <p className="text-gray-500 mb-4">
                      Create workflows to automate tasks for this platform
                    </p>
                    <Button onClick={() => location(`/workflows?platformId=${platformId}`)}>
                      Create Workflow
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-0">
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-lg mb-2">Analytics coming soon</h3>
                <p className="text-gray-500">
                  Detailed analytics for this platform are currently being developed
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the connection to {platform.name} and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}