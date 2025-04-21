import { ReactNode } from "react";
import { ProfessionalHeader } from "@/components/ui/professional-header";
import { BackgroundPattern } from "@/components/ui/background-pattern";

interface ProfessionalLayoutProps {
  children: ReactNode;
}

export default function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background/95">
      {/* Background patterns */}
      <div className="fixed inset-0 -z-10 h-full w-full">
        <BackgroundPattern variant="dots" />
      </div>
      
      <ProfessionalHeader />
      
      <div className="container flex-1 items-start py-6 md:py-8 md:grid relative">
        <main className="w-full pt-1">
          {children}
        </main>
      </div>
      
      <footer className="border-t py-6 md:py-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Wolf Auto Marketer. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="/terms" className="hover:underline hover:text-foreground">Terms</a>
            <a href="/privacy" className="hover:underline hover:text-foreground">Privacy</a>
            <a href="/help" className="hover:underline hover:text-foreground">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}