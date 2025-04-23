import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import EarningsChart from '@/components/analytics/earnings-chart';
import PlatformPerformance from '@/components/analytics/platform-performance';
import WorkflowPerformance from '@/components/analytics/workflow-performance';
import SystemOverview from '@/components/analytics/system-overview';
import AdminReports from '@/components/analytics/admin-reports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { Redirect } from 'wouter';

const AnalyticsPage = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
      <p className="text-muted-foreground mb-6">Monitor your performance and earnings across all platforms</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 sm:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Quick summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Subscription Status</CardTitle>
                <CardDescription>Your current plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {user.subscriptionPlan ? user.subscriptionPlan : "No active subscription"}
                </div>
                <p className="text-muted-foreground">
                  {user.subscriptionStatus === 'active' 
                    ? `Active until ${new Date(user.subscriptionEndDate).toLocaleDateString()}` 
                    : "Start a subscription to access premium features"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Balance</CardTitle>
                <CardDescription>Current account balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${parseFloat(user.balance || '0').toFixed(2)}</div>
                <p className="text-muted-foreground">
                  Pending: ${parseFloat(user.pendingBalance || '0').toFixed(2)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Workflow Limit</CardTitle>
                <CardDescription>Your plan's workflow limit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.maxWorkflows || 'Unlimited'}</div>
                <p className="text-muted-foreground">
                  {user.subscriptionStatus === 'active' 
                    ? "Upgrade to increase your limit" 
                    : "Subscribe to create more workflows"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* System overview */}
          <SystemOverview />
          
          {/* Earnings preview */}
          <EarningsChart />
        </TabsContent>
        
        <TabsContent value="earnings" className="space-y-6">
          <EarningsChart />
          <PlatformPerformance />
        </TabsContent>
        
        <TabsContent value="platforms" className="space-y-6">
          <PlatformPerformance />
          {/* Platform details can go here */}
        </TabsContent>
        
        <TabsContent value="workflows" className="space-y-6">
          <WorkflowPerformance />
          {/* Workflow details can go here */}
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="admin" className="space-y-6">
            <AdminReports />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;