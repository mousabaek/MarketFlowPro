import { PlatformWithStats } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlatformCardProps {
  platform: PlatformWithStats;
}

export default function PlatformCard({ platform }: PlatformCardProps) {
  const getPlatformColors = (type: string) => {
    switch (type) {
      case 'clickbank':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600'
        };
      case 'fiverr':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600'
        };
      case 'upwork':
        return {
          bg: 'bg-teal-100',
          text: 'text-teal-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600'
        };
    }
  };

  const colors = getPlatformColors(platform.type);
  
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", colors.bg)}>
            <span className={cn("font-bold text-sm", colors.text)}>
              {platform.metadata?.icon || platform.type.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900">{platform.name}</h3>
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              platform.status === 'connected' ? 'bg-green-100 text-green-800' : 
              platform.status === 'error' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'
            )}>
              {platform.status.charAt(0).toUpperCase() + platform.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>
      
      <div className="mt-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <dt className="text-xs font-medium text-gray-500">Active Tasks</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{platform.activeTasks}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Revenue</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">{platform.revenue}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Last Update</dt>
            <dd className="mt-1 text-xs text-gray-500">{platform.lastUpdate}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Status</dt>
            <dd className={cn(
              "mt-1 text-xs",
              platform.status === 'connected' ? 'text-green-600' : 
              platform.status === 'error' ? 'text-yellow-600' : 
              'text-gray-600'
            )}>
              {platform.status === 'connected' ? 'Running' : 
               platform.status === 'error' ? (platform.metadata?.errorMessage || 'Error') : 
               'Disconnected'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
