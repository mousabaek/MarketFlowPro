import { useLocation } from "wouter";
import { 
  Link as LinkIcon, 
  BarChart2, 
  History, 
  Settings, 
  Target, 
  Brain, 
  Sparkles, 
  ShoppingCart, 
  Store, 
  DollarSign 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Platform } from "@shared/schema";
import { WolfLogo } from "./wolf-logo";
import { ThemeToggle } from "./theme-toggle";

export function Sidebar() {
  const [location] = useLocation();
  
  // Fetch platforms
  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });
  
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center">
            <WolfLogo className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-semibold text-primary">Wolf Auto Marketer</h1>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <li>
            <div 
              onClick={() => window.location.href = '/'}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                location === "/" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              <span>Dashboard</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => window.location.href = '/workflows'}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                location === "/workflows" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Workflows</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => window.location.href = '/connections'}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                location === "/connections" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
            >
              <LinkIcon className="mr-3 h-5 w-5" />
              <span>Connections</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => window.location.href = '/analytics'}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                location === "/analytics" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              <span>Analytics</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => window.location.href = '/opportunity-matcher'}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                location === "/opportunity-matcher" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
            >
              <Brain className="mr-3 h-5 w-5" />
              <span>Opportunity Matcher</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => window.location.href = '/history'}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                location === "/history" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
            >
              <History className="mr-3 h-5 w-5" />
              <span>History</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => window.location.href = '/settings'}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                location === "/settings" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
            >
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => window.location.href = '/themes'}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                location === "/themes" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
              }`}
            >
              <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>Themes</span>
            </div>
          </li>
        </ul>
        
        {/* Platform Integrations Section */}
        <div className="mt-8">
          <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Platform Integrations
          </h3>
          <ul className="mt-2 space-y-1">
            <li>
              <div 
                onClick={() => window.location.href = '/amazon-associates/1'}
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  location.includes("/amazon-associates") ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                }`}
              >
                <ShoppingCart className="mr-3 h-4 w-4" />
                <span className="text-sm">Amazon Associates</span>
              </div>
            </li>
            <li>
              <div 
                onClick={() => window.location.href = '/etsy-platform/1'}
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  location.includes("/etsy-platform") ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                }`}
              >
                <Store className="mr-3 h-4 w-4" />
                <span className="text-sm">Etsy Platform</span>
              </div>
            </li>
            <li>
              <div 
                onClick={() => window.location.href = '/clickbank-platform/1'}
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  location.includes("/clickbank-platform") ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                }`}
              >
                <DollarSign className="mr-3 h-4 w-4" />
                <span className="text-sm">ClickBank</span>
              </div>
            </li>
          </ul>
        </div>

        {platforms.length > 0 && (
          <div className="mt-8">
            <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Connected Platforms
            </h3>
            <ul className="mt-2 space-y-1">
              {platforms.map((platform) => (
                <li 
                  key={platform.id} 
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted"
                  onClick={() => window.location.href = `/platforms/${platform.id}`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    platform.status === "connected" ? "bg-green-500" : 
                    platform.status === "limited" ? "bg-amber-500" : "bg-red-500"
                  }`}></div>
                  <span className="text-sm">{platform.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <span>JD</span>
            </div>
            <div>
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-muted-foreground">john@example.com</div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
