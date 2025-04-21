import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Form schema
const messageFormSchema = z.object({
  clientMessage: z.string().min(1, "Please enter the client message"),
  projectContext: z.string().min(1, "Please provide some project context"),
});

type MessageFormValues = z.infer<typeof messageFormSchema>;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ClientMessageGeneratorProps {
  initialClientMessage?: string;
  initialProjectContext?: string;
  previousMessages?: Message[];
  onResponseGenerated?: (response: string) => void;
}

export function ClientMessageGenerator({
  initialClientMessage = "",
  initialProjectContext = "",
  previousMessages = [],
  onResponseGenerated
}: ClientMessageGeneratorProps) {
  const { toast } = useToast();
  const [generatedResponse, setGeneratedResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Define form
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      clientMessage: initialClientMessage,
      projectContext: initialProjectContext,
    },
  });

  // Generate response mutation
  const generateResponse = useMutation({
    mutationFn: async (data: MessageFormValues & { previousMessages?: Message[] }) => {
      return apiRequest("/api/ai/generate-response", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          previousMessages: previousMessages.length > 0 ? previousMessages : undefined,
        }),
      });
    },
    onSuccess: (data) => {
      setGeneratedResponse(data.response);
      
      if (onResponseGenerated) {
        onResponseGenerated(data.response);
      }
      
      toast({
        title: "Response generated",
        description: "Your AI-powered client response has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate response",
        description: "There was an error generating your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  function onSubmit(data: MessageFormValues) {
    generateResponse.mutate({
      ...data,
      previousMessages: previousMessages.length > 0 ? previousMessages : undefined
    });
  }

  // Copy response to clipboard
  const copyToClipboard = () => {
    if (generatedResponse) {
      navigator.clipboard.writeText(generatedResponse);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Response has been copied to clipboard.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Regenerate response
  const regenerateResponse = () => {
    const values = form.getValues();
    generateResponse.mutate({
      ...values,
      previousMessages: previousMessages.length > 0 ? previousMessages : undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          AI Response Generator
        </CardTitle>
        <CardDescription>
          Create professional responses to client messages with AI assistance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Paste the client's message here" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="projectContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Context</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide some context about the project" 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={generateResponse.isPending}
              >
                {generateResponse.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Response...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Response
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        {generatedResponse && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Generated Response</h3>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateResponse}
                  disabled={generateResponse.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="bg-muted/50 border rounded-md p-4">
              <div className="whitespace-pre-wrap">{generatedResponse}</div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/20 border-t px-6 py-3">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Powered by OpenAI GPT-4o</span>
        </div>
      </CardFooter>
    </Card>
  );
}