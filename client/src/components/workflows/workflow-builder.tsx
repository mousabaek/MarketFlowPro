import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertWorkflowSchema } from "@shared/schema";
import { usePlatforms } from "@/hooks/use-platforms";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, MessageSquare, Clock, Target } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

// Extend the insertWorkflowSchema to add validation
const workflowFormSchema = insertWorkflowSchema.extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  platformType: z.enum(["clickbank", "fiverr", "upwork"], {
    required_error: "Please select a platform",
  }),
});

interface WorkflowBuilderProps {
  onComplete: () => void;
}

export default function WorkflowBuilder({ onComplete }: WorkflowBuilderProps) {
  const { toast } = useToast();
  const { platforms, isLoading: platformsLoading } = usePlatforms();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Form definition
  const form = useForm<z.infer<typeof workflowFormSchema>>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: {
      userId: 1, // For demo purposes
      name: "",
      description: "",
      platformType: "clickbank",
      status: "inactive",
      config: {}
    },
  });

  // Platform-specific config options
  const getConfigOptions = (platformType: string) => {
    switch (platformType) {
      case 'clickbank':
        return (
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="searchTerms">Search Terms</Label>
              <Input id="searchTerms" placeholder="e.g. digital marketing, fitness, health" />
              <FormDescription>
                Keywords to look for in product listings
              </FormDescription>
            </div>
            
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Health & Fitness', 'E-business', 'Self-help', 'Cooking', 'Spirituality', 'Sports'].map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox id={`category-${category}`} />
                    <Label htmlFor={`category-${category}`} className="text-sm font-normal">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minCommission">Minimum Commission (%)</Label>
              <Input id="minCommission" type="number" min="1" max="100" defaultValue="50" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gravity">Minimum Gravity</Label>
              <Input id="gravity" type="number" min="1" defaultValue="50" />
              <FormDescription>
                Higher gravity indicates more affiliate success
              </FormDescription>
            </div>
          </div>
        );
      
      case 'fiverr':
        return (
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="gigIds">Gig IDs</Label>
              <Input id="gigIds" placeholder="Enter your Fiverr gig IDs, comma separated" />
              <FormDescription>
                The gigs that this automation will manage
              </FormDescription>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responseTemplateInquiry">Inquiry Response Template</Label>
              <Textarea 
                id="responseTemplateInquiry"
                placeholder="Thank you for your interest in my services..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responseTemplateOrder">Order Confirmation Template</Label>
              <Textarea 
                id="responseTemplateOrder"
                placeholder="Thank you for your order! I'm excited to get started..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Automatic Actions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="action-respond" defaultChecked />
                  <Label htmlFor="action-respond" className="text-sm font-normal">
                    Auto-respond to inquiries
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="action-confirm" defaultChecked />
                  <Label htmlFor="action-confirm" className="text-sm font-normal">
                    Auto-confirm orders
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="action-notify" defaultChecked />
                  <Label htmlFor="action-notify" className="text-sm font-normal">
                    Send notifications for new orders
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'upwork':
        return (
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label>Job Keywords</Label>
              <div className="flex flex-wrap gap-2">
                {['React', 'Node.js', 'Fullstack', 'JavaScript', 'TypeScript'].map((keyword, index) => (
                  <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
                    {keyword}
                    <button className="ml-2 text-gray-500 hover:text-gray-700">×</button>
                  </div>
                ))}
                <Input className="mt-2" placeholder="Add keyword and press Enter" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minRate">Minimum Hourly Rate ($)</Label>
                <Input id="minRate" type="number" min="5" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRate">Maximum Hourly Rate ($)</Label>
                <Input id="maxRate" type="number" min="5" defaultValue="100" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobTypes">Job Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Hourly', 'Fixed-Price', 'Long-term', 'Short-term'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={`type-${type}`} defaultChecked={['Hourly', 'Long-term'].includes(type)} />
                    <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proposalTemplate">Proposal Template</Label>
              <Textarea 
                id="proposalTemplate"
                placeholder="I'm interested in your project and believe I'd be a great fit because..."
                className="min-h-[100px]"
              />
              <FormDescription>
                This template will be used as a base for automatic proposals
              </FormDescription>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Triggers based on selected platform
  const getTriggerOptions = (platformType: string) => {
    switch (platformType) {
      case 'clickbank':
        return [
          { id: 'new-product', name: 'New Product Added', icon: <Search className="h-5 w-5" /> },
          { id: 'gravity-change', name: 'Gravity Change', icon: <Target className="h-5 w-5" /> },
          { id: 'commission-change', name: 'Commission Change', icon: <Filter className="h-5 w-5" /> }
        ];
      case 'fiverr':
        return [
          { id: 'new-message', name: 'New Message Received', icon: <MessageSquare className="h-5 w-5" /> },
          { id: 'new-order', name: 'New Order Received', icon: <MessageSquare className="h-5 w-5" /> },
          { id: 'order-complete', name: 'Order Completed', icon: <Clock className="h-5 w-5" /> }
        ];
      case 'upwork':
        return [
          { id: 'new-job', name: 'New Job Posted', icon: <Search className="h-5 w-5" /> },
          { id: 'invitation', name: 'Job Invitation', icon: <MessageSquare className="h-5 w-5" /> },
          { id: 'contract-ended', name: 'Contract Ended', icon: <Clock className="h-5 w-5" /> }
        ];
      default:
        return [];
    }
  };

  // Actions based on selected platform
  const getActionOptions = (platformType: string) => {
    switch (platformType) {
      case 'clickbank':
        return [
          { id: 'send-notification', name: 'Send Notification', icon: <MessageSquare className="h-5 w-5" /> },
          { id: 'add-to-promotion', name: 'Add to Promotion List', icon: <Target className="h-5 w-5" /> },
          { id: 'create-campaign', name: 'Create Affiliate Campaign', icon: <Target className="h-5 w-5" /> }
        ];
      case 'fiverr':
        return [
          { id: 'send-message', name: 'Send Automated Message', icon: <MessageSquare className="h-5 w-5" /> },
          { id: 'accept-order', name: 'Accept Order', icon: <Clock className="h-5 w-5" /> },
          { id: 'deliver-template', name: 'Deliver Template Response', icon: <MessageSquare className="h-5 w-5" /> }
        ];
      case 'upwork':
        return [
          { id: 'send-proposal', name: 'Send Proposal', icon: <MessageSquare className="h-5 w-5" /> },
          { id: 'save-job', name: 'Save Job for Later', icon: <Clock className="h-5 w-5" /> },
          { id: 'request-testimonial', name: 'Request Testimonial', icon: <MessageSquare className="h-5 w-5" /> }
        ];
      default:
        return [];
    }
  };

  const onSubmit = async (values: z.infer<typeof workflowFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Find the selected platform
      const platformId = platforms?.find(p => p.type === values.platformType)?.id;
      
      // Enhance config with selected trigger and action
      const enhancedConfig = {
        ...values.config,
        trigger: selectedTrigger,
        action: selectedAction,
        // Add form fields based on platform type
        ...(values.platformType === 'clickbank' && {
          searchTerms: (document.getElementById('searchTerms') as HTMLInputElement)?.value || '',
          minCommission: (document.getElementById('minCommission') as HTMLInputElement)?.value || '50',
          gravity: (document.getElementById('gravity') as HTMLInputElement)?.value || '50',
          categories: ['Health & Fitness', 'E-business', 'Self-help', 'Cooking', 'Spirituality', 'Sports']
            .filter(cat => (document.getElementById(`category-${cat}`) as HTMLInputElement)?.checked)
        }),
        ...(values.platformType === 'fiverr' && {
          gigIds: (document.getElementById('gigIds') as HTMLInputElement)?.value || '',
          responseTemplates: {
            inquiry: (document.getElementById('responseTemplateInquiry') as HTMLTextAreaElement)?.value || '',
            confirmation: (document.getElementById('responseTemplateOrder') as HTMLTextAreaElement)?.value || ''
          },
          actions: {
            autoRespond: (document.getElementById('action-respond') as HTMLInputElement)?.checked || false,
            autoConfirm: (document.getElementById('action-confirm') as HTMLInputElement)?.checked || false,
            sendNotifications: (document.getElementById('action-notify') as HTMLInputElement)?.checked || false
          }
        }),
        ...(values.platformType === 'upwork' && {
          keywords: ['React', 'Node.js', 'Fullstack', 'JavaScript', 'TypeScript'],
          hourlyRateRange: {
            min: (document.getElementById('minRate') as HTMLInputElement)?.value || '50',
            max: (document.getElementById('maxRate') as HTMLInputElement)?.value || '100'
          },
          jobTypes: ['Hourly', 'Fixed-Price', 'Long-term', 'Short-term']
            .filter(type => (document.getElementById(`type-${type}`) as HTMLInputElement)?.checked),
          proposalTemplate: (document.getElementById('proposalTemplate') as HTMLTextAreaElement)?.value || ''
        })
      };
      
      // Create the final workflow data
      const workflowData = {
        ...values,
        platformId,
        status: 'active', // Active by default when created
        config: enhancedConfig,
        // Add some demo stats
        stats: {
          successfulRuns: "0/0",
          revenue: "$0",
          lastRun: "Never"
        }
      };
      
      // Submit the data
      await apiRequest('POST', '/api/workflows', workflowData);
      
      // Update the workflows cache
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      
      toast({
        title: "Workflow Created",
        description: "Your new workflow has been created successfully.",
      });
      
      // Return to the workflows page
      onComplete();
    } catch (error) {
      console.error('Error creating workflow:', error);
      
      toast({
        title: "Error",
        description: "Failed to create workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // When platform type changes, reset trigger and action
  const handlePlatformChange = (value: string) => {
    form.setValue('platformType', value as "clickbank" | "fiverr" | "upwork");
    setSelectedTrigger(null);
    setSelectedAction(null);
  };

  const nextStep = () => {
    if (currentStep === 1 && !form.getValues('name')) {
      form.setError('name', {
        type: 'manual',
        message: 'Name is required to continue'
      });
      return;
    }
    
    if (currentStep === 2 && !selectedTrigger) {
      toast({
        title: "Select a Trigger",
        description: "Please select a trigger to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 3 && !selectedAction) {
      toast({
        title: "Select an Action",
        description: "Please select an action to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create a New Workflow</CardTitle>
        <CardDescription>
          Set up an automated workflow to handle tasks across your connected platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Steps indicator */}
            <div className="flex justify-between mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === currentStep 
                        ? 'bg-primary text-white' 
                        : step < currentStep 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step}
                  </div>
                  <span className="text-xs mt-1">
                    {step === 1 ? 'Basics' : 
                     step === 2 ? 'Trigger' : 
                     step === 3 ? 'Action' : 'Configure'}
                  </span>
                </div>
              ))}
            </div>
            
            {currentStep === 1 && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Clickbank Product Scanner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What does this workflow do?" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="platformType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select 
                        onValueChange={handlePlatformChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="clickbank">Clickbank</SelectItem>
                          <SelectItem value="fiverr">Fiverr</SelectItem>
                          <SelectItem value="upwork">Upwork</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Select a Trigger</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Choose what will cause this workflow to run
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getTriggerOptions(form.getValues('platformType')).map((trigger) => (
                      <div 
                        key={trigger.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors hover:border-primary ${
                          selectedTrigger === trigger.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedTrigger(trigger.id)}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${
                            selectedTrigger === trigger.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {trigger.icon}
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium">{trigger.name}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Select an Action</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Choose what will happen when the trigger conditions are met
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getActionOptions(form.getValues('platformType')).map((action) => (
                      <div 
                        key={action.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors hover:border-primary ${
                          selectedAction === action.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedAction(action.id)}
                      >
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${
                            selectedAction === action.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {action.icon}
                          </div>
                          <div className="ml-3">
                            <h4 className="font-medium">{action.name}</h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Configure Your Workflow</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Set up the specific details for how this workflow will run
                  </p>
                  
                  <Tabs defaultValue="settings" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="settings" className="p-4">
                      {getConfigOptions(form.getValues('platformType'))}
                    </TabsContent>
                    <TabsContent value="preview" className="p-4">
                      <div className="rounded-md border p-6 bg-gray-50">
                        <h4 className="font-medium text-base mb-4">Workflow Summary</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium">Name:</span>
                            <span className="text-sm col-span-2">{form.getValues('name')}</span>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium">Platform:</span>
                            <span className="text-sm col-span-2 capitalize">{form.getValues('platformType')}</span>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium">Trigger:</span>
                            <span className="text-sm col-span-2">
                              {getTriggerOptions(form.getValues('platformType'))
                                .find(t => t.id === selectedTrigger)?.name || 'None selected'}
                            </span>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium">Action:</span>
                            <span className="text-sm col-span-2">
                              {getActionOptions(form.getValues('platformType'))
                                .find(a => a.id === selectedAction)?.name || 'None selected'}
                            </span>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            <span className="text-sm col-span-2 text-green-600 font-medium">Will be activated on creation</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={prevStep}>
            Previous
          </Button>
        ) : (
          <Button variant="outline" onClick={onComplete}>
            Cancel
          </Button>
        )}
        
        {currentStep < 4 ? (
          <Button onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Workflow
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
