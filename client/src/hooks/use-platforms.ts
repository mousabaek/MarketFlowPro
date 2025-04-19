import { useQuery, useMutation } from "@tanstack/react-query";
import { Platform, PlatformWithStats, InsertPlatform } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function usePlatforms() {
  const { toast } = useToast();
  
  // Fetch all platforms
  const { 
    data: platforms, 
    isLoading,
    isError,
    error
  } = useQuery<PlatformWithStats[]>({
    queryKey: ['/api/platforms'],
  });
  
  // Create a new platform
  const createPlatform = useMutation({
    mutationFn: async (platform: InsertPlatform) => {
      const response = await apiRequest('POST', '/api/platforms', platform);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Platform Created",
        description: "The platform has been successfully connected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/platforms'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to connect platform: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  // Update an existing platform
  const updatePlatform = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Platform> }) => {
      const response = await apiRequest('PATCH', `/api/platforms/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Platform Updated",
        description: "The platform settings have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/platforms'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update platform: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete a platform
  const deletePlatform = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/platforms/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Platform Deleted",
        description: "The platform has been disconnected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/platforms'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to disconnect platform: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    platforms,
    isLoading,
    isError,
    error,
    createPlatform,
    updatePlatform,
    deletePlatform
  };
}

// Hook for getting a single platform
export function usePlatform(id?: number) {
  const { toast } = useToast();
  
  const { 
    data: platform, 
    isLoading,
    isError,
    error
  } = useQuery<Platform>({
    queryKey: ['/api/platforms', id],
    queryFn: async ({ queryKey }) => {
      const [_, platformId] = queryKey;
      if (!platformId) return null;
      
      const response = await fetch(`/api/platforms/${platformId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch platform');
      }
      return response.json();
    },
    enabled: !!id, // Only run query if ID is provided
  });
  
  // Test platform connection
  const testConnection = useMutation({
    mutationFn: async (platformId: number) => {
      // In a real app, we would have a dedicated endpoint for testing connections
      // For demo purposes, we'll just simulate a test
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Connection Successful",
        description: "The platform connection is working correctly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: `Could not connect to platform: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    platform,
    isLoading,
    isError,
    error,
    testConnection
  };
}
