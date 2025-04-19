import { useQuery, useMutation } from "@tanstack/react-query";
import { Opportunity, OpportunityWithPlatform, InsertOpportunity } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useOpportunities(options?: { limit?: number; offset?: number; status?: string }) {
  const { toast } = useToast();
  const limit = options?.limit || 10;
  const offset = options?.offset || 0;
  const status = options?.status;
  
  // Construct query parameters
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }
  
  // Fetch opportunities with pagination
  const { 
    data: opportunitiesData, 
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/opportunities', { limit, offset, status }],
    queryFn: async () => {
      const response = await fetch(`/api/opportunities?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      return response.json();
    },
  });
  
  // Create a new opportunity
  const createOpportunity = useMutation({
    mutationFn: async (opportunity: InsertOpportunity) => {
      const response = await apiRequest('POST', '/api/opportunities', opportunity);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Opportunity Created",
        description: "The opportunity has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create opportunity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  // Update an existing opportunity
  const updateOpportunity = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Opportunity> }) => {
      const response = await apiRequest('PATCH', `/api/opportunities/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Opportunity Updated",
        description: "The opportunity has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update opportunity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete an opportunity
  const deleteOpportunity = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/opportunities/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Opportunity Deleted",
        description: "The opportunity has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete opportunity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    opportunities: opportunitiesData?.opportunities as OpportunityWithPlatform[],
    pagination: opportunitiesData?.pagination,
    isLoading,
    isError,
    error,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
  };
}

// Hook for getting a single opportunity
export function useOpportunity(id?: number) {
  const { toast } = useToast();
  
  const { 
    data: opportunity, 
    isLoading,
    isError,
    error
  } = useQuery<Opportunity>({
    queryKey: ['/api/opportunities', id],
    queryFn: async ({ queryKey }) => {
      const [_, opportunityId] = queryKey;
      if (!opportunityId) return null;
      
      const response = await fetch(`/api/opportunities/${opportunityId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch opportunity');
      }
      return response.json();
    },
    enabled: !!id, // Only run query if ID is provided
  });
  
  // Change opportunity status
  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest('PATCH', `/api/opportunities/${id}`, { status });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: `The opportunity status has been updated to ${data.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['/api/opportunities', id] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update opportunity status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    opportunity,
    isLoading,
    isError,
    error,
    changeStatus
  };
}
