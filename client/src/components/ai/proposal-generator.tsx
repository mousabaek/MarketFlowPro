import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Copy, Check, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form schema
const proposalFormSchema = z.object({
  projectTitle: z.string().min(3, "Project title must be at least 3 characters"),
  projectDescription: z.string().min(10, "Project description must be at least 10 characters"),
  skills: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  budget: z.string().optional(),
  userExperience: z.string().optional(),
  userSkills: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

export function ProposalGenerator({ 
  projectTitle = "", 
  projectDescription = "", 
  skills = [] 
}: { 
  projectTitle?: string; 
  projectDescription?: string; 
  skills?: string[];
}) {
  const { toast } = useToast();
  const [generatedProposal, setGeneratedProposal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("edit");

  // Define form
  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      projectTitle,
      projectDescription,
      skills: skills.join(", "),
      budget: "",
      userExperience: "",
      userSkills: "",
    },
  });

  // Generate proposal mutation
  const generateProposal = useMutation({
    mutationFn: async (data: ProposalFormValues) => {
      return apiRequest("/api/ai/generate-proposal", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setGeneratedProposal(data.proposal);
      setActiveTab("preview");
      toast({
        title: "Proposal generated",
        description: "Your AI-powered proposal has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate proposal",
        description: "There was an error generating your proposal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(data: ProposalFormValues) {
    generateProposal.mutate(data);
  }

  // Copy proposal to clipboard
  const copyToClipboard = () => {
    if (generatedProposal) {
      navigator.clipboard.writeText(generatedProposal);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Proposal has been copied to clipboard.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            AI Proposal Generator
          </CardTitle>
          <CardDescription>
            Generate a compelling, personalized proposal for this project using AI.
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit Details</TabsTrigger>
              <TabsTrigger value="preview" disabled={!generatedProposal}>
                Preview Proposal
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="edit">
            <CardContent className="pt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="projectTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="projectDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter project description" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Required Skills</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="JavaScript, React, Node.js" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of skills
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="$500 - $1000" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="userExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Experience (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Briefly describe your relevant experience" 
                            className="min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The AI will highlight this in your proposal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="userSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Skills (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="JavaScript, React, Node.js" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Comma-separated list of your skills
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={generateProposal.isPending}
                    >
                      {generateProposal.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating Proposal...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Proposal
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="preview">
            <CardContent className="pt-4">
              {generatedProposal ? (
                <>
                  <div className="mb-4">
                    <div className="bg-muted/50 border rounded-md p-4 relative">
                      <div className="whitespace-pre-wrap">{generatedProposal}</div>
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={copyToClipboard}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Tip</AlertTitle>
                    <AlertDescription>
                      Review and personalize this AI-generated proposal before submitting.
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No proposal generated yet. Fill in the details and click "Generate Proposal".
                  </p>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="bg-muted/20 border-t px-6 py-4">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by OpenAI GPT-4o</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}