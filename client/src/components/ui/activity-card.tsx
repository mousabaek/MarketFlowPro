import { Activity, Platform, Workflow } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, DollarSign, PlusCircle, Info } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
  platform?: Platform;
  workflow?: Workflow;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  // Function to get activity icon based on type
  const getActivityIcon = () => {
    switch(activity.type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case "revenue":
        return <DollarSign className="h-6 w-6 text-green-500" />;
      case "system":
        return <PlusCircle className="h-6 w-6 text-primary" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  // Function to get badge class based on activity type
  const getBadgeClass = () => {
    switch(activity.type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-amber-100 text-amber-800";
      case "revenue":
        return "bg-green-100 text-green-800";
      case "system":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get badge text based on activity type
  const getBadgeText = () => {
    switch(activity.type) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      case "warning":
        return "Warning";
      case "revenue":
        return "Revenue";
      case "system":
        return "System";
      default:
        return activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
    }
  };

  // Calculate time ago for activity
  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(timestamp).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return "just now";
    } else if (diffMin < 60) {
      return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(timestamp);
    }
  };

  return (
    <li className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
          {getActivityIcon()}
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500">
              {getTimeAgo(activity.timestamp)}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {activity.description}
          </p>
          <div className="mt-2 flex">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getBadgeClass()}`}>
              {getBadgeText()}
            </span>
            {activity.workflowId && (
              <span className="ml-2 text-xs text-gray-500">
                {activity.data?.workflowName || `Workflow #${activity.workflowId}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <li className="p-4 text-center text-gray-500">No recent activities</li>
        )}
      </ul>
    </div>
  );
}
