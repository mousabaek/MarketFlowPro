import { useQuery, useMutation } from "@tanstack/react-query";
import { Workflow, WorkflowWithStats, InsertWorkflow } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useWorkflows() {
  const { toast } = useToast();
  
  // Fetch all workflows
  const { 
    data: workflows, 
    isLoading,
    isError,
    error
  } = useQuery<WorkflowWithStats[]>({
    queryKey: ['/api/workflows'],
  });
  
  // Create a new workflow
  const createWorkflow = useMutation({
    mutationFn: async (workflow: InsertWorkflow) => {
      const response = await apiRequest('POST', '/api/workflows', workflow);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Workflow Created",
        description: "Your new workflow has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  // Update an existing workflow
  const updateWorkflow = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Workflow> }) => {
      const response = await apiRequest('PATCH', `/api/workflows/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Workflow Updated",
        description: "The workflow has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete a workflow
  const deleteWorkflow = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/workflows/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Workflow Deleted",
        description: "The workflow has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  // Toggle workflow status (active/paused)
  const toggleWorkflowStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'active' | 'paused' }) => {
      const response = await apiRequest('PATCH', `/api/workflows/${id}`, { status });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: `Workflow ${data.status === 'active' ? 'Activated' : 'Paused'}`,
        description: `The workflow has been ${data.status === 'active' ? 'activated' : 'paused'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update workflow status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    workflows,
    isLoading,
    isError,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus
  };
}

// Hook for getting a single workflow
export function useWorkflow(id?: number) {
  const { toast } = useToast();
  
  const { 
    data: workflow, 
    isLoading,
    isError,
    error
  } = useQuery<Workflow>({
    queryKey: ['/api/workflows', id],
    queryFn: async ({ queryKey }) => {
      const [_, workflowId] = queryKey;
      if (!workflowId) return null;
      
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow');
      }
      return response.json();
    },
    enabled: !!id, // Only run query if ID is provided
  });
  
  // Run workflow manually
  const runWorkflow = useMutation({
    mutationFn: async (workflowId: number) => {
      // In a real app, we would have a dedicated endpoint for manual execution
      // For demo purposes, we'll just simulate a run
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Workflow Executed",
        description: "The workflow has been executed successfully.",
      });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['/api/workflows', id] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
    },
    onError: (error) => {
      toast({
        title: "Execution Failed",
        description: `Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    workflow,
    isLoading,
    isError,
    error,
    runWorkflow
  };
}
