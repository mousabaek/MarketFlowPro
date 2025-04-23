import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { Header } from "../components/header";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop) */}
        <Sidebar />
        
        {/* Mobile menu */}
        <MobileMenu />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background pt-0 lg:pt-4 pb-4 px-4 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
