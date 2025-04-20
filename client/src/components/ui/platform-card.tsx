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
  onView?: (platform: Platform) => void;
  onFixError?: (platform: Platform) => void;
  onWatchLive?: (platform: Platform) => void;
  onPause?: (platform: Platform) => void;
  onResume?: (platform: Platform) => void;
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

export function PlatformCard({ 
  platform, 
  onSettings, 
  onRefresh, 
  onView, 
  onFixError, 
  onWatchLive, 
  onPause, 
  onResume 
}: PlatformCardProps) {
  const icon = getPlatformIcon(platform.name);
  const typeLabel = getPlatformTypeLabel(platform.type);
  const statusClass = getStatusBadgeClass(platform.status || "disconnected");
  const healthStatus = getHealthStatus(platform.healthStatus || "unknown");
  const isConnected = platform.status === "connected";
  const hasError = platform.healthStatus === "error";
  
  // Safely extract workflow count from settings
  const getWorkflowCount = (): string => {
    if (!platform.settings) return '0';
    if (typeof platform.settings !== 'object') return '0';
    
    const settings = platform.settings as Record<string, unknown>;
    if (!settings.workflowCount) return '0';
    
    return String(settings.workflowCount);
  };
  
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => onView && onView(platform)}>
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
          
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${statusClass}`}>
              {platform.status ? platform.status.charAt(0).toUpperCase() + platform.status.slice(1) : "Disconnected"}
            </span>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView && onView(platform); }}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRefresh && onRefresh(platform); }}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Refresh Connection</span>
                </DropdownMenuItem>

                {onWatchLive && isConnected && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onWatchLive(platform); }}>
                    <Eye className="mr-2 h-4 w-4 text-blue-600" />
                    <span className="text-blue-600">Watch Live</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                {isConnected && onPause && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPause(platform); }}>
                    <PauseCircle className="mr-2 h-4 w-4" />
                    <span>Pause Connection</span>
                  </DropdownMenuItem>
                )}
                
                {!isConnected && onResume && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onResume(platform); }}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    <span>Resume Connection</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSettings && onSettings(platform); }}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                {hasError && onFixError && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFixError(platform); }} className="text-red-600">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <span>Fix Error</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            <span>
              {getWorkflowCount()} active
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Last Synced</span>
            <span>{platform.lastSynced ? formatDate(platform.lastSynced) : "Never"}</span>
          </div>
        </div>
        
        {hasError && (
          <div className="p-2 bg-red-50 text-red-700 rounded border border-red-100 text-sm flex items-center mb-2">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Connection error detected. Click to view details.</span>
          </div>
        )}
        
        {isConnected && (
          <div className="flex items-center mb-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
            <span className="text-sm text-green-600">AI Agent active</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
