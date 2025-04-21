import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProfessionalCardProps {
  className?: string;
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export function ProfessionalCard({
  className,
  title,
  description,
  badge,
  badgeVariant = "default",
  icon,
  footer,
  children,
  onClick,
}: ProfessionalCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md", 
        onClick && "cursor-pointer hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon && <div className="mr-1 text-primary">{icon}</div>}
            <CardTitle className="text-xl">{title}</CardTitle>
            {badge && (
              <Badge variant={badgeVariant} className="ml-2">
                {badge}
              </Badge>
            )}
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="border-t pt-4">{footer}</CardFooter>}
    </Card>
  );
}

interface ProfessionalMetricCardProps {
  className?: string;
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  onClick?: () => void;
}

export function ProfessionalMetricCard({
  className,
  title,
  value,
  description,
  trend,
  icon,
  onClick,
}: ProfessionalMetricCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md", 
        onClick && "cursor-pointer hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(trend || description) && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {trend && (
              <div 
                className={cn(
                  "mr-1 flex items-center",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586V7a1 1 0 112 0v5a1 1 0 01-1 1h-5z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="ml-1">{trend.value}%</span>
              </div>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProfessionalActionCardProps {
  className?: string;
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
}

export function ProfessionalActionCard({
  className,
  title,
  description,
  icon,
  onClick,
}: ProfessionalActionCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md border border-border/50", 
        onClick && "cursor-pointer hover:border-primary/50 hover:bg-muted/50",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="flex flex-row items-center p-6">
        <div className="mr-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}