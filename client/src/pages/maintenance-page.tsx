import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import MaintenanceRequestForm from "@/components/maintenance/maintenance-request-form";
import MaintenanceRequestList from "@/components/maintenance/maintenance-request-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Bot,
  BotIcon,
  WrenchIcon,
  Settings,
  List,
  PlusCircle,
  LucideServer,
  ListChecks
} from "lucide-react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MaintenancePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("list");
  
  // Redirect to login if not authenticated
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  const isAdmin = user.role === "admin";
  
  // Set page title
  useEffect(() => {
    document.title = "AI Maintenance Agent | Wolf Auto Marketer";
  }, []);
  
  return (
    <>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <BotIcon className="mr-2 h-8 w-8 text-primary" />
              AI Maintenance Agent
            </h1>
            <p className="text-muted-foreground mt-1">
              Submit maintenance requests and let our AI agent analyze and fix issues
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex items-center bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-md">
              <Shield className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 text-sm font-medium">Admin Control Panel</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="list" className="flex items-center">
                  <List className="h-4 w-4 mr-2" />
                  Requests
                </TabsTrigger>
                <TabsTrigger value="new" className="flex items-center">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Request
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="list" className="p-0">
                <MaintenanceRequestList />
              </TabsContent>
              
              <TabsContent value="new" className="p-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit Maintenance Request</CardTitle>
                    <CardDescription>
                      Describe the issue you're experiencing or feature you'd like to request
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MaintenanceRequestForm />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {isAdmin && (
                <TabsContent value="admin" className="p-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Controls</CardTitle>
                      <CardDescription>
                        Manage maintenance requests and system settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-blue-700">Pending Approvals</CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-bold text-blue-700">3</CardContent>
                          </Card>
                          
                          <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-green-700">Completed Fixes</CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-bold text-green-700">12</CardContent>
                          </Card>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="mb-2 font-medium">Agent Settings</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Alert className="bg-transparent border-solid">
                              <BotIcon className="h-4 w-4" />
                              <AlertTitle>AI Agent Status</AlertTitle>
                              <AlertDescription className="flex justify-between items-center">
                                <span>Active and Monitoring</span>
                                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                              </AlertDescription>
                            </Alert>
                            
                            <Alert className="bg-transparent border-solid">
                              <LucideServer className="h-4 w-4" />
                              <AlertTitle>System Status</AlertTitle>
                              <AlertDescription className="flex justify-between items-center">
                                <span>All Systems Operational</span>
                                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                              </AlertDescription>
                            </Alert>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
          
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow">
                    <span className="text-xs">1</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium leading-none">Submit a Request</p>
                    <p className="text-muted-foreground">
                      Describe the issue or feature request with as much detail as possible
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow">
                    <span className="text-xs">2</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium leading-none">AI Analysis</p>
                    <p className="text-muted-foreground">
                      Our AI agent analyzes the issue and proposes a solution
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow">
                    <span className="text-xs">3</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium leading-none">Admin Approval</p>
                    <p className="text-muted-foreground">
                      An admin reviews and approves the proposed solution
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-primary text-primary-foreground shadow">
                    <span className="text-xs">4</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium leading-none">Implementation</p>
                    <p className="text-muted-foreground">
                      The AI agent implements the fix automatically
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center justify-center w-full">
                  <WrenchIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Powered by OpenAI GPT-4o</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}