import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Bell, 
  MessageSquare, 
  Search, 
  Menu, 
  ChevronDown,
  HelpCircle,
  Settings as SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WolfLogo } from "./wolf-logo";
import { ThemeToggle } from "./theme-toggle";

export function ProfessionalHeader() {
  const [location, setLocation] = useLocation();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when search is activated
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        {/* Logo and Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center space-x-2" onClick={() => setLocation("/")} style={{cursor: "pointer"}}>
            <WolfLogo className="h-7 w-7 text-primary" />
            <span className="hidden text-xl font-bold md:inline-block">Wolf Auto Marketer</span>
            <span className="text-xl font-bold md:hidden">WAM</span>
          </div>
        </div>

        {/* Center Navigation - Hidden on Mobile */}
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          <a 
            href="/"
            className={`transition-colors hover:text-primary ${location === "/" ? "text-primary" : "text-foreground/60"}`}
          >
            Dashboard
          </a>
          <a 
            href="/workflows"
            className={`transition-colors hover:text-primary ${location === "/workflows" ? "text-primary" : "text-foreground/60"}`}
          >
            Workflows
          </a>
          <a 
            href="/opportunity-matcher"
            className={`transition-colors hover:text-primary ${location === "/opportunity-matcher" ? "text-primary" : "text-foreground/60"}`}
          >
            Find Opportunities
          </a>
          <a 
            href="/connections"
            className={`transition-colors hover:text-primary ${location === "/connections" ? "text-primary" : "text-foreground/60"}`}
          >
            Connections
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-1 text-foreground/60 hover:text-primary">
                More <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setLocation("/amazon-associates/1")}>
                Amazon Associates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/etsy-platform/1")}>
                Etsy Platform
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/clickbank-platform/1")}>
                ClickBank
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div 
            ref={searchContainerRef}
            className={`relative hidden md:block ${isSearchActive ? "w-64" : "w-9"} transition-all duration-300`}
          >
            {isSearchActive ? (
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search opportunities..."
                  className="w-full rounded-full border-none bg-muted pl-8 pr-4 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setIsSearchActive(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <p className="text-sm font-medium">New opportunity matched!</p>
                  <p className="text-xs text-muted-foreground">A new project on Freelancer.com matches your skills</p>
                  <p className="text-xs text-primary">2 minutes ago</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <p className="text-sm font-medium">Amazon API connection restored</p>
                  <p className="text-xs text-muted-foreground">Your Amazon Associates API is now connected</p>
                  <p className="text-xs text-primary">1 hour ago</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                  <p className="text-sm font-medium">Workflow completed</p>
                  <p className="text-xs text-muted-foreground">Automated response workflow has completed successfully</p>
                  <p className="text-xs text-primary">3 hours ago</p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm font-medium text-primary">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages */}
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Messages</span>
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              2
            </span>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  JD
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/themes")}>
                Appearance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}