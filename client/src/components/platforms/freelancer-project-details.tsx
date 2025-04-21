import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Loader2, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  Users, 
  Tag, 
  Briefcase, 
  Eye, 
  Heart, 
  BarChart,
  CheckCircle,
  MessageCircle,
  Timer,
  ChevronUp,
  ChevronDown,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

export interface FreelancerProjectDetailsProps {
  platformId: number;
  projectId: number;
  onClose?: () => void;
}

interface BidDetails {
  amount: number;
  description: string;
  timeframe: string;
  milestones: boolean;
}

export function FreelancerProjectDetails({ platformId, projectId, onClose }: FreelancerProjectDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<number | null>(null);

  const form = useForm<BidDetails>({
    defaultValues: {
      amount: 0,
      description: "",
      timeframe: "",
      milestones: true
    }
  });

  const { data: project, isLoading, isError } = useQuery({
    queryKey: [`/api/platforms/${platformId}/freelancer/projects/${projectId}`],
    retry: 1,
  });

  // Submit a bid
  const handleBidSubmit = async (data: BidDetails) => {
    setIsSubmittingBid(true);
    
    try {
      const response = await apiRequest(
        "POST", 
        `/api/platforms/${platformId}/freelancer/projects/${projectId}/bid`, 
        data
      );
      
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}/freelancer/projects/${projectId}`] });
        
        toast({
          title: "Bid submitted successfully",
          description: "Your bid has been submitted to the client",
        });
        
        setBidSubmitted(true);
        setBidDialogOpen(false);
      } else {
        toast({
          title: "Failed to submit bid",
          description: response.message || "There was an error submitting your bid. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error submitting bid",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const toggleCategory = (index: number) => {
    if (openCategory === index) {
      setOpenCategory(null);
    } else {
      setOpenCategory(index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading project details...</span>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="text-center p-12">
        <p className="text-lg font-semibold text-red-500">
          Failed to load project details
        </p>
        <p className="text-gray-500 mt-2">
          There was an error loading the project information from Freelancer.com.
        </p>
        <Button onClick={onClose} variant="outline" className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  // Calculate time left to bid (current implementation just for UI display)
  const getTimeLeft = () => {
    if (project.status === "closed") return "Bidding closed";
    
    // Default fallback for expired projects
    if (project.status === "expired") return "Project expired";
    
    // If project has a submission time, calculate from that
    if (project.timeSubmitted) {
      const submissionDate = new Date(project.timeSubmitted);
      const expiryDate = new Date(submissionDate);
      expiryDate.setDate(expiryDate.getDate() + 7); // Assuming 7 day bidding window
      
      const now = new Date();
      if (now > expiryDate) return "Bidding closed";
      
      const diffMs = expiryDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      return `${diffDays}d ${diffHours}h left`;
    }
    
    return "Time remaining unknown";
  };

  // Format URL for external link
  const getProjectUrl = () => {
    return project.projectUrl || `https://www.freelancer.com/projects/${projectId}`;
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <h2 className="text-2xl font-bold">{project.title}</h2>
            <Badge 
              className={`ml-3 ${
                project.status === "active" ? "bg-green-500 hover:bg-green-600" :
                project.status === "expired" ? "bg-amber-500 hover:bg-amber-600" :
                "bg-red-500 hover:bg-red-600"
              }`}
            >
              {project.status === "active" ? "Active" :
               project.status === "expired" ? "Expired" : "Closed"}
            </Badge>
          </div>
          <div className="flex items-center mt-1 space-x-2">
            <Badge variant="outline" className="flex items-center">
              <Briefcase className="h-3 w-3 mr-1" />
              {project.type || "Fixed Price"}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              {project.budget || "$100-$500"}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {getTimeLeft()}
            </Badge>
          </div>
        </div>
        <Button 
          size="sm"
          onClick={() => window.open(getProjectUrl(), "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          View on Freelancer.com
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Users className="h-4 w-4 mr-1 text-primary" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">
                    {project.employer?.displayName || "Client Name"}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {project.employer?.country || "Unknown Location"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Reviews</div>
                    <div className="font-medium">
                      {project.employer?.reviews || "No reviews"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Rating</div>
                    <div className="font-medium">
                      {project.employer?.rating || "No rating"} / 5
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Payment Verified</div>
                    <div className="font-medium">
                      {project.employer?.paymentVerified ? "Yes" : "No"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Projects Posted</div>
                    <div className="font-medium">
                      {project.employer?.projectsPosted || 0}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Tag className="h-4 w-4 mr-1 text-primary" />
                Skills & Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.categories && project.categories.length > 0 ? (
                      project.categories.map((category, idx) => (
                        <Badge key={idx} variant="outline">{category}</Badge>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No specific skills required</div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Project Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Project Type:</span>
                      <span>{project.type || "Fixed Price"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">{project.budget || "$250-$750"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Duration:</span>
                      <span>{project.duration || "Less than 1 month"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posted:</span>
                      <span>{project.timeSubmitted ? format(new Date(project.timeSubmitted), "MMM d, yyyy") : "Unknown"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <BarChart className="h-4 w-4 mr-1 text-primary" />
                Bid Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Bids</span>
                    <span className="font-medium">{project.bidStats?.bidCount || "0"}</span>
                  </div>
                  <Progress value={Math.min((project.bidStats?.bidCount || 0) * 10, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Avg Bid</span>
                    <span className="font-medium">{project.bidStats?.avgBid || "$0"}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Your Match Score</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1 text-blue-500" />
                      <span>{project.views || 0} views</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 mr-1 text-rose-500" />
                      <span>{project.favorites || 0} saved</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="bidding" className="flex-1">Bidding Strategy</TabsTrigger>
              <TabsTrigger value="competitors" className="flex-1">Competitors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {project.description ? (
                      <div className="whitespace-pre-line">{project.description}</div>
                    ) : (
                      <p className="text-muted-foreground">No detailed description available for this project.</p>
                    )}
                  </div>
                  
                  {project.attachments && project.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-sm mb-2">Attachments</h3>
                      <div className="space-y-2">
                        {project.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center p-2 border rounded-md bg-slate-50">
                            <span className="text-sm truncate">{attachment.name}</span>
                            <Button variant="ghost" size="sm" className="ml-auto">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bidding" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Bidding Strategy</CardTitle>
                  <CardDescription>
                    Insights to help you create a competitive bid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                      <h3 className="font-medium text-blue-700 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Key Insights
                      </h3>
                      <ul className="text-sm mt-2 space-y-1 text-blue-700">
                        <li>This client has a history of paying slightly above the average bid amount</li>
                        <li>Projects in this category typically require 3-4 revisions</li>
                        <li>Bids with specific timelines and milestones have 60% higher success rate</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm mb-2">Recommended Bid Range</h3>
                      <div className="bg-slate-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-600">$350 - $450</span>
                          <Badge variant="outline">85% win probability</Badge>
                        </div>
                        <Progress value={70} className="h-2 mt-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Avg bid: ${project.bidStats?.avgBid || "250"}</span>
                          <span>Client budget: {project.budget || "$250-$750"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-sm mb-2">Suggested Bid Components</h3>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Address client's pain points directly</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Include 2-3 relevant portfolio examples</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Offer a clear timeline with milestones</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Add a brief explanation of your approach</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => setBidDialogOpen(true)}
                    disabled={project.status !== "active" || bidSubmitted}
                  >
                    {bidSubmitted ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Bid Submitted
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Submit a Bid
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="competitors" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Competing Bidders</CardTitle>
                  <CardDescription>
                    Analysis of other freelancers bidding on this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm">Top Competitors</h3>
                      <Badge variant="outline" className="text-xs">Total: {project.bidStats?.bidCount || 0} bidders</Badge>
                    </div>
                    
                    {[1, 2, 3].map((item, index) => (
                      <div key={index} className="border rounded-md overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100"
                          onClick={() => toggleCategory(index)}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">Competitor {index + 1}</div>
                              <div className="text-xs text-muted-foreground">
                                Level {5 - index} Seller • {20 - index * 3} Reviews
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge 
                              variant={index === 0 ? "default" : "secondary"} 
                              className="mr-2"
                            >
                              {index === 0 ? "Top Bidder" : `Rank #${index + 1}`}
                            </Badge>
                            {openCategory === index ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        
                        {openCategory === index && (
                          <div className="p-3 border-t">
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <div className="text-xs text-muted-foreground">Bid Amount</div>
                                <div className="font-medium">${350 - index * 25}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Delivery Time</div>
                                <div className="font-medium">{7 + index} days</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Proposal Rating</div>
                                <div className="font-medium">{95 - index * 5}%</div>
                              </div>
                            </div>
                            <div className="text-sm">
                              <div className="font-medium mb-1">Key Strengths:</div>
                              <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
                                <li>Has completed {12 - index * 2} similar projects</li>
                                <li>{index === 0 ? "Perfect" : "Good"} client feedback history</li>
                                <li>Offers {index === 0 ? "comprehensive" : "basic"} post-delivery support</li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="bg-slate-50 p-3 rounded-md">
                      <h3 className="font-medium text-sm mb-2">Your Competitive Position</h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between mb-1 text-xs">
                            <span>Experience Match</span>
                            <span className="font-medium">80%</span>
                          </div>
                          <Progress value={80} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-xs">
                            <span>Price Competitiveness</span>
                            <span className="font-medium">70%</span>
                          </div>
                          <Progress value={70} className="h-1.5" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-xs">
                            <span>Response Speed</span>
                            <span className="font-medium">90%</span>
                          </div>
                          <Progress value={90} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <MessageCircle className="h-4 w-4 mr-1 text-primary" />
                Proposal Assistance
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" className="flex-1 mr-1">
                    Generate Proposal
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 ml-1">
                    Analyze Project
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  AI tools can help you create proposals and analyze project suitability for your skills.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit a Bid</DialogTitle>
            <DialogDescription>
              Create your proposal for "{project.title}"
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleBidSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter your bid amount" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Suggested range: ${project.bidStats?.avgBid?.replace('$', '') || "350"}-$450
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Timeframe</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 7 days" {...field} />
                    </FormControl>
                    <FormDescription>
                      Be realistic with your delivery timeframe
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposal</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your approach, experience, and why you're the best for this project" 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setBidDialogOpen(false)}
                  disabled={isSubmittingBid}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmittingBid}
                >
                  {isSubmittingBid ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Submit Bid
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Separator />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {project.status === "active" && !bidSubmitted && (
          <Button onClick={() => setBidDialogOpen(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Place a Bid
          </Button>
        )}
      </div>
    </div>
  );
}

// Add default export to fix module import issue
export default FreelancerProjectDetails;