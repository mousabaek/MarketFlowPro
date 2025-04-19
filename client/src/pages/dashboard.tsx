import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/stats-card";
import PlatformCard from "@/components/dashboard/platform-card";
import PerformanceChart from "@/components/dashboard/performance-chart";
import WorkflowCard from "@/components/dashboard/workflow-card";
import OpportunitiesTable from "@/components/dashboard/opportunities-table";
import { Activity, CheckCircle, LightbulbIcon, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatisticsWithChange, PlatformWithStats, WorkflowWithStats } from "@shared/schema";
import { useState } from "react";

export default function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery<StatisticsWithChange>({
    queryKey: ['/api/statistics'],
  });

  // Fetch platforms
  const { data: platforms, isLoading: platformsLoading } = useQuery<PlatformWithStats[]>({
    queryKey: ['/api/platforms'],
  });

  // Fetch revenue data
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['/api/statistics/revenue', chartPeriod],
    queryFn: async ({ queryKey }) => {
      const [_, period] = queryKey;
      const res = await fetch(`/api/statistics/revenue?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch revenue data');
      return res.json();
    }
  });

  // Fetch workflows
  const { data: workflows, isLoading: workflowsLoading } = useQuery<WorkflowWithStats[]>({
    queryKey: ['/api/workflows'],
  });

  // Fetch opportunities
  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/opportunities', { limit: 3, offset: 0 }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const searchParams = new URLSearchParams({
        limit: params.limit.toString(),
        offset: params.offset.toString()
      });
      
      const res = await fetch(`/api/opportunities?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch opportunities');
      return res.json();
    }
  });

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          
          <div className="mt-4 md:mt-0">
            <Button>
              <Plus className="h-5 w-5 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-10 w-10 rounded-md mb-4" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-7 w-20" />
            </Card>
          ))
        ) : (
          <>
            <StatsCard 
              title="Active Workflows"
              value={stats?.activeWorkflows || 0}
              change={stats?.activeWorkflowsChange || 0}
              icon={<Activity className="h-6 w-6 text-primary" />}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            
            <StatsCard 
              title="Tasks Completed"
              value={stats?.tasksCompleted || 0}
              change={stats?.tasksCompletedChange || 0}
              icon={<CheckCircle className="h-6 w-6 text-secondary" />}
              iconBg="bg-secondary/10"
              iconColor="text-secondary"
            />
            
            <StatsCard 
              title="Revenue Generated"
              value={stats?.revenue || "$0"}
              change={stats?.revenueChange || "0%"}
              icon={<DollarSign className="h-6 w-6 text-accent" />}
              iconBg="bg-accent/10"
              iconColor="text-accent"
            />
            
            <StatsCard 
              title="Opportunities Found"
              value={stats?.opportunitiesFound || 0}
              change={stats?.opportunitiesFoundChange || 0}
              icon={<LightbulbIcon className="h-6 w-6 text-indigo-600" />}
              iconBg="bg-indigo-100"
              iconColor="text-indigo-600"
            />
          </>
        )}
      </div>
      
      {/* Connected Platforms */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Connected Platforms</h2>
        
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {platformsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  
                  <div className="mt-4">
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))
            ) : platforms?.map((platform) => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
          
          <div className="px-5 py-3 bg-gray-50 text-right">
            <Button variant="ghost" className="text-primary">
              <Plus className="h-5 w-5 mr-1" />
              Add Platform
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Performance Chart */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h2>
        
        <Card>
          <div className="p-5">
            <PerformanceChart 
              data={revenueData} 
              isLoading={revenueLoading} 
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>
        </Card>
      </div>
      
      {/* Recent Workflows */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Your Workflows</h2>
          <Button variant="link" className="text-primary">View all</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workflowsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-16" />
                </div>
                
                <div className="mt-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                
                <div className="mt-4">
                  <Skeleton className="h-6 w-24" />
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </Card>
            ))
          ) : workflows?.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      </div>
      
      {/* Recent Opportunities */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Opportunities</h2>
          <Button variant="link" className="text-primary">View all</Button>
        </div>
        
        <OpportunitiesTable 
          opportunities={opportunitiesData?.opportunities} 
          pagination={opportunitiesData?.pagination}
          isLoading={opportunitiesLoading}
        />
      </div>
    </div>
  );
}
