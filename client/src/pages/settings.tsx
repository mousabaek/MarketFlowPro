import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  
  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/1'], // For demo purposes, hardcoded userId
  });
  
  // Fetch connected platforms
  const { data: platforms, isLoading: platformsLoading } = useQuery({
    queryKey: ['/api/platforms'],
  });
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>
      
      <Tabs defaultValue="account" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent>
              {userLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-24" />
                </div>
              ) : (
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.fullName} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username} />
                  </div>
                  
                  <Button>Save Changes</Button>
                </form>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your security credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                
                <Button>Update Password</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="platforms" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Platforms</CardTitle>
              <CardDescription>Manage your connected platforms and their API credentials</CardDescription>
            </CardHeader>
            <CardContent>
              {platformsLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {platforms?.map((platform) => (
                    <div key={platform.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            platform.type === 'clickbank' ? 'bg-blue-100' : 
                            platform.type === 'fiverr' ? 'bg-green-100' : 'bg-teal-100'
                          }`}>
                            <span className={`font-bold text-sm ${
                              platform.type === 'clickbank' ? 'text-blue-600' : 
                              platform.type === 'fiverr' ? 'text-green-600' : 'text-teal-600'
                            }`}>{platform.metadata?.icon}</span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-base font-medium text-gray-900">{platform.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              platform.status === 'connected' ? 'bg-green-100 text-green-800' : 
                              platform.status === 'error' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {platform.status.charAt(0).toUpperCase() + platform.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${platform.type}-api-key`}>API Key</Label>
                          <Input id={`${platform.type}-api-key`} defaultValue={platform.apiKey} type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`${platform.type}-secret-key`}>Secret Key</Label>
                          <Input id={`${platform.type}-secret-key`} defaultValue={platform.secretKey} type="password" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm">Test Connection</Button>
                        <Button size="sm">Save</Button>
                      </div>
                      
                      <Separator />
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    Add New Platform
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Workflow Notifications</h3>
                    <p className="text-sm text-gray-500">Get notified when a workflow succeeds or fails</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Opportunity Alerts</h3>
                    <p className="text-sm text-gray-500">Get notified when new opportunities are found</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Revenue Updates</h3>
                    <p className="text-sm text-gray-500">Get notified about revenue changes</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Platform Connection Issues</h3>
                    <p className="text-sm text-gray-500">Get notified when platform authentication fails</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email notifications for important events</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>Customize your AutoTasker experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Toggle dark mode for the application</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Automatic Updates</h3>
                    <p className="text-sm text-gray-500">Automatically refresh data</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="refresh-interval">Refresh Interval (minutes)</Label>
                  <Input id="refresh-interval" type="number" defaultValue="5" min="1" />
                </div>
                
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
