import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface WorkflowMetrics {
  workflowId: number;
  workflowName: string;
  platformId: number;
  platformName: string;
  taskCount: number;
  successfulTasks: number;
  failedTasks: number;
  pendingTasks: number;
  successRate: number;
  revenue: string;
  lastRun: string | null;
}

const WorkflowPerformance = () => {
  const [period, setPeriod] = React.useState('last30days');
  const [viewMode, setViewMode] = React.useState('chart');
  
  const { data: workflows, isLoading, error } = useQuery({
    queryKey: ['/api/reports/workflows/performance', period],
    queryFn: () => fetch(`/api/reports/workflows/performance?period=${period}`).then(res => res.json()),
  });

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  const getWorkflowData = (): WorkflowMetrics[] => {
    if (!workflows || !Array.isArray(workflows)) return [];
    return workflows;
  };
  
  // Format data for the chart
  const getChartData = () => {
    if (!workflows || !Array.isArray(workflows)) return [];
    
    // Only show the top 10 workflows by success rate for the chart
    return workflows
      .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
      .slice(0, 10)
      .map(workflow => ({
        name: workflow.workflowName.length > 15 
          ? workflow.workflowName.substring(0, 15) + '...' 
          : workflow.workflowName,
        successRate: workflow.successRate,
        revenue: parseFloat(workflow.revenue),
        tasks: workflow.taskCount
      }));
  };
  
  const getStatusBadge = (successRate: number) => {
    if (successRate >= 80) return <Badge className="bg-green-500">High</Badge>;
    if (successRate >= 50) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge variant="destructive">Low</Badge>;
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Workflow Performance</CardTitle>
          <CardDescription>Success rates and revenue by workflow</CardDescription>
        </div>
        <div className="flex space-x-2">
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
          
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chart">Chart</SelectItem>
              <SelectItem value="table">Table</SelectItem>
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
            Error loading workflow performance data
          </div>
        ) : viewMode === 'chart' ? (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--secondary))" />
                <Tooltip formatter={(value, name) => {
                  if (name === 'revenue') return [`$${value}`, 'Revenue'];
                  if (name === 'successRate') return [`${value}%`, 'Success Rate'];
                  if (name === 'tasks') return [value, 'Tasks'];
                  return [value, name];
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="successRate" name="Success Rate (%)" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Last Run</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getWorkflowData().length > 0 ? (
                  getWorkflowData().map((workflow) => (
                    <TableRow key={workflow.workflowId}>
                      <TableCell className="font-medium">{workflow.workflowName}</TableCell>
                      <TableCell>{workflow.platformName}</TableCell>
                      <TableCell>
                        {workflow.taskCount} 
                        <span className="text-xs text-muted-foreground ml-1">
                          ({workflow.successfulTasks}/{workflow.failedTasks}/{workflow.pendingTasks})
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{workflow.successRate}%</span>
                          {getStatusBadge(workflow.successRate)}
                        </div>
                      </TableCell>
                      <TableCell>${workflow.revenue}</TableCell>
                      <TableCell>{formatDate(workflow.lastRun)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No workflow performance data available for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {getWorkflowData().length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                Tasks column shows: Total (Successful/Failed/Pending)
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowPerformance;