// No need to import React with modern JSX transformer
import { useLocation } from 'wouter';
import { 
  Menu, 
  Search, 
  Bell, 
  UserCircle,
  Settings,
  HelpCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo } from './logo';
import { ThemeToggle } from './ui/theme-toggle';
import { WebSocketIndicator } from './websocket-indicator';

export function Header() {
  const [location, setLocation] = useLocation();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center justify-between gap-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => setLocation('/')}
          >
            <Logo className="h-9 w-auto" showText={false} />
            <span className="font-bold text-lg hidden md:inline-flex ml-2">
              Wolf Auto Marketer
            </span>
          </div>
        </div>
        
        {/* Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button 
            variant={location === '/' ? 'default' : 'ghost'}
            onClick={() => setLocation('/')}
            className="text-sm"
          >
            Dashboard
          </Button>
          
          <Button 
            variant={location === '/workflows' ? 'default' : 'ghost'}
            onClick={() => setLocation('/workflows')}
            className="text-sm"
          >
            Workflows
          </Button>
          
          <Button 
            variant={location === '/opportunity-matcher' ? 'default' : 'ghost'}
            onClick={() => setLocation('/opportunity-matcher')}
            className="text-sm"
          >
            Find Opportunities
          </Button>
          
          <Button 
            variant={location === '/connections' ? 'default' : 'ghost'}
            onClick={() => setLocation('/connections')}
            className="text-sm"
          >
            Connections
          </Button>
          
          <Button 
            variant={location === '/collaboration' ? 'default' : 'ghost'}
            onClick={() => setLocation('/collaboration')}
            className="text-sm"
          >
            Collaboration
          </Button>
        </nav>
        
        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
          </Button>
          
          <div className="hidden md:flex items-center border-l pl-2 ml-1">
            <WebSocketIndicator />
          </div>
          
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium text-sm">
                    AM
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/support')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}