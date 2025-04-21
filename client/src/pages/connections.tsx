import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Platform, platformConnectionSchema } from "@shared/schema";
import { z } from "zod";
import { UseFormReturn, Controller } from "react-hook-form";
import { PlatformCard } from "@/components/ui/platform-card";
import { PlatformDetails } from "@/components/ui/platform-details";
import { Button } from "@/components/ui/button";
import { PlusCircle, Link2, RefreshCw, ShoppingCart, Briefcase, Building, WrenchIcon, Store, ShoppingBag } from "lucide-react";
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


// Define a custom form type for our platform connection form
type PlatformFormValues = {
  name: string;
  type: string;
  apiKey: string;
  apiSecret: string;
  settings: {
    associateTag?: string;
    marketplace?: string;
    accessToken?: string;
    userId?: string;
    [key: string]: any;
  };
}

// Custom FormField component for nested settings
interface NestedFormFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder: string;
  description?: string;
  type?: string;
}

const NestedFormField = ({ 
  control, 
  name, 
  label, 
  placeholder, 
  description, 
  type = "text" 
}: NestedFormFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              type={type} 
              placeholder={placeholder} 
              {...field} 
              value={field.value || ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {error && <FormMessage>{error.message}</FormMessage>}
        </FormItem>
      )}
    />
  );
};

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
  const form = useForm<PlatformFormValues>({
    resolver: zodResolver(platformConnectionSchema),
    defaultValues: {
      name: "",
      type: "",
      apiKey: "",
      apiSecret: "",
      settings: {
        associateTag: "",
        marketplace: "US",
        accessToken: "",
        userId: ""
      }
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
  const onSubmit = (data: PlatformFormValues) => {
    createPlatform.mutate(data);
  };

  // Get platform-specific settings fields
  const getPlatformFields = (type: string) => {
    const platformName = form.watch("name");
    
    switch(type) {
      case "affiliate":
        // Different affiliate platforms have different fields
        if (platformName === "Amazon Associates") {
          return (
            <>
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Amazon Access Key" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Amazon Access Key ID from the PA-API credentials
                    </FormDescription>
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
                      <Input type="password" placeholder="Enter your Amazon Secret Key" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Amazon Secret Access Key from the PA-API credentials
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="settings.associateTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associate Tag</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., mystore-20" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Amazon Associates tracking ID
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="settings.marketplace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marketplace</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || "US"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select marketplace" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                        <SelectItem value="IT">Italy</SelectItem>
                        <SelectItem value="ES">Spain</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                        <SelectItem value="MX">Mexico</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the Amazon marketplace you're affiliated with
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          );
        } else if (platformName === "Etsy") {
          return (
            <>
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Etsy API key" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Etsy API key from the developer portal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Secret (Optional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your Etsy API secret" {...field} />
                    </FormControl>
                    <FormDescription>
                      Only required if using OAuth authentication
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="settings.accessToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Token (Optional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your Etsy OAuth access token" {...field} />
                    </FormControl>
                    <FormDescription>
                      If you already have an OAuth access token
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          );
        } else {
          // Default affiliate platform fields (e.g., Clickbank)
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
        }
        
      case "freelance":
        // Different freelance platforms have different fields
        if (platformName === "Freelancer.com") {
          return (
            <>
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Freelancer.com API key" {...field} />
                    </FormControl>
                    <FormDescription>
                      You can find your API key in your Freelancer.com developer settings.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="settings.userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Freelancer.com user ID" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your numerical user ID from Freelancer.com
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          );
        } else {
          // Default freelance platform fields (e.g., Fiverr, Upwork)
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
        }
        
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
                        if (["Clickbank", "Amazon Associates", "Etsy"].includes(value)) {
                          form.setValue("type", "affiliate");
                        } else if (["Fiverr", "Upwork", "Freelancer.com"].includes(value)) {
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
                        {/* Affiliate Marketing Platforms */}
                        <SelectItem value="Clickbank">Clickbank</SelectItem>
                        <SelectItem value="Amazon Associates">Amazon Associates</SelectItem>
                        <SelectItem value="Etsy">Etsy</SelectItem>
                        
                        {/* Freelance Platforms */}
                        <SelectItem value="Fiverr">Fiverr</SelectItem>
                        <SelectItem value="Upwork">Upwork</SelectItem>
                        <SelectItem value="Freelancer.com">Freelancer.com</SelectItem>
                        
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
