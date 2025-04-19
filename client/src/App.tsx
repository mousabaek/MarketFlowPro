import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Workflows from "@/pages/workflows";
import Opportunities from "@/pages/opportunities";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { useState } from "react";

function Router() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:flex md:flex-col md:w-64" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <MobileHeader 
          className="md:hidden" 
          onMenuToggle={toggleMobileMenu} 
          isMenuOpen={isMobileMenuOpen}
        />
        
        {/* Mobile Menu (conditionally rendered) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white w-full border-b border-gray-200">
            <Sidebar className="flex flex-col" isMobile={true} onNavClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/workflows" component={Workflows} />
            <Route path="/opportunities" component={Opportunities} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/settings" component={Settings} />
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
