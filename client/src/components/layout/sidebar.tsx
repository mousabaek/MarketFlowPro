import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  LightbulbIcon, 
  BarChart2, 
  Settings,
  Zap
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onNavClick?: () => void;
}

export default function Sidebar({ className, isMobile = false, onNavClick }: SidebarProps) {
  const [location] = useLocation();
  
  // Fetch user data for avatar
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/1'], // For demo purposes, hardcoded userId
  });
  
  const handleNavClick = () => {
    if (onNavClick) {
      onNavClick();
    }
  };

  return (
    <div className={cn("md:flex-col md:w-64 bg-white border-r border-gray-200", className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-semibold text-gray-900">AutoTasker</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <Link href="/">
          <a 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/" 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={handleNavClick}
          >
            <Home className="h-5 w-5 mr-3 text-gray-500" />
            Dashboard
          </a>
        </Link>
        
        <Link href="/workflows">
          <a 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/workflows" 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={handleNavClick}
          >
            <FileText className="h-5 w-5 mr-3 text-gray-500" />
            Workflows
          </a>
        </Link>
        
        <Link href="/opportunities">
          <a 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/opportunities" 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={handleNavClick}
          >
            <LightbulbIcon className="h-5 w-5 mr-3 text-gray-500" />
            Opportunities
          </a>
        </Link>
        
        <Link href="/analytics">
          <a 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/analytics" 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={handleNavClick}
          >
            <BarChart2 className="h-5 w-5 mr-3 text-gray-500" />
            Analytics
          </a>
        </Link>
        
        <Link href="/settings">
          <a 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/settings" 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={handleNavClick}
          >
            <Settings className="h-5 w-5 mr-3 text-gray-500" />
            Settings
          </a>
        </Link>
      </nav>
      
      {!isMobile && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            {userLoading ? (
              <>
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </>
            ) : (
              <>
                <Avatar>
                  <AvatarFallback>
                    {user?.fullName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
