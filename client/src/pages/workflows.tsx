import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Workflow, Platform } from "@shared/schema";
import { WorkflowCard } from "@/components/ui/workflow-card";
import { WorkflowBuilder } from "@/components/ui/workflow-builder";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, ChartGantt } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Workflows() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isWorkflowBuilderOpen, setIsWorkflowBuilderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  
  // Fetch workflows
  const { data: workflows = [], isLoading: isLoadingWorkflows } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });
  
  // Fetch platforms
  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });
  
  // Delete workflow mutation
  const deleteWorkflow = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/workflows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow deleted",
        description: "The workflow has been deleted successfully."
      });
      setWorkflowToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error deleting workflow",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Update workflow status mutation
  const updateWorkflowStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/workflows/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow updated",
        description: "The workflow status has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating workflow",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Filter and search workflows
  const filteredWorkflows = workflows.filter(workflow => {
    // Filter by search query
    if (searchQuery && !workflow.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all" && workflow.status !== statusFilter) {
      return false;
    }
    
    // Filter by platform
    if (platformFilter !== "all" && workflow.platformId !== parseInt(platformFilter)) {
      return false;
    }
    
    return true;
  });
  
  // Group workflows by status
  const activeWorkflows = filteredWorkflows.filter(w => w.status === "active");
  const pausedWorkflows = filteredWorkflows.filter(w => w.status === "paused");
  const errorWorkflows = filteredWorkflows.filter(w => w.status === "error");
  
  // Handler functions
  const handlePauseWorkflow = (workflow: Workflow) => {
    updateWorkflowStatus.mutate({ id: workflow.id, status: "paused" });
  };
  
  const handleResumeWorkflow = (workflow: Workflow) => {
    updateWorkflowStatus.mutate({ id: workflow.id, status: "active" });
  };
  
  const handleDeleteWorkflow = (workflow: Workflow) => {
    setWorkflowToDelete(workflow);
  };
  
  const confirmDeleteWorkflow = () => {
    if (workflowToDelete) {
      deleteWorkflow.mutate(workflowToDelete.id);
    }
  };
  
  return (
    <div className="mt-16 lg:mt-0 pb-8">
      {/* Workflows Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflows</h2>
          <p className="text-gray-500">Manage your automation workflows</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsWorkflowBuilderOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {platforms.map(platform => (
              <SelectItem key={platform.id} value={platform.id.toString()}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Workflow List */}
      {isLoadingWorkflows ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-border h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
          <ChartGantt className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No workflows found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== "all" || platformFilter !== "all"
              ? "Try adjusting your filters"
              : "Get started by creating a new workflow"}
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsWorkflowBuilderOpen(true)}>
              Create Workflow
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">
              All ({filteredWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Paused ({pausedWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="error">
              Error ({errorWorkflows.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredWorkflows.map(workflow => {
                const platform = platforms.find(p => p.id === workflow.platformId);
                if (!platform) return null;
                
                return (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    platform={platform}
                    onPause={handlePauseWorkflow}
                    onResume={handleResumeWorkflow}
                    onDelete={handleDeleteWorkflow}
                  />
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeWorkflows.map(workflow => {
                const platform = platforms.find(p => p.id === workflow.platformId);
                if (!platform) return null;
                
                return (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    platform={platform}
                    onPause={handlePauseWorkflow}
                    onDelete={handleDeleteWorkflow}
                  />
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="paused" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pausedWorkflows.map(workflow => {
                const platform = platforms.find(p => p.id === workflow.platformId);
                if (!platform) return null;
                
                return (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    platform={platform}
                    onResume={handleResumeWorkflow}
                    onDelete={handleDeleteWorkflow}
                  />
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="error" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {errorWorkflows.map(workflow => {
                const platform = platforms.find(p => p.id === workflow.platformId);
                if (!platform) return null;
                
                return (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    platform={platform}
                    onDelete={handleDeleteWorkflow}
                  />
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Workflow Builder Dialog */}
      <WorkflowBuilder 
        isOpen={isWorkflowBuilderOpen} 
        onClose={() => setIsWorkflowBuilderOpen(false)} 
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!workflowToDelete} onOpenChange={(open) => !open && setWorkflowToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workflow "{workflowToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteWorkflow} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
