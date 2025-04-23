import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, DollarSign, Check, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface UserMetric {
  userId: number;
  username: string;
  email: string;
  totalEarnings: string;
  commissions: string;
  activeWorkflows: number;
}

const AdminReports = () => {
  const [period, setPeriod] = React.useState('last30days');
  
  const { data: userMetrics, isLoading: loadingUsers, error: userError } = useQuery({
    queryKey: ['/api/admin/reports/users', period],
    queryFn: () => fetch(`/api/admin/reports/users?period=${period}`).then(res => res.json()),
  });
  
  const { data: platformEarnings, isLoading: loadingPlatforms, error: platformError } = useQuery({
    queryKey: ['/api/admin/reports/platforms/earnings', period],
    queryFn: () => fetch(`/api/admin/reports/platforms/earnings?period=${period}`).then(res => res.json()),
  });

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };
  
  // Format platform earnings for chart
  const getPlatformEarningsData = () => {
    if (!platformEarnings || !platformEarnings.platforms || !Array.isArray(platformEarnings.platforms)) {
      return [];
    }
    
    return platformEarnings.platforms.map(platform => ({
      name: platform.platformName,
      earnings: parseFloat(platform.earnings),
      commissions: parseFloat(platform.commissions),
      userCount: platform.userCount,
      workflowCount: platform.workflowCount
    }));
  };
  
  // Get user initials for avatar
  const getUserInitials = (username: string) => {
    if (!username) return '??';
    return username.substring(0, 2).toUpperCase();
  };
  
  // Calculate totals from the summary
  const getTotals = () => {
    if (!platformEarnings || !platformEarnings.summary) {
      return {
        totalEarnings: '0.00',
        totalCommissions: '0.00',
        totalPlatforms: 0,
        totalUsers: 0
      };
    }
    
    return platformEarnings.summary;
  };
  
  const totals = getTotals();
  
  return (
    <div className="space-y-6">
      {/* Admin dashboard title */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">Admin Analytics</h2>
        <p className="text-muted-foreground">Complete platform performance and revenue metrics</p>
      </div>
      
      {/* Header controls */}
      <div className="flex justify-end">
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
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <h3 className="text-2xl font-bold">${totals.totalEarnings}</h3>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Commissions</p>
                <h3 className="text-2xl font-bold">${totals.totalCommissions}</h3>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <Check className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <h3 className="text-2xl font-bold">{totals.totalUsers}</h3>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Platforms</p>
                <h3 className="text-2xl font-bold">{totals.totalPlatforms}</h3>
              </div>
              <div className="rounded-full bg-primary/20 p-3">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Platform earnings chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Earnings</CardTitle>
          <CardDescription>Revenue and commissions by platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPlatforms ? (
            <div className="flex justify-center items-center h-80">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : platformError ? (
            <div className="flex justify-center items-center h-80 text-destructive">
              Error loading platform earnings data
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={getPlatformEarningsData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === "earnings") return [`$${value}`, "Earnings"];
                      if (name === "commissions") return [`$${value}`, "Commissions"];
                      if (name === "userCount") return [value, "Users"];
                      if (name === "workflowCount") return [value, "Workflows"];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="earnings" name="Earnings" fill="hsl(var(--primary))" />
                  <Bar dataKey="commissions" name="Commissions" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Top users table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users</CardTitle>
          <CardDescription>Users ranked by earnings in selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : userError ? (
            <div className="flex justify-center items-center h-40 text-destructive">
              Error loading user metrics data
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Commissions</TableHead>
                  <TableHead>Active Workflows</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userMetrics && Array.isArray(userMetrics) && userMetrics.length > 0 ? (
                  userMetrics.map((user: UserMetric) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" alt={user.username} />
                            <AvatarFallback>{getUserInitials(user.username)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>${parseFloat(user.totalEarnings).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(user.commissions).toFixed(2)}</TableCell>
                      <TableCell>{user.activeWorkflows}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No user data available for this period
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;