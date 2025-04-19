import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkflowWithStats } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import WorkflowCard from "@/components/dashboard/workflow-card";
import WorkflowBuilder from "@/components/workflows/workflow-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Workflows() {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch workflows
  const { data: workflows, isLoading } = useQuery<WorkflowWithStats[]>({
    queryKey: ['/api/workflows'],
  });
  
  // Filter workflows based on active tab
  const filteredWorkflows = workflows?.filter(workflow => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return workflow.status === "active";
    if (activeTab === "inactive") return workflow.status === "inactive" || workflow.status === "paused";
    if (activeTab === "error") return workflow.status === "error";
    return true;
  });
  
  return (
    <div>
      {isCreating ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-gray-900">Create Workflow</h1>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
          <WorkflowBuilder onComplete={() => setIsCreating(false)} />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Workflows</h1>
              
              <div className="mt-4 md:mt-0">
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Workflow
                </Button>
              </div>
            </div>
          </div>
          
          {/* Workflow Tabs */}
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Workflows</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="p-5">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      
                      <div className="mt-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      
                      <div className="mt-4">
                        <Skeleton className="h-6 w-24" />
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </Card>
                  ))
                ) : filteredWorkflows?.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500">No workflows found. Create your first workflow to get started.</p>
                  </div>
                ) : (
                  filteredWorkflows?.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i} className="p-5">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      
                      <div className="mt-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      
                      <div className="mt-4">
                        <Skeleton className="h-6 w-24" />
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </Card>
                  ))
                ) : filteredWorkflows?.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500">No active workflows found.</p>
                  </div>
                ) : (
                  filteredWorkflows?.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="inactive" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {isLoading ? (
                  <Card className="p-5">
                    <Skeleton className="h-40 w-full" />
                  </Card>
                ) : filteredWorkflows?.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500">No inactive or paused workflows found.</p>
                  </div>
                ) : (
                  filteredWorkflows?.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} />
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="error" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {isLoading ? (
                  <Card className="p-5">
                    <Skeleton className="h-40 w-full" />
                  </Card>
                ) : filteredWorkflows?.length === 0 ? (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-500">No workflows with errors found.</p>
                  </div>
                ) : (
                  filteredWorkflows?.map((workflow) => (
                    <WorkflowCard key={workflow.id} workflow={workflow} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
