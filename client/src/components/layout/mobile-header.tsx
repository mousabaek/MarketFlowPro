import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  className?: string;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export default function MobileHeader({ className, onMenuToggle, isMenuOpen }: MobileHeaderProps) {
  return (
    <div className={cn("bg-white border-b border-gray-200 p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="ml-2 text-lg font-semibold text-gray-900">AutoTasker</h1>
        </div>
        
        <Button variant="ghost" size="icon" onClick={onMenuToggle} aria-label={isMenuOpen ? "Close menu" : "Open menu"}>
          <Menu className="h-6 w-6 text-gray-500" />
        </Button>
      </div>
    </div>
  );
}
