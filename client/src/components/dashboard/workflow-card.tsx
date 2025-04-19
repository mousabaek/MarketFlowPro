import { WorkflowWithStats } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Pause, RefreshCw, Search, MessageSquare, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface WorkflowCardProps {
  workflow: WorkflowWithStats;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  const { toast } = useToast();
  
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getWorkflowIcon = (platformType: string) => {
    switch (platformType) {
      case 'clickbank':
        return <Search className="h-5 w-5 text-blue-600" />;
      case 'fiverr':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'upwork':
        return <Briefcase className="h-5 w-5 text-teal-600" />;
      default:
        return <Search className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const getIconBgColor = (platformType: string) => {
    switch (platformType) {
      case 'clickbank':
        return 'bg-blue-100';
      case 'fiverr':
        return 'bg-green-100';
      case 'upwork':
        return 'bg-teal-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  const toggleWorkflowStatus = async () => {
    try {
      const newStatus = workflow.status === 'active' ? 'paused' : 'active';
      
      await apiRequest('PATCH', `/api/workflows/${workflow.id}`, {
        status: newStatus
      });
      
      // Invalidate workflows cache
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      
      toast({
        title: `Workflow ${newStatus === 'active' ? 'Activated' : 'Paused'}`,
        description: `The workflow has been ${newStatus === 'active' ? 'activated' : 'paused'} successfully.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update workflow status.',
        variant: 'destructive',
      });
    }
  };
  
  const reconnectWorkflow = async () => {
    try {
      await apiRequest('PATCH', `/api/workflows/${workflow.id}`, {
        status: 'active'
      });
      
      // Invalidate workflows cache
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      
      toast({
        title: 'Workflow Reconnected',
        description: 'The workflow has been reconnected successfully.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reconnect workflow.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card className="overflow-hidden workflow-card">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className={cn("flex-shrink-0 rounded-full p-2", getIconBgColor(workflow.platformType))}>
            {getWorkflowIcon(workflow.platformType)}
          </div>
          
          <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            getStatusBadgeStyles(workflow.status)
          )}>
            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
          </span>
        </div>
        
        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-900">{workflow.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{workflow.description}</p>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center">
            <div className={cn(
              "platform-pill flex-shrink-0 px-2 py-1 rounded text-xs font-medium",
              workflow.platformType === 'clickbank' ? 'bg-blue-50 text-blue-700' :
              workflow.platformType === 'fiverr' ? 'bg-green-50 text-green-700' :
              'bg-teal-50 text-teal-700'
            )}>
              {workflow.platformType.charAt(0).toUpperCase() + workflow.platformType.slice(1)}
            </div>
            
            <div className="ml-2 text-xs text-gray-500">
              {workflow.status === 'error' ? (
                <span className="text-red-500">Error: {workflow.stats?.errorMessage || 'Authentication failed'}</span>
              ) : (
                <>Last run: {workflow.lastRun || workflow.successfulRuns}</>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Successful runs</p>
            <p className="text-sm font-medium text-gray-900">{workflow.successfulRuns || '0/0'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Revenue</p>
            <p className="text-sm font-medium text-gray-900">{workflow.revenue || '$0'}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          {workflow.status === 'error' ? (
            <Button 
              onClick={reconnectWorkflow}
              variant="outline" 
              size="sm"
              className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border-emerald-200"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reconnect
            </Button>
          ) : (
            <Button 
              onClick={toggleWorkflowStatus}
              variant="outline" 
              size="sm"
              className={workflow.status === 'active' ? 
                "text-red-700 bg-red-100 hover:bg-red-200 border-red-200" : 
                "text-green-700 bg-green-100 hover:bg-green-200 border-green-200"
              }
            >
              <Pause className="h-4 w-4 mr-1" />
              {workflow.status === 'active' ? 'Pause' : 'Activate'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
