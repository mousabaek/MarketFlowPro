import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, CheckCircle, TrendingUp, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--destructive))',
  pending: 'hsl(var(--muted))',
  healthy: 'hsl(var(--success))',
  active: 'hsl(var(--primary))',
  inactive: 'hsl(var(--muted))'
};

const SystemOverview = () => {
  const [period, setPeriod] = React.useState('last30days');
  
  const { data: systemData, isLoading, error } = useQuery({
    queryKey: ['/api/reports/system/performance', period],
    queryFn: () => fetch(`/api/reports/system/performance?period=${period}`).then(res => res.json()),
  });

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };
  
  // Format tasks data for pie chart
  const getTasksChartData = () => {
    if (!systemData || !systemData.tasks) return [];
    
    return [
      { name: 'Successful', value: systemData.tasks.successful, color: COLORS.success },
      { name: 'Failed', value: systemData.tasks.failed, color: COLORS.error },
      { name: 'Pending', value: systemData.tasks.pending, color: COLORS.pending }
    ];
  };
  
  // Format platform health data for pie chart
  const getPlatformsChartData = () => {
    if (!systemData || !systemData.platforms) return [];
    
    return [
      { name: 'Healthy', value: systemData.platforms.healthy, color: COLORS.healthy },
      { name: 'Warning', value: systemData.platforms.warning, color: COLORS.warning },
      { name: 'Error', value: systemData.platforms.error, color: COLORS.error }
    ];
  };
  
  // Format workflow status data for pie chart
  const getWorkflowsChartData = () => {
    if (!systemData || !systemData.workflows) return [];
    
    return [
      { name: 'Active', value: systemData.workflows.active, color: COLORS.active },
      { name: 'Inactive', value: systemData.workflows.inactive, color: COLORS.inactive }
    ];
  };
  
  // Format activity types data for pie chart
  const getActivitiesChartData = () => {
    if (!systemData || !systemData.activities || !systemData.activities.byType) return [];
    
    const activityColors = {
      'system': COLORS.success,
      'user': COLORS.primary,
      'error': COLORS.error,
      'warning': COLORS.warning
    };
    
    return Object.entries(systemData.activities.byType).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: activityColors[type as keyof typeof activityColors] || COLORS.muted
    }));
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Platform health and performance metrics</CardDescription>
        </div>
        <div>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="thisMonth">This month</SelectItem>
              <SelectItem value="lastMonth">Last month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-80 text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error loading system overview data
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-primary/10">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-primary/20 p-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-xl font-bold">{systemData?.tasks?.successRate || 0}%</div>
                  <p className="text-sm text-muted-foreground">Tasks Success Rate</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/10">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-primary/20 p-2 mb-2">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-xl font-bold">{systemData?.workflows?.total || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Workflows</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/10">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-primary/20 p-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-xl font-bold">{systemData?.platforms?.healthy || 0}/{systemData?.platforms?.total || 0}</div>
                  <p className="text-sm text-muted-foreground">Healthy Platforms</p>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/10">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="rounded-full bg-primary/20 p-2 mb-2">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-xl font-bold">{systemData?.activities?.total || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Activities</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tasks chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Task Outcomes</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getTasksChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {getTasksChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Tasks']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Platform health chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Platform Health</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPlatformsChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => 
                          `${name}: ${value}`
                        }
                        labelLine={false}
                      >
                        {getPlatformsChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Platforms']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Workflow status chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Workflow Status</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getWorkflowsChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {getWorkflowsChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Workflows']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Activity types chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Activity Types</CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getActivitiesChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => 
                          `${name}: ${value}`
                        }
                        labelLine={false}
                      >
                        {getActivitiesChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Activities']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemOverview;