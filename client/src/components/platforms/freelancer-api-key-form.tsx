import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Platform } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

// Zod schema for API key form
const freelancerApiFormSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().optional(),
  saveCredentials: z.boolean().default(true),
});

type FreelancerApiFormValues = z.infer<typeof freelancerApiFormSchema>;

interface FreelancerApiKeyFormProps {
  platform?: Platform;
  onSuccess?: () => void;
}

export function FreelancerApiKeyForm({ platform, onSuccess }: FreelancerApiKeyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create form
  const form = useForm<FreelancerApiFormValues>({
    resolver: zodResolver(freelancerApiFormSchema),
    defaultValues: {
      apiKey: platform?.apiKey || '',
      apiSecret: platform?.apiSecret || '',
      saveCredentials: true,
    },
  });
  
  // Create or update platform mutation
  const savePlatformMutation = useMutation({
    mutationFn: async (data: FreelancerApiFormValues) => {
      if (platform) {
        // Update existing platform
        return apiRequest(`/api/platforms/${platform.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            apiKey: data.apiKey,
            apiSecret: data.apiSecret,
          }),
        });
      } else {
        // Create new platform
        return apiRequest('/api/platforms', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Freelancer',
            type: 'freelance',
            apiKey: data.apiKey,
            apiSecret: data.apiSecret,
          }),
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/platforms'] });
      
      if (platform) {
        queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platform.id}`] });
      }
      
      toast({
        title: 'Freelancer.com API Key Saved',
        description: 'Your API credentials have been saved successfully.',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Test connection after saving
      if (data.id) {
        testConnectionMutation.mutate(data.id);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error Saving API Key',
        description: 'There was a problem saving your API credentials. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (platformId: number) => {
      return apiRequest(`/api/platforms/${platformId}/freelancer/test-connection`, {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Connection Successful',
          description: 'Successfully connected to Freelancer.com API.',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: data.message || 'Could not connect to Freelancer.com API. Please check your credentials.',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to Freelancer.com API. Please check your credentials.',
        variant: 'destructive',
      });
    },
  });
  
  // Submit handler
  function onSubmit(data: FreelancerApiFormValues) {
    savePlatformMutation.mutate(data);
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Freelancer.com API Credentials</CardTitle>
        <CardDescription>
          Enter your Freelancer.com API credentials to connect Wolf Auto Marketer to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Freelancer.com API key" {...field} />
                  </FormControl>
                  <FormDescription>
                    You can find your API key in your Freelancer.com account settings.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OAuth Secret (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter OAuth secret if using OAuth flow" {...field} />
                  </FormControl>
                  <FormDescription>
                    Required only if you're using OAuth authentication.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="saveCredentials"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Save credentials for future use
                    </FormLabel>
                    <FormDescription>
                      Your API credentials will be securely stored for automated tasks.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button
                type="submit"
                disabled={savePlatformMutation.isPending}
                className="mr-2"
              >
                {savePlatformMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {platform ? 'Update Credentials' : 'Save & Connect'}
              </Button>
              
              {platform && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testConnectionMutation.mutate(platform.id)}
                  disabled={testConnectionMutation.isPending}
                >
                  {testConnectionMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Test Connection
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Your API credentials are securely stored and are only used to communicate with Freelancer.com.
      </CardFooter>
    </Card>
  );
}