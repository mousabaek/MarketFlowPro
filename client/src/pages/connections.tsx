import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Platform, platformConnectionSchema } from "@shared/schema";
import { PlatformCard } from "@/components/ui/platform-card";
import { PlatformDetails } from "@/components/ui/platform-details";
import { Button } from "@/components/ui/button";
import { PlusCircle, Link2, RefreshCw, ShoppingCart, Briefcase, Building, WrenchIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WolfLogo } from "@/components/ui/wolf-logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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


export default function Connections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [platformToDelete, setPlatformToDelete] = useState<Platform | null>(null);
  const [platformToRefresh, setPlatformToRefresh] = useState<Platform | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  
  // Fetch platforms
  const { data: platforms = [], isLoading } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });
  
  // Form for adding a new platform connection
  const form = useForm({
    resolver: zodResolver(platformConnectionSchema),
    defaultValues: {
      name: "",
      type: "",
      apiKey: "",
      apiSecret: ""
    },
  });
  
  // Create platform connection mutation
  const createPlatform = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/platforms", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      toast({
        title: "Platform connected",
        description: "Your platform has been connected successfully."
      });
      setIsConnectionDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error connecting platform",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Delete platform mutation
  const deletePlatform = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/platforms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
      toast({
        title: "Platform disconnected",
        description: "The platform has been disconnected successfully."
      });
      setPlatformToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error disconnecting platform",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: any) => {
    createPlatform.mutate(data);
  };

  // Get platform-specific settings fields
  const getPlatformFields = (type: string) => {
    switch(type) {
      case "affiliate":
        return (
          <>
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your API key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your API secret" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case "freelance":
        return (
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your API key" {...field} />
                </FormControl>
                <FormDescription>
                  You can find your API key in your account settings.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };
  
  // Handle platform refresh
  const handleRefreshPlatform = (platform: Platform) => {
    setPlatformToRefresh(platform);
    
    // Simulate platform refresh
    setTimeout(() => {
      setPlatformToRefresh(null);
      toast({
        title: "Platform refreshed",
        description: `${platform.name} data has been synced successfully.`
      });
    }, 1500);
  };
  
  // Handle platform settings
  const handlePlatformSettings = (platform: Platform) => {
    toast({
      title: "Platform settings",
      description: `Opening settings for ${platform.name}...`
    });
  };
  
  // Handle view platform details
  const handleViewPlatform = (platform: Platform) => {
    setSelectedPlatform(platform);
  };
  
  // Handle fix platform error
  const handleFixPlatformError = (platform: Platform) => {
    toast({
      title: "Fixing connector error",
      description: "Applying automatic fix to connection issues..."
    });
    
    // Simulate fixing the error
    setTimeout(() => {
      // Update the platform status
      const updatePlatform = async () => {
        try {
          await apiRequest("PATCH", `/api/platforms/${platform.id}`, {
            status: "connected",
            healthStatus: "healthy"
          });
          
          queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
          
          toast({
            title: "Connection fixed",
            description: `${platform.name} connection has been restored successfully.`
          });
        } catch (error) {
          toast({
            title: "Error fixing connection",
            description: "Failed to fix the connection. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      updatePlatform();
    }, 2000);
  };
  
  // Handle watch platform live
  const handleWatchLive = (platform: Platform) => {
    toast({
      title: "Live monitoring",
      description: `Starting live monitoring for ${platform.name}...`
    });
  };
  
  // Handle pause platform
  const handlePausePlatform = (platform: Platform) => {
    toast({
      title: "Pausing connection",
      description: `Pausing connection to ${platform.name}...`
    });
    
    // Simulate pausing
    setTimeout(() => {
      const updatePlatform = async () => {
        try {
          await apiRequest("PATCH", `/api/platforms/${platform.id}`, {
            status: "disconnected"
          });
          
          queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
          
          toast({
            title: "Connection paused",
            description: `${platform.name} connection has been paused.`
          });
        } catch (error) {
          toast({
            title: "Error pausing connection",
            description: "Failed to pause the connection. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      updatePlatform();
    }, 1000);
  };
  
  // Handle resume platform
  const handleResumePlatform = (platform: Platform) => {
    toast({
      title: "Resuming connection",
      description: `Resuming connection to ${platform.name}...`
    });
    
    // Simulate resuming
    setTimeout(() => {
      const updatePlatform = async () => {
        try {
          await apiRequest("PATCH", `/api/platforms/${platform.id}`, {
            status: "connected"
          });
          
          queryClient.invalidateQueries({ queryKey: ["/api/platforms"] });
          
          toast({
            title: "Connection resumed",
            description: `${platform.name} connection has been resumed.`
          });
        } catch (error) {
          toast({
            title: "Error resuming connection",
            description: "Failed to resume the connection. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      updatePlatform();
    }, 1000);
  };
  
  // Get platform icon
  const getPlatformIcon = (platformName: string) => {
    const iconProps = { className: "h-12 w-12 text-primary" };
    
    switch(platformName.toLowerCase()) {
      case "clickbank":
        return <ShoppingCart {...iconProps} />;
      case "fiverr":
        return <Briefcase {...iconProps} />;
      case "upwork":
        return <Building {...iconProps} />;
      default:
        return <Link2 {...iconProps} />;
    }
  };
  
  return (
    <div className="mt-16 lg:mt-0 pb-8">
      {/* Connections Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Connections</h2>
          <p className="text-gray-500">Connect and manage your platform integrations</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsConnectionDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Connection
          </Button>
        </div>
      </div>
      
      {/* Platform List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-border h-44 animate-pulse" />
          ))}
        </div>
      ) : platforms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
          <WolfLogo className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No connections found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by connecting to a platform</p>
          <div className="mt-6">
            <Button onClick={() => setIsConnectionDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map(platform => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              onSettings={handlePlatformSettings}
              onRefresh={handleRefreshPlatform}
              onView={handleViewPlatform}
              onFixError={handleFixPlatformError}
              onWatchLive={handleWatchLive}
              onPause={handlePausePlatform}
              onResume={handleResumePlatform}
            />
          ))}
        </div>
      )}
      
      {/* Platform Details Dialog */}
      <Dialog 
        open={!!selectedPlatform} 
        onOpenChange={(open) => !open && setSelectedPlatform(null)}
        className="max-w-4xl"
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPlatform && (
            <PlatformDetails 
              platformId={selectedPlatform.id} 
              onClose={() => setSelectedPlatform(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Connection Dialog */}
      <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Platform Connection</DialogTitle>
            <DialogDescription>
              Connect to a freelance or affiliate marketing platform to automate tasks.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Name</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Set default type based on platform selection
                        if (value === "Clickbank") {
                          form.setValue("type", "affiliate");
                        } else if (["Fiverr", "Upwork"].includes(value)) {
                          form.setValue("type", "freelance");
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Clickbank">Clickbank</SelectItem>
                        <SelectItem value="Fiverr">Fiverr</SelectItem>
                        <SelectItem value="Upwork">Upwork</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="affiliate">Affiliate Marketing</SelectItem>
                        <SelectItem value="freelance">Freelance Marketplace</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("type") && getPlatformFields(form.watch("type"))}
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsConnectionDialogOpen(false)}
                  disabled={createPlatform.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPlatform.isPending}
                >
                  {createPlatform.isPending ? "Connecting..." : "Connect Platform"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Refresh Confirmation Dialog */}
      <AlertDialog open={!!platformToRefresh} onOpenChange={(open) => !open && setPlatformToRefresh(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Refreshing {platformToRefresh?.name}
            </AlertDialogTitle>
            <AlertDialogDescription className="flex items-center justify-center p-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!platformToDelete} onOpenChange={(open) => !open && setPlatformToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect the platform "{platformToDelete?.name}" and all associated workflows will stop functioning.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => platformToDelete && deletePlatform.mutate(platformToDelete.id)} 
              className="bg-red-600 hover:bg-red-700"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
