import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
import { WebSocketProvider } from "./components/websocket-provider";
import { Header } from "./components/header";
import { JoinNotification } from "./components/collaboration/join-notification";
import AppLayout from "./layouts/app-layout";
import ProfessionalLayout from "./layouts/professional-layout";
import Dashboard from "./pages/dashboard";
import ProfessionalDashboard from "./pages/professional-dashboard";
import Workflows from "./pages/workflows";
import Connections from "./pages/connections";
import PlatformDetails from "./pages/platform-details";
import Settings from "./pages/settings";
import NotFound from "./pages/not-found";
import Themes from "./pages/themes";
import ComponentShowcase from "./pages/component-showcase";
import OpportunityMatcherPage from "./pages/opportunity-matcher";
import AmazonAssociatesPage from "./pages/amazon-associates";
import EtsyPlatform from "./pages/etsy-platform";
import ClickBankPlatform from "./pages/clickbank-platform";
import AuthPage from "./pages/auth-page";
import PaymentsPage from "./pages/payments";
import AdminDashboard from "./pages/admin-dashboard";
import WebSocketTestPage from "./pages/websocket-test";
import CollaborationPage from "./pages/collaboration";
import StoryGeneratorPage from "./pages/story-generator";

function Router() {
  // Get the current route to conditionally render layouts
  const [location] = useLocation();
  
  // Auth route should render without any layout
  if (location === "/auth" || location === "/login" || location === "/signup") {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={AuthPage} />
        <Route path="/signup" component={AuthPage} />
      </Switch>
    );
  }
  
  // Admin route has special access for owner only
  if (location === "/admin" || location.startsWith("/admin/")) {
    return (
      <ProfessionalLayout>
        <AdminDashboard />
      </ProfessionalLayout>
    );
  }
  
  // Use the professional layout for specific routes
  const useProfessionalLayout = 
    location === "/" || 
    location === "/professional" ||
    location === "/workflows" ||
    location === "/connections" ||
    location === "/payments" ||
    location === "/opportunity-matcher" ||
    location.includes("/amazon-associates") ||
    location.includes("/etsy-platform") ||
    location.includes("/clickbank-platform");

  // Routes that use the professional layout
  const professionalRoutes = (
    <Switch>
      <Route path="/" component={ProfessionalDashboard} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/connections" component={Connections} />
      <Route path="/payments" component={PaymentsPage} />
      <Route path="/platforms/:id" component={PlatformDetails} />
      <Route path="/amazon-associates/:id" component={AmazonAssociatesPage} />
      <Route path="/etsy-platform/:id" component={EtsyPlatform} />
      <Route path="/clickbank-platform/:id" component={ClickBankPlatform} />
      <Route path="/opportunity-matcher" component={OpportunityMatcherPage} />
    </Switch>
  );

  // Routes that use the original layout
  const originalRoutes = (
    <Switch>
      <Route path="/original" component={Dashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/themes" component={Themes} />
      <Route path="/showcase" component={ComponentShowcase} />
      <Route path="/websocket-test" component={WebSocketTestPage} />
      <Route path="/collaboration" component={CollaborationPage} />
      <Route path="/story-generator" component={StoryGeneratorPage} />
      <Route component={NotFound} />
    </Switch>
  );

  // Return the router wrapped with the appropriate layout based on route
  if (useProfessionalLayout) {
    return <ProfessionalLayout>{professionalRoutes}</ProfessionalLayout>;
  }
  
  return <AppLayout>{originalRoutes}</AppLayout>;
}

function App() {
  // Mock user info for demo purposes - in a real app, this would come from auth context
  const mockUser = {
    userId: `user-${Math.random().toString(36).substring(2, 8)}`,
    userName: "Demo User",
    avatar: ""
  };

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider initialUserInfo={mockUser}>
          <TooltipProvider>
            <Toaster />
            <JoinNotification />
            <Router />
          </TooltipProvider>
        </WebSocketProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
