import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
import { WebSocketProvider } from "./components/websocket-provider";
import { JoinNotification } from "./components/collaboration/join-notification";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
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

// Admin route component with role check
function AdminRoute({ component: Component }: { component: () => React.JSX.Element }) {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  // Get the current route to conditionally render layouts
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Auth route should render without any layout
  if (location === "/auth" || location === "/login" || location === "/signup") {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/login">
          <Redirect to="/auth" />
        </Route>
        <Route path="/signup">
          <Redirect to="/auth" />
        </Route>
      </Switch>
    );
  }
  
  // Admin route has special access for owner only
  if (location === "/admin" || location.startsWith("/admin/")) {
    return (
      <ProtectedRoute path="/admin" component={() => (
        <ProfessionalLayout>
          <AdminRoute component={AdminDashboard} />
        </ProfessionalLayout>
      )} />
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

  // Routes that use the professional layout - all protected now
  const professionalRoutes = (
    <Switch>
      <ProtectedRoute path="/" component={ProfessionalDashboard} />
      <ProtectedRoute path="/workflows" component={Workflows} />
      <ProtectedRoute path="/connections" component={Connections} />
      <ProtectedRoute path="/payments" component={PaymentsPage} />
      <ProtectedRoute path="/platforms/:id" component={PlatformDetails} />
      <ProtectedRoute path="/amazon-associates/:id" component={AmazonAssociatesPage} />
      <ProtectedRoute path="/etsy-platform/:id" component={EtsyPlatform} />
      <ProtectedRoute path="/clickbank-platform/:id" component={ClickBankPlatform} />
      <ProtectedRoute path="/opportunity-matcher" component={OpportunityMatcherPage} />
    </Switch>
  );

  // Routes that use the original layout
  const originalRoutes = (
    <Switch>
      <ProtectedRoute path="/original" component={Dashboard} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/themes" component={Themes} />
      <Route path="/showcase" component={ComponentShowcase} />
      <Route path="/websocket-test" component={WebSocketTestPage} />
      <ProtectedRoute path="/collaboration" component={CollaborationPage} />
      <ProtectedRoute path="/story-generator" component={StoryGeneratorPage} />
      <Route component={NotFound} />
    </Switch>
  );

  // Return the router wrapped with the appropriate layout based on route
  if (useProfessionalLayout) {
    return <ProfessionalLayout>{professionalRoutes}</ProfessionalLayout>;
  }
  
  return <AppLayout>{originalRoutes}</AppLayout>;
}

function AppWithProviders() {
  const { user } = useAuth();
  
  // Create WebSocket user info from authentication data
  const wsUserInfo = user ? {
    userId: `user-${user.id}`,
    userName: user.username,
    avatar: ""
  } : {
    userId: `guest-${Math.random().toString(36).substring(2, 8)}`,
    userName: "Guest User",
    avatar: ""
  };

  return (
    <WebSocketProvider initialUserInfo={wsUserInfo}>
      <TooltipProvider>
        <Toaster />
        <JoinNotification />
        <Router />
      </TooltipProvider>
    </WebSocketProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppWithProviders />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
