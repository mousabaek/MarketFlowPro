import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/date-utils';

interface DailyEarnings {
  date: string;
  total: number;
  platformFees: number;
  userEarnings: number;
  withdrawals: number;
}

const EarningsChart = () => {
  const [period, setPeriod] = React.useState('last30days');
  const [displayMode, setDisplayMode] = useState('total'); // 'total', 'platform', 'net', 'withdrawals'
  
  const { data: earnings, isLoading, error } = useQuery({
    queryKey: ['/api/reports/earnings/daily', period],
    queryFn: () => fetch(`/api/reports/earnings/daily?period=${period}`).then(res => res.json()),
  });
  
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };
  
  // Format data for the chart
  const getChartData = (): DailyEarnings[] => {
    if (!earnings || !earnings.dailyEarnings || !Array.isArray(earnings.dailyEarnings)) return [];
    return earnings.dailyEarnings;
  };
  
  // Calculate summary data
  const getSummary = () => {
    if (!earnings || !earnings.summary) {
      return {
        totalEarnings: '0.00',
        platformFees: '0.00',
        netEarnings: '0.00',
        totalWithdrawals: '0.00',
        trend: 0
      };
    }
    
    return earnings.summary;
  };
  
  const summaryData = getSummary();
  
  // Calculate display data based on current mode
  const getDisplayMetrics = () => {
    switch (displayMode) {
      case 'platform':
        return {
          title: 'Platform Fees',
          value: formatCurrency(summaryData.platformFees),
          description: '20% commission on all earnings',
          color: 'text-orange-500',
          icon: <DollarSign className="h-5 w-5" />
        };
      case 'net':
        return {
          title: 'Net Earnings',
          value: formatCurrency(summaryData.netEarnings),
          description: 'After platform fees',
          color: 'text-emerald-500',
          icon: <TrendingUp className="h-5 w-5" />
        };
      case 'withdrawals':
        return {
          title: 'Withdrawals',
          value: formatCurrency(summaryData.totalWithdrawals),
          description: 'Total withdrawn amount',
          color: 'text-violet-500',
          icon: <TrendingDown className="h-5 w-5" />
        };
      case 'total':
      default:
        return {
          title: 'Total Earnings',
          value: formatCurrency(summaryData.totalEarnings),
          description: 'Gross earnings',
          color: 'text-primary',
          icon: <DollarSign className="h-5 w-5" />
        };
    }
  };
  
  const displayMetrics = getDisplayMetrics();
  
  // Generate the tooltip formatter based on display mode
  const getTooltipFormatter = (value: number, name: string) => {
    const formattedValue = formatCurrency(value);
    
    let displayName = name;
    if (name === 'total') displayName = 'Total Earnings';
    if (name === 'platformFees') displayName = 'Platform Fees';
    if (name === 'userEarnings') displayName = 'Net Earnings';
    if (name === 'withdrawals') displayName = 'Withdrawals';
    
    return [formattedValue, displayName];
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Earnings Analytics</CardTitle>
          <CardDescription>Your earnings over time and financial metrics</CardDescription>
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
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-80 text-destructive">
            Error loading earnings data
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Earnings Card */}
              <Card 
                className={`cursor-pointer ${displayMode === 'total' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setDisplayMode('total')}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                      <h3 className="text-2xl font-bold">{formatCurrency(summaryData.totalEarnings)}</h3>
                    </div>
                    <div className="rounded-full bg-primary/20 p-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Platform Fees Card */}
              <Card 
                className={`cursor-pointer ${displayMode === 'platform' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setDisplayMode('platform')}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Platform Fees</p>
                      <h3 className="text-2xl font-bold">{formatCurrency(summaryData.platformFees)}</h3>
                    </div>
                    <div className="rounded-full bg-orange-100 p-2">
                      <DollarSign className="h-4 w-4 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Net Earnings Card */}
              <Card 
                className={`cursor-pointer ${displayMode === 'net' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setDisplayMode('net')}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Net Earnings</p>
                      <h3 className="text-2xl font-bold">{formatCurrency(summaryData.netEarnings)}</h3>
                    </div>
                    <div className="rounded-full bg-emerald-100 p-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Withdrawals Card */}
              <Card 
                className={`cursor-pointer ${displayMode === 'withdrawals' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setDisplayMode('withdrawals')}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Withdrawals</p>
                      <h3 className="text-2xl font-bold">{formatCurrency(summaryData.totalWithdrawals)}</h3>
                    </div>
                    <div className="rounded-full bg-violet-100 p-2">
                      <TrendingDown className="h-4 w-4 text-violet-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Current Display Metric */}
            <div className="border p-6 rounded-lg bg-muted/20">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className={`rounded-full p-3 ${displayMetrics.color.replace('text-', 'bg-').replace('500', '100')}`}>
                    {displayMetrics.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{displayMetrics.title}</h3>
                    <p className="text-muted-foreground">{displayMetrics.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-3xl font-bold">{displayMetrics.value}</div>
                  {summaryData.trend > 0 ? (
                    <div className="text-emerald-500 flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>+{summaryData.trend}%</span>
                    </div>
                  ) : summaryData.trend < 0 ? (
                    <div className="text-red-500 flex items-center space-x-1">
                      <TrendingDown className="h-4 w-4" />
                      <span>{summaryData.trend}%</span>
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>0%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Earnings Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={getChartData()}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPlatform" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--orange-500, 30 100% 50%))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--orange-500, 30 100% 50%))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--emerald-500, 150 100% 50%))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--emerald-500, 150 100% 50%))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--violet-500, 270 100% 50%))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--violet-500, 270 100% 50%))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value, name) => getTooltipFormatter(value as number, name as string)}
                    labelFormatter={(label) => formatDate(label as string, false)}
                  />
                  
                  {/* Conditionally show the areas based on display mode */}
                  {displayMode === 'total' && (
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  )}
                  
                  {displayMode === 'platform' && (
                    <Area 
                      type="monotone" 
                      dataKey="platformFees" 
                      stroke="hsl(var(--orange-500, 30 100% 50%))" 
                      fillOpacity={1} 
                      fill="url(#colorPlatform)" 
                    />
                  )}
                  
                  {displayMode === 'net' && (
                    <Area 
                      type="monotone" 
                      dataKey="userEarnings" 
                      stroke="hsl(var(--emerald-500, 150 100% 50%))" 
                      fillOpacity={1} 
                      fill="url(#colorNet)" 
                    />
                  )}
                  
                  {displayMode === 'withdrawals' && (
                    <Area 
                      type="monotone" 
                      dataKey="withdrawals" 
                      stroke="hsl(var(--violet-500, 270 100% 50%))" 
                      fillOpacity={1} 
                      fill="url(#colorWithdrawals)" 
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EarningsChart;