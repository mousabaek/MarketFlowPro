import { 
  Card, 
  CardContent, 
  CardHeader
} from "@/components/ui/card";
import { Workflow, Platform } from "@shared/schema";
import { 
  MoreHorizontal, 
  ShoppingCart, 
  Briefcase, 
  Building 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";

interface WorkflowNode {
  type: "platform" | "filter" | "action" | "error";
  label: string;
  icon?: React.ReactNode;
}

interface WorkflowCardProps {
  workflow: Workflow;
  platform: Platform;
  onEdit?: (workflow: Workflow) => void;
  onDelete?: (workflow: Workflow) => void;
  onPause?: (workflow: Workflow) => void;
  onResume?: (workflow: Workflow) => void;
}

const getPlatformIcon = (platformName: string) => {
  const iconProps = { className: "mr-2 h-5 w-5" };
  
  switch(platformName.toLowerCase()) {
    case "clickbank":
      return <ShoppingCart {...iconProps} />;
    case "fiverr":
      return <Briefcase {...iconProps} />;
    case "upwork":
      return <Building {...iconProps} />;
    default:
      return <Building {...iconProps} />;
  }
};

const getStatusClass = (status: string) => {
  switch(status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "paused":
      return "bg-gray-100 text-gray-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function WorkflowCard({ workflow, platform, onEdit, onDelete, onPause, onResume }: WorkflowCardProps) {
  // Parse steps to create workflow nodes
  const getWorkflowNodes = (): WorkflowNode[] => {
    if (!workflow.steps || workflow.steps.length === 0) {
      return [];
    }

    // Maximum 3 nodes to display
    const nodes: WorkflowNode[] = [];
    
    // First node is always the platform
    nodes.push({
      type: "platform",
      label: platform.name,
      icon: getPlatformIcon(platform.name)
    });
    
    // Add step nodes (limit to 1-2 depending on error state)
    const maxSteps = workflow.status === "error" ? 1 : 2;
    for (let i = 0; i < Math.min(maxSteps, workflow.steps.length); i++) {
      const step = workflow.steps[i];
      
      if (step.type === "filter") {
        nodes.push({
          type: "filter",
          label: "Filter",
          icon: <svg className="mr-2 h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        });
      } else if (step.type === "action") {
        nodes.push({
          type: "action",
          label: step.config?.type || "Action",
          icon: <svg className="mr-2 h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        });
      }
    }
    
    // If workflow has error status, add error node
    if (workflow.status === "error") {
      nodes.push({
        type: "error",
        label: "Error",
        icon: <svg className="mr-2 h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      });
    }
    
    return nodes;
  };

  const nodes = getWorkflowNodes();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100">
            <span className={`h-3 w-3 rounded-full ${
              workflow.status === "active" ? "bg-green-500" : 
              workflow.status === "error" ? "bg-red-500" : "bg-amber-500"
            }`}></span>
          </span>
          <h4 className="font-medium">{workflow.name}</h4>
        </div>
        <div className="flex items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(workflow.status)}`}>
            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(workflow)}>
                  Edit
                </DropdownMenuItem>
              )}
              {workflow.status === "active" && onPause && (
                <DropdownMenuItem onClick={() => onPause(workflow)}>
                  Pause
                </DropdownMenuItem>
              )}
              {workflow.status === "paused" && onResume && (
                <DropdownMenuItem onClick={() => onResume(workflow)}>
                  Resume
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(workflow)} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="relative flex items-center justify-between mb-8">
          {nodes.map((node, index) => (
            <div key={index} className="relative">
              <div className={`rounded-lg p-2 border flex items-center ${
                node.type === "platform" ? "border-primary bg-primary/5" :
                node.type === "filter" ? "border-secondary bg-secondary/5" :
                node.type === "error" ? "border-red-500 bg-red-50" :
                "border-accent bg-accent/5"
              }`}>
                {node.icon}
                <span className="text-sm">{node.label}</span>
              </div>
              
              {/* Add connector line if not the last node */}
              {index < nodes.length - 1 && (
                <div className="absolute top-1/2 -right-9 w-8 h-0.5 bg-primary"></div>
              )}
              
              {/* Add connector dot if not the last node */}
              {index < nodes.length - 1 && (
                <div className="absolute top-1/2 right-[-12px] mt-[-2px] w-1.5 h-1.5 rounded-full bg-primary"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Last run</div>
            <div className="text-sm">{workflow.lastRun ? formatDate(workflow.lastRun) : "Never"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Success rate</div>
            <div className={`text-sm font-medium ${
              workflow.successRate >= 90 ? "text-green-600" :
              workflow.successRate >= 75 ? "text-amber-500" :
              "text-red-500"
            }`}>
              {workflow.successRate}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">
              {workflow.revenue > 0 ? "Revenue" : "Tasks"}
            </div>
            <div className="text-sm font-medium">
              {workflow.revenue > 0 
                ? formatCurrency(workflow.revenue / 100) 
                : workflow.stats?.runs || 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
