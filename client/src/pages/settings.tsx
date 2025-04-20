import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Key, 
  Save
} from "lucide-react";

// User profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  company: z.string().optional(),
});

// API settings form schema
const apiSettingsSchema = z.object({
  requestLimit: z.string().min(1, "Request limit is required."),
  requestTimeout: z.string().min(1, "Request timeout is required."),
  retryAttempts: z.string().min(1, "Retry attempts is required."),
});

// Notification settings schema
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  workflowSuccessNotifications: z.boolean(),
  workflowErrorNotifications: z.boolean(),
  revenueNotifications: z.boolean(),
  systemNotifications: z.boolean(),
});

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  
  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      company: "Example Inc.",
    },
  });
  
  // API settings form
  const apiSettingsForm = useForm({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      requestLimit: "100",
      requestTimeout: "30",
      retryAttempts: "3",
    },
  });
  
  // Notification settings form
  const notificationForm = useForm({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      workflowSuccessNotifications: true,
      workflowErrorNotifications: true,
      revenueNotifications: true,
      systemNotifications: false,
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };
  
  // Handle API settings form submission
  const onApiSettingsSubmit = (data: z.infer<typeof apiSettingsSchema>) => {
    toast({
      title: "API settings updated",
      description: "Your API settings have been updated successfully.",
    });
  };
  
  // Handle notification settings form submission
  const onNotificationSubmit = (data: z.infer<typeof notificationSettingsSchema>) => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been updated.",
    });
  };
  
  return (
    <div className="mt-16 lg:mt-0 pb-8">
      {/* Settings Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500">Manage your account and application settings</p>
      </div>
      
      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="account" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center">
            <Key className="mr-2 h-4 w-4" />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your account information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form id="profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          This is optional and will be used for invoicing.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security</h3>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Key className="mr-2 h-4 w-4" />
                    Two-Factor Authentication
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button form="profile-form" type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* API Settings */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure API behavior and rate limits for platform connections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiSettingsForm}>
                <form id="api-form" onSubmit={apiSettingsForm.handleSubmit(onApiSettingsSubmit)} className="space-y-4">
                  <FormField
                    control={apiSettingsForm.control}
                    name="requestLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Limit (per minute)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" />
                        </FormControl>
                        <FormDescription>
                          Maximum number of API requests per minute.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiSettingsForm.control}
                    name="requestTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Timeout (seconds)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" />
                        </FormControl>
                        <FormDescription>
                          How long to wait for API responses before timing out.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiSettingsForm.control}
                    name="retryAttempts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retry Attempts</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" />
                        </FormControl>
                        <FormDescription>
                          Number of times to retry failed API requests.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button form="api-form" type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you'd like to receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form id="notification-form" onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via email.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="workflowSuccessNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Workflow Success</FormLabel>
                          <FormDescription>
                            Notify when workflows complete successfully.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="workflowErrorNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Workflow Errors</FormLabel>
                          <FormDescription>
                            Notify when workflows encounter errors.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="revenueNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Revenue Updates</FormLabel>
                          <FormDescription>
                            Notify when new revenue is generated.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="systemNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">System Notifications</FormLabel>
                          <FormDescription>
                            Notify about system updates and maintenance.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button form="notification-form" type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your subscription and payment methods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Current Plan</h3>
                    <p className="text-sm text-gray-500">Professional Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">$49.99 <span className="text-sm font-normal text-gray-500">/month</span></p>
                    <p className="text-xs text-secondary">Renews on Jul 15, 2023</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">Upgrade</Button>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 rounded-md bg-gray-100 p-2">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Change</Button>
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-2">Billing History</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">Jun 15, 2023</p>
                      <p className="text-sm text-gray-500">Professional Plan</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">$49.99</p>
                      <Button variant="ghost" size="sm" className="h-8">Invoice</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">May 15, 2023</p>
                      <p className="text-sm text-gray-500">Professional Plan</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">$49.99</p>
                      <Button variant="ghost" size="sm" className="h-8">Invoice</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">Apr 15, 2023</p>
                      <p className="text-sm text-gray-500">Professional Plan</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">$49.99</p>
                      <Button variant="ghost" size="sm" className="h-8">Invoice</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
