import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Link as LinkIcon, BarChart2, History, Settings, Brain, Target, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Platform } from "@shared/schema";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Fetch platforms
  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });

  // Close menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <LinkIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold">AutoMarketer</h1>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                    <LinkIcon className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold">AutoMarketer</h1>
                </div>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  <li>
                    <Link href="/">
                      <a className={`flex items-center p-2 rounded-md ${
                        location === "/" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}>
                        <BarChart2 className="mr-3 h-5 w-5" />
                        <span>Dashboard</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/workflows">
                      <a className={`flex items-center p-2 rounded-md ${
                        location === "/workflows" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}>
                        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Workflows</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/connections">
                      <a className={`flex items-center p-2 rounded-md ${
                        location === "/connections" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}>
                        <LinkIcon className="mr-3 h-5 w-5" />
                        <span>Connections</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/analytics">
                      <a className={`flex items-center p-2 rounded-md ${
                        location === "/analytics" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}>
                        <BarChart2 className="mr-3 h-5 w-5" />
                        <span>Analytics</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/opportunity-matcher">
                      <a className={`flex items-center p-2 rounded-md ${
                        location === "/opportunity-matcher" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}>
                        <Brain className="mr-3 h-5 w-5" />
                        <span>Opportunity Matcher</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/history">
                      <a className={`flex items-center p-2 rounded-md ${
                        location === "/history" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}>
                        <History className="mr-3 h-5 w-5" />
                        <span>History</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings">
                      <a className={`flex items-center p-2 rounded-md ${
                        location === "/settings" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}>
                        <Settings className="mr-3 h-5 w-5" />
                        <span>Settings</span>
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/themes">
                      <a className={`flex items-center p-2 rounded-md ${
                        location === "/themes" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                      }`}>
                        <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span>Themes</span>
                      </a>
                    </Link>
                  </li>
                </ul>
                
                {platforms.length > 0 && (
                  <div className="mt-8">
                    <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Connected Platforms
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {platforms.map((platform) => (
                        <li key={platform.id} className="flex items-center p-2 text-sm">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            platform.status === "connected" ? "bg-green-500" : 
                            platform.status === "limited" ? "bg-amber-500" : "bg-red-500"
                          }`}></div>
                          <span>{platform.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </nav>
              
              <div className="p-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <span>JD</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">John Doe</div>
                    <div className="text-xs text-muted-foreground">john@example.com</div>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
