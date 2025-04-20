import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Platform, Workflow, Activity } from "@shared/schema";
import { WorkflowCard } from "@/components/ui/workflow-card";
import { PlatformCard } from "@/components/ui/platform-card";
import { ActivityList } from "@/components/ui/activity-card";
import { MetricCard } from "@/components/ui/metric-card";
import { WorkflowBuilder } from "@/components/ui/workflow-builder";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  RefreshCw, 
  PlusCircle,
  BarChart,
  ChartGantt, 
  CheckSquare,
  PieChart 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { toast } = useToast();
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7");
  const [isWorkflowBuilderOpen, setIsWorkflowBuilderOpen] = useState(false);
  
  // Fetch platforms
  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });
  
  // Fetch workflows
  const { data: workflows = [], isLoading: isLoadingWorkflows } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });
  
  // Fetch activities
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });
  
  // Calculate metrics
  const calculateMetrics = () => {
    let totalRevenue = 0;
    let activeWorkflows = 0;
    let tasksCompleted = 0;
    let successRateSum = 0;
    let successRateCount = 0;
    
    workflows.forEach(workflow => {
      totalRevenue += workflow.revenue;
      if (workflow.status === "active") activeWorkflows++;
      tasksCompleted += (workflow.stats?.runs || 0);
      if (workflow.successRate) {
        successRateSum += workflow.successRate;
        successRateCount++;
      }
    });
    
    const avgSuccessRate = successRateCount > 0 ? (successRateSum / successRateCount).toFixed(1) : "0";
    
    return {
      totalRevenue: formatCurrency(totalRevenue / 100),
      activeWorkflows,
      tasksCompleted,
      avgSuccessRate: `${avgSuccessRate}%`
    };
  };
  
  const metrics = calculateMetrics();
  
  // Filter workflows by platform
  const filteredWorkflows = workflows.filter(workflow => {
    if (platformFilter === "all") return true;
    const platformId = parseInt(platformFilter);
    return workflow.platformId === platformId;
  });
  
  // Handle platform refresh
  const handlePlatformRefresh = (platform: Platform) => {
    toast({
      title: "Refreshing platform",
      description: `Syncing ${platform.name} data...`
    });
  };
  
  // Handle platform settings
  const handlePlatformSettings = (platform: Platform) => {
    toast({
      title: "Platform settings",
      description: `Opening settings for ${platform.name}...`
    });
  };

  return (
    <div className="mt-16 lg:mt-0 pb-8">
      {/* Dashboard Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500">Overview of your automation workflows</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button onClick={() => setIsWorkflowBuilderOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Revenue"
          value={metrics.totalRevenue}
          changeText="12.5% from last month"
          changeType="increase"
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Active Workflows"
          value={metrics.activeWorkflows}
          changeText="3 new this week"
          changeType="increase"
          icon={<ChartGantt className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Tasks Completed"
          value={metrics.tasksCompleted}
          changeText="24% from last week"
          changeType="increase"
          icon={<CheckSquare className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Success Rate"
          value={metrics.avgSuccessRate}
          changeText="1.3% from yesterday"
          changeType="decrease"
          icon={<PieChart className="h-5 w-5 text-primary" />}
        />
      </div>
      
      {/* Active Workflows */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Active Workflows</h3>
          <div className="flex items-center space-x-2">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All platforms</SelectItem>
                {platforms.map(platform => (
                  <SelectItem key={platform.id} value={platform.id.toString()}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoadingWorkflows ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-border h-48 animate-pulse" />
            ))}
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
            <ChartGantt className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No workflows found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new workflow</p>
            <div className="mt-6">
              <Button onClick={() => setIsWorkflowBuilderOpen(true)}>
                Create Workflow
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredWorkflows.map(workflow => {
              const platform = platforms.find(p => p.id === workflow.platformId);
              if (!platform) return null;
              
              return (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  platform={platform}
                />
              );
            })}
          </div>
        )}
      </div>
      
      {/* Platform Connections */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Platform Connections</h3>
          <Button variant="ghost" className="text-primary" onClick={() => setIsWorkflowBuilderOpen(true)}>
            <PlusCircle className="mr-1 h-4 w-4" /> Add Connection
          </Button>
        </div>
        
        {platforms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
            <BarChart className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No platforms connected</h3>
            <p className="mt-1 text-sm text-gray-500">Connect to platforms to start creating workflows</p>
            <div className="mt-6">
              <Button onClick={() => setIsWorkflowBuilderOpen(true)}>
                Connect Platform
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map(platform => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onSettings={handlePlatformSettings}
                onRefresh={handlePlatformRefresh}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <Button variant="ghost" className="text-gray-600">
            View all
          </Button>
        </div>
        
        {isLoadingActivities ? (
          <div className="bg-white rounded-lg shadow-sm border border-border animate-pulse h-64" />
        ) : activities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-medium text-gray-900">No recent activities</h3>
            <p className="mt-1 text-sm text-gray-500">Activities will appear here once your workflows start running</p>
          </div>
        ) : (
          <ActivityList activities={activities} />
        )}
      </div>
      
      {/* Workflow Builder Dialog */}
      <WorkflowBuilder 
        isOpen={isWorkflowBuilderOpen} 
        onClose={() => setIsWorkflowBuilderOpen(false)} 
      />
    </div>
  );
}
