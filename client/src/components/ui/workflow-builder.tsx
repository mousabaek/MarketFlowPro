import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Platform, 
  workflowCreationSchema,
  InsertWorkflow
} from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { X, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface WorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowBuilder({ isOpen, onClose }: WorkflowBuilderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [steps, setSteps] = useState<Array<{type: string; config: Record<string, any>}>>([
    { type: "trigger", config: { event: "new_item" } },
  ]);
  
  // Fetch platforms for the selection dropdown
  const { data: platforms = [] } = useQuery<Platform[]>({
    queryKey: ["/api/platforms"],
  });
  
  // Setup form
  const form = useForm({
    resolver: zodResolver(workflowCreationSchema),
    defaultValues: {
      name: "",
      platformId: undefined,
      steps: steps
    },
  });
  
  // Create workflow mutation
  const createWorkflow = useMutation({
    mutationFn: async (data: InsertWorkflow) => {
      const res = await apiRequest("POST", "/api/workflows", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow created",
        description: "Your workflow has been created successfully."
      });
      onClose();
      form.reset();
      setSteps([{ type: "trigger", config: { event: "new_item" } }]);
    },
    onError: (error) => {
      toast({
        title: "Error creating workflow",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: any) => {
    // Add steps to the form data
    data.steps = steps;
    createWorkflow.mutate(data);
  };
  
  // Add a new step
  const addStep = () => {
    setSteps([...steps, { type: "action", config: {} }]);
  };
  
  // Remove a step at index
  const removeStep = (index: number) => {
    if (steps.length <= 1) return; // Don't remove the last step
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };
  
  // Update a step
  const updateStep = (index: number, key: string, value: any) => {
    const newSteps = [...steps];
    if (key === "type") {
      // Reset config when type changes
      newSteps[index] = { type: value, config: {} };
    } else {
      // Update config
      newSteps[index].config = { ...newSteps[index].config, [key]: value };
    }
    setSteps(newSteps);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Build an automation workflow to connect with platforms and automate tasks.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My workflow" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="platformId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id.toString()}>
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Workflow Steps</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addStep} 
                  className="h-8 px-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Step
                </Button>
              </div>
              
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <h4 className="text-sm font-medium">Step {index + 1}</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => removeStep(index)} 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        disabled={steps.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs">Type</label>
                          <Select
                            value={step.type}
                            onValueChange={(value) => updateStep(index, "type", value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trigger">Trigger</SelectItem>
                              <SelectItem value="filter">Filter</SelectItem>
                              <SelectItem value="action">Action</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Different fields based on step type */}
                        {step.type === "trigger" && (
                          <div className="space-y-1">
                            <label className="text-xs">Event</label>
                            <Select
                              value={step.config.event || ""}
                              onValueChange={(value) => updateStep(index, "event", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select event" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new_item">New Item</SelectItem>
                                <SelectItem value="new_job">New Job</SelectItem>
                                <SelectItem value="new_product">New Product</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        {step.type === "filter" && (
                          <>
                            <div className="space-y-1">
                              <label className="text-xs">Field</label>
                              <Select
                                value={step.config.field || ""}
                                onValueChange={(value) => updateStep(index, "field", value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="category">Category</SelectItem>
                                  <SelectItem value="price">Price</SelectItem>
                                  <SelectItem value="rating">Rating</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs">Operator</label>
                              <Select
                                value={step.config.operator || "equals"}
                                onValueChange={(value) => updateStep(index, "operator", value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                  <SelectItem value="greater_than">Greater Than</SelectItem>
                                  <SelectItem value="less_than">Less Than</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1 col-span-2">
                              <label className="text-xs">Value</label>
                              <Input 
                                className="h-8" 
                                value={step.config.value || ""} 
                                onChange={(e) => updateStep(index, "value", e.target.value)} 
                                placeholder="Value to match"
                              />
                            </div>
                          </>
                        )}
                        
                        {step.type === "action" && (
                          <>
                            <div className="space-y-1">
                              <label className="text-xs">Action Type</label>
                              <Select
                                value={step.config.type || ""}
                                onValueChange={(value) => updateStep(index, "type", value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="notify">Notify</SelectItem>
                                  <SelectItem value="apply">Apply</SelectItem>
                                  <SelectItem value="submit">Submit</SelectItem>
                                  <SelectItem value="connect">Connect</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {step.config.type === "notify" && (
                              <div className="space-y-1">
                                <label className="text-xs">Channel</label>
                                <Select
                                  value={step.config.channel || ""}
                                  onValueChange={(value) => updateStep(index, "channel", value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select channel" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="slack">Slack</SelectItem>
                                    <SelectItem value="webhook">Webhook</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            
                            {(step.config.type === "apply" || step.config.type === "submit") && (
                              <div className="space-y-1">
                                <label className="text-xs">Template</label>
                                <Select
                                  value={step.config.template || ""}
                                  onValueChange={(value) => updateStep(index, "template", value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select template" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="web_expert">Web Expert</SelectItem>
                                    <SelectItem value="wordpress_expert">WordPress Expert</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createWorkflow.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createWorkflow.isPending}
              >
                {createWorkflow.isPending ? "Creating..." : "Create Workflow"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
