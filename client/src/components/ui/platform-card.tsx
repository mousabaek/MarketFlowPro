import { 
  Card, 
  CardContent, 
  CardHeader
} from "@/components/ui/card";
import { Platform } from "@shared/schema";
import { 
  ShoppingCart,
  Briefcase,
  Building,
  MoreVertical,
  RefreshCw,
  Settings,
  PauseCircle,
  PlayCircle,
  Eye,
  AlertTriangle
} from "lucide-react";
import { Button } from "./button";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlatformCardProps {
  platform: Platform;
  onSettings?: (platform: Platform) => void;
  onRefresh?: (platform: Platform) => void;
}

// Function to get platform icon
const getPlatformIcon = (platformName: string) => {
  const iconProps = { className: "h-10 w-10" };
  
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

// Function to get platform type label
const getPlatformTypeLabel = (type: string) => {
  switch(type.toLowerCase()) {
    case "affiliate":
      return "Affiliate Marketing";
    case "freelance":
      return "Freelance Marketplace";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

// Function to get status badge class
const getStatusBadgeClass = (status: string) => {
  switch(status) {
    case "connected":
      return "bg-green-100 text-green-800";
    case "disconnected":
      return "bg-red-100 text-red-800";
    case "limited":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Function to get health status text and color
const getHealthStatus = (status: string) => {
  switch(status) {
    case "healthy":
      return { text: "Healthy", color: "text-green-600" };
    case "warning":
      return { text: "Rate Limited", color: "text-amber-600" };
    case "error":
      return { text: "Error", color: "text-red-600" };
    default:
      return { text: "Unknown", color: "text-gray-600" };
  }
};

export function PlatformCard({ platform, onSettings, onRefresh }: PlatformCardProps) {
  const icon = getPlatformIcon(platform.name);
  const typeLabel = getPlatformTypeLabel(platform.type);
  const statusClass = getStatusBadgeClass(platform.status || "disconnected");
  const healthStatus = getHealthStatus(platform.healthStatus || "unknown");
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="rounded-md overflow-hidden flex items-center justify-center bg-white">
              {icon}
            </div>
            <div>
              <h4 className="font-medium">{platform.name}</h4>
              <p className="text-xs text-gray-500">{typeLabel}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
            {platform.status ? platform.status.charAt(0).toUpperCase() + platform.status.slice(1) : "Disconnected"}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>API Status</span>
            <span className={healthStatus.color}>{healthStatus.text}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Workflows</span>
            <span>{platform.settings && typeof platform.settings === 'object' && 'workflowCount' in platform.settings ? platform.settings.workflowCount : 0} active</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Last Synced</span>
            <span>{platform.lastSynced ? formatDate(platform.lastSynced) : "Never"}</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          {onSettings && (
            <Button 
              variant="ghost" 
              className="text-sm text-gray-600" 
              onClick={() => onSettings(platform)}
            >
              Settings
            </Button>
          )}
          {onRefresh && (
            <Button 
              variant="ghost" 
              className="text-sm text-primary ml-2" 
              onClick={() => onRefresh(platform)}
            >
              Refresh
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
