import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string | number;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function StatsCard({ title, value, change, icon, iconBg, iconColor }: StatsCardProps) {
  const isPositiveChange = typeof change === 'string' 
    ? !change.includes('-') 
    : change >= 0;

  return (
    <Card>
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBg)}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change !== 0 && change !== '0%' && (
                  <div className={cn(
                    "ml-2 flex items-baseline text-sm font-semibold",
                    isPositiveChange ? "text-green-600" : "text-red-600"
                  )}>
                    {isPositiveChange ? (
                      <ArrowUp className="h-4 w-4 self-center" />
                    ) : (
                      <ArrowDown className="h-4 w-4 self-center" />
                    )}
                    <span className="ml-1">
                      {typeof change === 'string' && !change.startsWith('+') && !change.startsWith('-')
                        ? `+${change}`
                        : change}
                    </span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Card>
  );
}
