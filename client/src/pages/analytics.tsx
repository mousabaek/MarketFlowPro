import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PerformanceChart from "@/components/dashboard/performance-chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#6366F1', '#34D399', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981'];

export default function Analytics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Fetch revenue data
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['/api/statistics/revenue', period],
    queryFn: async ({ queryKey }) => {
      const [_, selectedPeriod] = queryKey;
      const res = await fetch(`/api/statistics/revenue?period=${selectedPeriod}`);
      if (!res.ok) throw new Error('Failed to fetch revenue data');
      return res.json();
    }
  });
  
  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/statistics'],
  });
  
  // Calculate platform distribution
  const platformDistribution = stats?.platformStats ? 
    Object.entries(stats.platformStats).map(([key, value]: [string, any]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: parseFloat(value.revenue.replace('$', '').replace(',', ''))
    })) : [];
  
  // Calculate task completion status
  const getTaskCompletionData = () => {
    if (!stats) return [];
    
    // In a real app, this would come from the API
    return [
      { name: 'Completed', value: stats.tasksCompleted },
      { name: 'Failed', value: Math.round(stats.tasksCompleted * 0.15) },
      { name: 'Pending', value: Math.round(stats.tasksCompleted * 0.08) }
    ];
  };
  
  // Calculate opportunity status
  const getOpportunityStatusData = () => {
    if (!stats) return [];
    
    // In a real app, this would come from the API
    return [
      { name: 'Active', value: Math.round(stats.opportunitiesFound * 0.4) },
      { name: 'Pending', value: Math.round(stats.opportunitiesFound * 0.3) },
      { name: 'Completed', value: Math.round(stats.opportunitiesFound * 0.2) },
      { name: 'Missed', value: Math.round(stats.opportunitiesFound * 0.1) }
    ];
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          
          <div className="mt-4 md:mt-0">
            <Select value={period} onValueChange={(value: 'week' | 'month' | 'year') => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceChart 
            data={revenueData} 
            isLoading={revenueLoading} 
            period={period}
            onPeriodChange={setPeriod}
            showPeriodSelector={false}
          />
        </CardContent>
      </Card>
      
      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="mb-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {platformDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Workflows by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Clickbank', workflows: 5 },
                          { name: 'Fiverr', workflows: 4 },
                          { name: 'Upwork', workflows: 3 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="workflows" fill="#6366F1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Completion Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTaskCompletionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getTaskCompletionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats?.platformStats ? [
                          { name: 'Clickbank', tasks: stats.platformStats.clickbank.activeTasks },
                          { name: 'Fiverr', tasks: stats.platformStats.fiverr.activeTasks },
                          { name: 'Upwork', tasks: stats.platformStats.upwork.activeTasks }
                        ] : []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="tasks" fill="#34D399" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="opportunities" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getOpportunityStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getOpportunityStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Value by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats?.platformStats ? [
                          { name: 'Clickbank', value: parseInt(stats.platformStats.clickbank.revenue.replace(/[^0-9]/g, '')) },
                          { name: 'Fiverr', value: parseInt(stats.platformStats.fiverr.revenue.replace(/[^0-9]/g, '')) },
                          { name: 'Upwork', value: parseInt(stats.platformStats.upwork.revenue.replace(/[^0-9]/g, '')) }
                        ] : []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Bar dataKey="value" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
