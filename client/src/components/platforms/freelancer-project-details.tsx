import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProposalGenerator, ProjectAnalyzer } from "@/components/ai";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatCurrency } from "@/lib/utils";
import { AlertCircle, ArrowLeft, Calendar, Clock, DollarSign, Globe, Tag, User } from "lucide-react";
import { Platform } from "@shared/schema";

interface FreelancerProjectDetailsProps {
  platform: Platform;
  projectId: number;
  onBack: () => void;
}

export function FreelancerProjectDetails({ 
  platform, 
  projectId,
  onBack 
}: FreelancerProjectDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [matchScore, setMatchScore] = useState<number | null>(null);
  
  // Get project details
  const { data: project, error, isLoading } = useQuery({
    queryKey: [`/api/platforms/${platform.id}/freelancer/projects/${projectId}`],
    queryFn: ({ queryKey }) => apiRequest(queryKey[0]),
  });
  
  // Submit bid mutation
  const submitBid = useMutation({
    mutationFn: async (data: { amount: number; description: string; period: number }) => {
      return apiRequest(`/api/platforms/${platform.id}/freelancer/bid`, {
        method: "POST",
        body: JSON.stringify({ ...data, projectId }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Bid submitted",
        description: "Your bid has been successfully submitted.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platform.id}/freelancer/current-bids`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit bid",
        description: "There was an error submitting your bid. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Function to handle bid submission
  const handleBidSubmit = (proposal: string) => {
    // For now, this is a placeholder that would be developed further
    // In a real implementation, it would parse the proposal or use a form
    // to collect the bid amount and period
    toast({
      title: "Ready to submit",
      description: "Your proposal is ready to submit. In a complete implementation, you would see a confirmation dialog here.",
    });
  };
  
  // Function to handle analysis completion
  const handleAnalysisComplete = (score: number) => {
    setMatchScore(score);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Skeleton className="h-6 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error || !project) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Error Loading Project</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load project details. Please try again later.
            </AlertDescription>
          </Alert>
          <Button variant="outline" onClick={onBack} className="mt-4">
            Back to Projects
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription>
                Project ID: {project.id} • Posted {formatDate(project.timeSubmitted)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <div className="px-6 mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="analyze">
                Analyze
                {matchScore !== null && (
                  <Badge variant="outline" className="ml-2">
                    {matchScore}/10
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bid">Bid</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <CardContent>
          <TabsContent value="details" className="mt-0">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center">
                    <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                    Budget
                  </div>
                  <div className="font-medium">
                    {project.budget ? formatCurrency(project.budget.minimum) + ' - ' + formatCurrency(project.budget.maximum) : 'Not specified'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    Duration
                  </div>
                  <div className="font-medium">{project.timeframe || 'Not specified'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                    Posted
                  </div>
                  <div className="font-medium">{formatDate(project.timeSubmitted)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center">
                    <User className="mr-1 h-4 w-4 text-muted-foreground" />
                    Client
                  </div>
                  <div className="font-medium">{project.owner.username || 'Anonymous'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center">
                    <Globe className="mr-1 h-4 w-4 text-muted-foreground" />
                    Location
                  </div>
                  <div className="font-medium">{project.location?.country || 'Not specified'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center">
                    <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                    Type
                  </div>
                  <div className="font-medium">{project.type || 'Standard'}</div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Description</h3>
                <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-md border">
                  {project.description}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {project.jobs?.map((job) => (
                    <Badge key={job.id} variant="secondary">
                      {job.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setActiveTab("analyze")}
                >
                  Analyze This Project
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="mt-0">
            <ProjectAnalyzer
              projectTitle={project.title}
              projectDescription={project.description}
              requiredSkills={project.jobs?.map(job => job.name) || []}
              userSkills={[]} // This would be fetched from user profile
              budget={project.budget ? `${project.budget.minimum} - ${project.budget.maximum} ${project.currency?.code || 'USD'}` : undefined}
              onAnalysisComplete={handleAnalysisComplete}
            />
            
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back to Details
              </Button>
              <Button onClick={() => setActiveTab("bid")}>
                Proceed to Bid
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="bid" className="mt-0">
            <ProposalGenerator
              projectTitle={project.title}
              projectDescription={project.description}
              skills={project.jobs?.map(job => job.name) || []}
            />
            
            <div className="flex justify-end mt-6 space-x-3">
              <Button variant="outline" onClick={() => setActiveTab("analyze")}>
                Back to Analysis
              </Button>
              <Button onClick={() => handleBidSubmit("")}>
                Submit Bid
              </Button>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
}