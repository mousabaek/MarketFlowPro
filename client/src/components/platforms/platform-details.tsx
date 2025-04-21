import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCcw, ExternalLink, AlertTriangle, Check, X, Settings, PlusCircle } from "lucide-react";
import { AmazonProductDetails } from "./amazon-product-details";
import { EtsyListingDetails } from "./etsy-listing-details";
import { FreelancerProjectDetails } from "./freelancer-project-details";

interface PlatformDetailsProps {
  platformId: number;
  onClose?: () => void;
}

export function PlatformDetails({ platformId, onClose }: PlatformDetailsProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);

  // Fetch platform details
  const { 
    data: platform, 
    isLoading: platformLoading, 
    isError: platformError 
  } = useQuery({
    queryKey: [`/api/platforms/${platformId}`],
    retry: 1,
  });

  // Fetch recent activities
  const { 
    data: activities, 
    isLoading: activitiesLoading 
  } = useQuery({
    queryKey: ["/api/activities", { limit: 5, platformId }],
    enabled: !!platform,
  });

  // Fetch workflows for this platform
  const { 
    data: workflows, 
    isLoading: workflowsLoading 
  } = useQuery({
    queryKey: ["/api/workflows", { platformId }],
    enabled: !!platform,
  });

  // Fetch items based on platform type
  const {
    data: items,
    isLoading: itemsLoading,
    isError: itemsError
  } = useQuery({
    queryKey: [
      platform?.type === "affiliate" 
        ? (
          platform?.name === "Amazon Associates" 
            ? `/api/platforms/${platformId}/amazon/products` 
            : platform?.name === "Etsy" 
              ? `/api/platforms/${platformId}/etsy/listings`
              : null
        )
        : platform?.name === "Freelancer.com"
          ? `/api/platforms/${platformId}/freelancer/projects`
          : null
    ],
    enabled: !!platform,
  });

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}`] });
    
    // Based on platform type, invalidate the appropriate queries
    if (platform?.type === "affiliate") {
      if (platform.name === "Amazon Associates") {
        queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}/amazon/products`] });
      } else if (platform.name === "Etsy") {
        queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}/etsy/listings`] });
      }
    } else if (platform?.name === "Freelancer.com") {
      queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}/freelancer/projects`] });
    }
    
    // Also refresh activities and workflows
    queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Handle item selection
  const handleSelectItem = (id: string | number, type: string) => {
    setSelectedItemId(id);
    setSelectedItemType(type);
  };

  // Handle external URL
  const handleOpenExternalUrl = (url: string) => {
    window.open(url, "_blank");
  };
  
  // Render content based on selected item
  const renderSelectedItemDetails = () => {
    if (!selectedItemId || !selectedItemType || !platform) return null;
    
    switch (selectedItemType) {
      case "amazon-product":
        return (
          <AmazonProductDetails 
            platformId={platformId} 
            asin={selectedItemId as string} 
            onClose={() => {
              setSelectedItemId(null);
              setSelectedItemType(null);
            }}
          />
        );
      case "etsy-listing":
        return (
          <EtsyListingDetails 
            platformId={platformId} 
            listingId={selectedItemId as number} 
            onClose={() => {
              setSelectedItemId(null);
              setSelectedItemType(null);
            }}
          />
        );
      case "freelancer-project":
        return (
          <FreelancerProjectDetails 
            platformId={platformId} 
            projectId={selectedItemId as number} 
            onClose={() => {
              setSelectedItemId(null);
              setSelectedItemType(null);
            }}
          />
        );
      default:
        return null;
    }
  };
  
  // Handle rendering platform-specific items
  const renderItemsByPlatform = () => {
    if (itemsLoading) {
      return (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (itemsError || !items || items.length === 0) {
      return (
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {itemsError 
              ? "Failed to load items from the platform." 
              : "No items found. Connect and set up your platform to see items here."}
          </AlertDescription>
        </Alert>
      );
    }
    
    // Display platform-specific items
    if (platform?.name === "Amazon Associates") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.slice(0, 6).map((product: any) => (
            <div 
              key={product.asin}
              className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors"
              onClick={() => handleSelectItem(product.asin, "amazon-product")}
            >
              <div className="flex space-x-3">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-16 h-16 object-contain"
                />
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-medium text-sm truncate">{product.title}</h3>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold">{product.price?.formattedPrice}</span>
                    {product.estimatedCommission && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Est: ${product.estimatedCommission.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (platform?.name === "Etsy") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.slice(0, 6).map((listing: any) => (
            <div 
              key={listing.listingId}
              className="border rounded-md p-4 hover:border-primary cursor-pointer transition-colors"
              onClick={() => handleSelectItem(listing.listingId, "etsy-listing")}
            >
              <div className="flex space-x-3">
                <img 
                  src={listing.imageUrl} 
                  alt={listing.title} 
                  className="w-16 h-16 object-contain"
                />
                <div className="space-y-1 overflow-hidden">
                  <h3 className="font-medium text-sm truncate">{listing.title}</h3>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold">{listing.price?.formattedPrice}</span>
                    <Badge className="ml-2 text-xs bg-[#F56400]">Etsy</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (platform?.name === "Freelancer.com") {
      return (
        <div className="space-y-3">
          {items.slice(0, 6).map((project: any) => (
            <div 
              key={project.id}
              className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
              onClick={() => handleSelectItem(project.id, "freelancer-project")}
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{project.title}</h3>
                <Badge variant={project.status === "active" ? "default" : "outline"}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {project.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex space-x-2">
                  {project.skills?.slice(0, 3).map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {project.skills?.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.skills.length - 3} more
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-semibold">{project.budget?.formattedAmount}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <Alert>
        <AlertDescription>
          This platform type is not fully supported yet.
        </AlertDescription>
      </Alert>
    );
  };
  
  if (platformLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading platform details...</span>
      </div>
    );
  }

  if (platformError || !platform) {
    return (
      <div className="text-center p-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="mt-2 text-lg font-medium">Failed to load platform details</h3>
        <p className="text-gray-500 mt-2">
          There was an error loading the platform information.
        </p>
        <Button onClick={onClose} variant="outline" className="mt-4">
          Close
        </Button>
      </div>
    );
  }
  
  // If an item is selected, show its details
  if (selectedItemId && selectedItemType) {
    return renderSelectedItemDetails();
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Platform Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{platform.name}</h2>
          <div className="flex items-center mt-1 space-x-2">
            <Badge variant={platform.status === "connected" ? "default" : "outline"}>
              {platform.status === "connected" ? "Connected" : "Disconnected"}
            </Badge>
            <Badge 
              variant="outline" 
              className={
                platform.healthStatus === "healthy" 
                  ? "text-green-600 border-green-200 bg-green-50" 
                  : "text-red-600 border-red-200 bg-red-50"
              }
            >
              {platform.healthStatus === "healthy" ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <X className="h-3 w-3 mr-1" />
              )}
              {platform.healthStatus}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCcw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            size="sm"
            variant="default"
            onClick={() => {
              // Navigate to platform settings
              console.log("Navigate to platform settings");
            }}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Platform Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">
            {platform.type === "affiliate" 
              ? "Products"
              : platform.type === "freelance"
                ? "Projects"
                : "Items"
            }
          </TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Platform Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{platform.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected On:</span>
                  <span>{platform.createdAt 
                    ? new Date(platform.createdAt).toLocaleDateString() 
                    : "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span>{platform.lastSync 
                    ? new Date(platform.lastSync).toLocaleString() 
                    : "Never"}</span>
                </div>
                {platform.apiKey && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Key:</span>
                    <span>••••••••••{platform.apiKey.slice(-4)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleOpenExternalUrl(
                    platform.name === "Amazon Associates" 
                      ? "https://affiliate-program.amazon.com/" 
                      : platform.name === "Etsy" 
                        ? "https://www.etsy.com/your/shops/me/dashboard"
                        : platform.name === "Freelancer.com"
                          ? "https://www.freelancer.com/dashboard"
                          : "#"
                  )}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open {platform.name} Dashboard
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <div className="text-muted-foreground text-xs mb-1">Active Workflows</div>
                  <div className="font-semibold text-lg">
                    {workflowsLoading ? (
                      <Skeleton className="h-6 w-12 mx-auto" />
                    ) : (
                      workflows?.filter(w => w.status === "active").length || 0
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <div className="text-muted-foreground text-xs mb-1">Success Rate</div>
                  <div className="font-semibold text-lg">
                    {platform.successRate !== undefined 
                      ? `${Math.round(platform.successRate * 100)}%`
                      : "N/A"}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <div className="text-muted-foreground text-xs mb-1">Revenue</div>
                  <div className="font-semibold text-lg">
                    {platform.revenue !== undefined 
                      ? `$${platform.revenue.toFixed(2)}`
                      : "$0.00"}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <div className="text-muted-foreground text-xs mb-1">Tasks</div>
                  <div className="font-semibold text-lg">
                    {platform.stats?.tasks || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Recent Activity</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            
            {activitiesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start space-x-3 text-sm">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.type === "system" 
                        ? "bg-primary/10 text-primary" 
                        : activity.type === "error"
                          ? "bg-red-100 text-red-500"
                          : "bg-green-100 text-green-500"
                    }`}>
                      {activity.type === "system" ? (
                        <Settings className="h-4 w-4" />
                      ) : activity.type === "error" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-muted-foreground text-xs">{activity.description}</p>
                      <p className="text-xs mt-1">
                        {activity.timestamp 
                          ? new Date(activity.timestamp).toLocaleString() 
                          : "Unknown time"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No activity recorded yet
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Items Tab */}
        <TabsContent value="items">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">
                {platform.type === "affiliate" 
                  ? "Products"
                  : platform.type === "freelance"
                    ? "Projects"
                    : "Items"
                }
              </h3>
              
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-1" />
                {platform.type === "affiliate" 
                  ? "Add Product"
                  : platform.type === "freelance"
                    ? "Find Projects"
                    : "Add Item"
                }
              </Button>
            </div>
            
            {renderItemsByPlatform()}
          </div>
        </TabsContent>
        
        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Automated Workflows</h3>
              <Button>
                <PlusCircle className="h-4 w-4 mr-1" />
                Create Workflow
              </Button>
            </div>
            
            {workflowsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : workflows && workflows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Workflow Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((workflow: any) => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium">{workflow.name}</TableCell>
                      <TableCell>
                        <Badge variant={workflow.status === "active" ? "default" : "outline"}>
                          {workflow.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {workflow.lastRun 
                          ? new Date(workflow.lastRun).toLocaleString() 
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {workflow.nextRun 
                          ? new Date(workflow.nextRun).toLocaleString() 
                          : "Not scheduled"}
                      </TableCell>
                      <TableCell>
                        {workflow.successRate !== undefined 
                          ? `${Math.round(workflow.successRate * 100)}%`
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No workflows set up yet
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Activity History</h3>
              <Button variant="outline" size="sm">
                Export Log
              </Button>
            </div>
            
            {activitiesLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity: any) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge 
                          variant={activity.type === "error" ? "destructive" : "outline"}
                          className={activity.type === "success" ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : ""}
                        >
                          {activity.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>
                        {activity.timestamp 
                          ? new Date(activity.timestamp).toLocaleString() 
                          : "Unknown"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No activity recorded yet
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}