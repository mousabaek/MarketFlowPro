import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  changeText?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
}

export function MetricCard({ title, value, changeText, changeType = "neutral", icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {changeText && (
              <p className={cn(
                "text-xs mt-1 flex items-center",
                changeType === "increase" && "text-secondary",
                changeType === "decrease" && "text-error"
              )}>
                {changeType === "increase" && <ArrowUpRight className="mr-1 h-3 w-3" />}
                {changeType === "decrease" && <ArrowDownRight className="mr-1 h-3 w-3" />}
                <span>{changeText}</span>
              </p>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
