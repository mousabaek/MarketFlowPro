import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/layouts/app-layout";
import Dashboard from "@/pages/dashboard";
import Workflows from "@/pages/workflows";
import Connections from "@/pages/connections";
import PlatformDetails from "@/pages/platform-details";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Themes from "@/pages/themes";
import ComponentShowcase from "@/pages/component-showcase";
import OpportunityMatcherPage from "@/pages/opportunity-matcher";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/connections" component={Connections} />
      <Route path="/platforms/:id" component={PlatformDetails} />
      <Route path="/settings" component={Settings} />
      <Route path="/themes" component={Themes} />
      <Route path="/showcase" component={ComponentShowcase} />
      <Route path="/opportunity-matcher" component={OpportunityMatcherPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppLayout>
            <Router />
          </AppLayout>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
