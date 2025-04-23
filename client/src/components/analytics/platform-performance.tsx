import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from '@/lib/date-utils';

interface PlatformData {
  platformId: number;
  platformName: string;
  totalEarnings: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  lastSynced: string | null;
  healthStatus: string;
  successRate: number;
}

interface EarningsByDay {
  date: string;
  [platform: string]: string | number;
}

const PlatformPerformance = () => {
  const [period, setPeriod] = React.useState('last30days');
  const [chartType, setChartType] = React.useState('earnings');
  
  const { data: platformData, isLoading: loadingPlatforms, error: platformError } = useQuery({
    queryKey: ['/api/reports/platforms/performance', period],
    queryFn: () => fetch(`/api/reports/platforms/performance?period=${period}`).then(res => res.json()),
  });
  
  const { data: earningsData, isLoading: loadingEarnings, error: earningsError } = useQuery({
    queryKey: ['/api/reports/platforms/earnings-over-time', period],
    queryFn: () => fetch(`/api/reports/platforms/earnings-over-time?period=${period}`).then(res => res.json()),
  });
  
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };
  
  // Process platform data for the table view
  const getPlatformData = (): PlatformData[] => {
    if (!platformData || !platformData.platforms || !Array.isArray(platformData.platforms)) return [];
    return platformData.platforms;
  };
  
  // Process earnings by day for line chart
  const getEarningsByDayData = (): EarningsByDay[] => {
    if (!earningsData || !earningsData.earningsByDay || !Array.isArray(earningsData.earningsByDay)) return [];
    return earningsData.earningsByDay;
  };
  
  // Get unique platform names for chart
  const getPlatformNames = (): string[] => {
    const platformData = getPlatformData();
    const platformNames = platformData.map(platform => platform.platformName);
    return [...new Set(platformNames)];
  };
  
  // Generate random but consistent colors for each platform
  const getColorForPlatform = (platformName: string): string => {
    // Simple hash function to get consistent colors based on platform name
    let hash = 0;
    for (let i = 0; i < platformName.length; i++) {
      hash = platformName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // To get a color in the hue range (avoid too light/dark colors)
    const hue = ((hash % 360) + 360) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };
  
  // Format percentage for display
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };
  
  const isLoading = loadingPlatforms || loadingEarnings;
  const hasError = platformError || earningsError;
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>Earnings and metrics across connected platforms</CardDescription>
        </div>
        <div className="flex space-x-2">
          <div className="space-x-2 hidden md:flex">
            <Button 
              variant={chartType === 'earnings' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setChartType('earnings')}
            >
              Earnings
            </Button>
            <Button 
              variant={chartType === 'tasks' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setChartType('tasks')}
            >
              Tasks
            </Button>
          </div>
          
          <Select 
            value={chartType} 
            onValueChange={setChartType} 
            className="md:hidden"
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="earnings">Earnings</SelectItem>
              <SelectItem value="tasks">Tasks</SelectItem>
            </SelectContent>
          </Select>
          
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
        ) : hasError ? (
          <div className="flex justify-center items-center h-80 text-destructive">
            Error loading platform performance data
          </div>
        ) : (
          <div className="space-y-8">
            {/* Earnings/Tasks Over Time Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getEarningsByDayData()}
                  margin={{ top: 10, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    tickFormatter={(value) => 
                      chartType === 'earnings' 
                        ? `$${value}` 
                        : value.toString()
                    }
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (chartType === 'earnings') {
                        return [formatCurrency(value as number), name];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => formatDate(label, false)}
                  />
                  <Legend />
                  {getPlatformNames().map((platform) => (
                    <Line
                      key={platform}
                      type="monotone"
                      dataKey={chartType === 'earnings' ? `${platform}_earnings` : `${platform}_tasks`}
                      name={platform}
                      stroke={getColorForPlatform(platform)}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Platform metrics table */}
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] table-auto text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="h-10 px-4 text-left font-medium">Platform</th>
                      <th className="h-10 px-4 text-left font-medium">Earnings</th>
                      <th className="h-10 px-4 text-left font-medium">Tasks</th>
                      <th className="h-10 px-4 text-left font-medium">Success Rate</th>
                      <th className="h-10 px-4 text-left font-medium">Health Status</th>
                      <th className="h-10 px-4 text-left font-medium">Last Synced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPlatformData().length > 0 ? (
                      getPlatformData().map((platform) => (
                        <tr key={platform.platformId} className="border-b">
                          <td className="p-4 font-medium">{platform.platformName}</td>
                          <td className="p-4">{formatCurrency(platform.totalEarnings)}</td>
                          <td className="p-4">
                            {platform.completedTasks}/{platform.totalTasks}
                            <span className="text-xs text-muted-foreground ml-1">
                              ({platform.pendingTasks} pending)
                            </span>
                          </td>
                          <td className="p-4">
                            <div 
                              className={`text-sm ${
                                platform.successRate > 75 ? 'text-green-500' :
                                platform.successRate > 50 ? 'text-yellow-500' :
                                'text-red-500'
                              }`}
                            >
                              {formatPercentage(platform.successRate)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div 
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                platform.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                                platform.healthStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {platform.healthStatus.charAt(0).toUpperCase() + platform.healthStatus.slice(1)}
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {platform.lastSynced ? formatDate(platform.lastSynced, true) : 'Never'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                          No platform data available for this period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlatformPerformance;