import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  BarChart3, 
  TrendingUp, 
  BellRing, 
  DollarSign, 
  ShoppingCart, 
  Store, 
  Brain, 
  Link,
  Search,
  Clock,
  ArrowRightCircle,
  Plus,
  Wifi
} from "lucide-react";
import WebSocketStatus from "@/components/websocket-status";
import { Platform } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ProfessionalCard,
  ProfessionalMetricCard,
  ProfessionalActionCard,
} from "@/components/ui/professional-card";

export default function ProfessionalDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch platforms
  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your workflow performance and connect with opportunities.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex gap-2">
            <Clock className="h-4 w-4" />
            View Activity
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Connection
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="analytics" className="hidden lg:block">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ProfessionalMetricCard
              title="Total Revenue"
              value="$1,284.56"
              description="Last 30 days"
              trend={{ value: 12.5, isPositive: true }}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <ProfessionalMetricCard
              title="Active Workflows"
              value="24"
              description="6 running now"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <ProfessionalMetricCard
              title="New Opportunities"
              value="37"
              description="Last 7 days"
              trend={{ value: 8.3, isPositive: true }}
              icon={<BellRing className="h-4 w-4" />}
            />
            <ProfessionalMetricCard
              title="Conversion Rate"
              value="8.7%"
              description="Up from 7.2%"
              trend={{ value: 1.5, isPositive: true }}
              icon={<BarChart3 className="h-4 w-4" />}
            />
          </div>
          
          {/* Recent Activities */}
          <ProfessionalCard 
            title="Recent Activities" 
            description="Your latest automations and activities"
            className="col-span-2"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Amazon Associates workflow completed</p>
                    <Badge variant="outline">Amazon</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generated 12 product recommendations for "home office equipment"
                  </p>
                  <p className="text-xs text-muted-foreground">30 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                  <Store className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Etsy API connection updated</p>
                    <Badge variant="outline">Etsy</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Successfully reconnected to Etsy API with updated credentials
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 rounded-lg border p-4">
                <div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">AI analysis completed</p>
                    <Badge variant="outline">Opportunity Matcher</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Found 8 new opportunities matching your criteria on Freelancer.com
                  </p>
                  <p className="text-xs text-muted-foreground">Yesterday at 4:23 PM</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 text-primary hover:text-primary"
                onClick={() => setLocation("/history")}
              >
                View all activities
                <ArrowRightCircle className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </ProfessionalCard>
          
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ProfessionalActionCard
              title="Find Opportunities"
              description="Let AI find the perfect matches for you"
              icon={<Search className="h-6 w-6" />}
              onClick={() => setLocation("/opportunity-matcher")}
            />
            <ProfessionalActionCard
              title="Manage Workflows"
              description="Create and monitor your automations"
              icon={<TrendingUp className="h-6 w-6" />}
              onClick={() => setLocation("/workflows")}
            />
            <ProfessionalActionCard
              title="Add New Connection"
              description="Connect to more platforms and services"
              icon={<Link className="h-6 w-6" />}
              onClick={() => setLocation("/connections")}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="opportunities" className="space-y-4">
          <ProfessionalCard 
            title="Matched Opportunities" 
            description="AI-powered opportunity recommendations"
          >
            <p className="text-muted-foreground pb-4">
              These opportunities have been matched to your skills and preferences.
            </p>
            
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex flex-col gap-2 rounded-lg border p-4 hover:border-primary/50 cursor-pointer transition-all"
                  onClick={() => setLocation("/opportunity-matcher")}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">WordPress Website Development Project</h3>
                    <Badge>$750-1200</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Looking for an experienced WordPress developer to create a custom e-commerce website with WooCommerce integration.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="rounded-sm">Freelancer.com</Badge>
                    <Badge variant="outline" className="rounded-sm">WordPress</Badge>
                    <Badge variant="outline" className="rounded-sm">WooCommerce</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Posted 2 days ago</span>
                    <span className="text-primary font-medium">96% Match</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                className="gap-1 text-primary hover:text-primary"
                onClick={() => setLocation("/opportunity-matcher")}
              >
                View all opportunities
                <ArrowRightCircle className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </ProfessionalCard>
        </TabsContent>
        
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ProfessionalCard 
              title="Amazon Associates" 
              badge="Active"
              icon={<ShoppingCart className="h-5 w-5" />}
              onClick={() => setLocation("/amazon-associates/1")}
            >
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">Connected</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Earnings (30d)</p>
                    <p className="font-medium">$487.25</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clicks</p>
                    <p className="font-medium">1,248</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conversion</p>
                    <p className="font-medium">4.7%</p>
                  </div>
                </div>
              </div>
            </ProfessionalCard>
            
            <ProfessionalCard 
              title="ClickBank" 
              badge="Active"
              icon={<DollarSign className="h-5 w-5" />}
              onClick={() => setLocation("/clickbank-platform/1")}
            >
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">Connected</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Earnings (30d)</p>
                    <p className="font-medium">$652.80</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Products</p>
                    <p className="font-medium">12</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conversion</p>
                    <p className="font-medium">6.2%</p>
                  </div>
                </div>
              </div>
            </ProfessionalCard>
            
            <ProfessionalCard 
              title="Etsy Platform" 
              badge="Limited"
              badgeVariant="secondary"
              icon={<Store className="h-5 w-5" />}
              onClick={() => setLocation("/etsy-platform/1")}
            >
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">Limited Access</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Earnings (30d)</p>
                    <p className="font-medium">$145.12</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Products</p>
                    <p className="font-medium">8</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Updates</p>
                    <p className="font-medium text-amber-500">Action Needed</p>
                  </div>
                </div>
              </div>
            </ProfessionalCard>
          </div>
          
          <div className="text-center mt-4">
            <Button onClick={() => setLocation("/connections")}>
              <Plus className="mr-2 h-4 w-4" /> Add New Connection
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <ProfessionalCard title="Performance Analytics" description="Revenue and conversions over time">
            <div className="h-[300px] w-full flex items-center justify-center border rounded">
              <p className="text-muted-foreground">Analytics visualization would appear here</p>
            </div>
          </ProfessionalCard>
          
          {/* WebSocket Connection Status */}
          <ProfessionalCard 
            title="WebSocket Status" 
            description="Real-time connection monitor"
            icon={<Wifi className="h-5 w-5" />}
          >
            <WebSocketStatus />
          </ProfessionalCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}