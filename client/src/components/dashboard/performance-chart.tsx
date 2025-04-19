import { RevenueData } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PerformanceChartProps {
  data: RevenueData[] | undefined;
  isLoading: boolean;
  period: 'week' | 'month' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
  showPeriodSelector?: boolean;
}

export default function PerformanceChart({ 
  data, 
  isLoading, 
  period, 
  onPeriodChange,
  showPeriodSelector = true
}: PerformanceChartProps) {
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <h3 className="text-base font-medium text-gray-900">Revenue Growth</h3>
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            +12.5%
          </span>
        </div>
        
        {showPeriodSelector && (
          <div className="mt-3 sm:mt-0">
            <div className="inline-flex rounded-md shadow-sm">
              <Button
                variant={period === 'week' ? 'default' : 'outline'}
                size="sm"
                className="rounded-l-md rounded-r-none"
                onClick={() => onPeriodChange('week')}
              >
                Week
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'outline'}
                size="sm"
                className="rounded-none"
                onClick={() => onPeriodChange('month')}
              >
                Month
              </Button>
              <Button
                variant={period === 'year' ? 'default' : 'outline'}
                size="sm"
                className="rounded-r-md rounded-l-none"
                onClick={() => onPeriodChange('year')}
              >
                Year
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 chart-container">
        {isLoading || !data ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line type="monotone" dataKey="clickbank" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="fiverr" stroke="#34D399" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="upwork" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-6">
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-primary"></span>
          <span className="ml-2 text-sm text-gray-500">Clickbank</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-secondary"></span>
          <span className="ml-2 text-sm text-gray-500">Fiverr</span>
        </div>
        <div className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-accent"></span>
          <span className="ml-2 text-sm text-gray-500">Upwork</span>
        </div>
      </div>
    </div>
  );
}
