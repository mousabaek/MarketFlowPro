import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EtsyListings from '@/components/platforms/etsy-listings';
import { Loader2, ShoppingCart, Store, Tag, Wallet, TrendingUp, AreaChart, Settings, Building } from 'lucide-react';
import { useParams } from 'wouter';

export default function EtsyPlatform() {
  const { id } = useParams();
  const platformId = parseInt(id || '1');
  const [activeTab, setActiveTab] = useState('listings');
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [showListingDetails, setShowListingDetails] = useState(false);
  const { toast } = useToast();

  // Fetch platform details
  const { data: platform, isLoading } = useQuery({
    queryKey: [`/api/platforms/${platformId}`],
    enabled: !!platformId,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: [`/api/platforms/${platformId}/etsy/categories`],
    enabled: !!platformId,
  });

  // Fetch affiliate stats
  const { data: affiliateStats } = useQuery({
    queryKey: [`/api/platforms/${platformId}/etsy/affiliate-stats`],
    enabled: !!platformId,
  });

  const handleListingSelect = (listingId: number) => {
    setSelectedListingId(listingId);
    setShowListingDetails(true);
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Etsy Affiliate Platform</h1>
          <p className="text-muted-foreground mt-1">
            Manage your Etsy affiliate marketing campaigns
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          Connected
        </Badge>
      </div>

      <Tabs defaultValue="listings" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="listings">
            <Tag className="h-4 w-4 mr-2" />
            Listings
          </TabsTrigger>
          <TabsTrigger value="shops">
            <Store className="h-4 w-4 mr-2" />
            Shops
          </TabsTrigger>
          <TabsTrigger value="earnings">
            <Wallet className="h-4 w-4 mr-2" />
            Earnings
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <AreaChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <EtsyListings platformId={platformId} />
          </div>
        </TabsContent>

        <TabsContent value="shops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5 text-primary" />
                Featured Shops
              </CardTitle>
              <CardDescription>
                Browse and discover popular Etsy shops with quality items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Shop data will appear here once available.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Earnings Summary
                </CardTitle>
                <CardDescription>
                  Your recent Etsy affiliate earnings activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {affiliateStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold">${affiliateStats.data?.summary?.earnings.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Clicks</p>
                      <p className="text-2xl font-bold">{affiliateStats.data?.summary?.clicks || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Orders</p>
                      <p className="text-2xl font-bold">{affiliateStats.data?.summary?.orders || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold">{affiliateStats.data?.summary?.conversion.toFixed(2) || '0.00'}%</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Earnings data will appear here once available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AreaChart className="mr-2 h-5 w-5 text-primary" />
                  Performance Analytics
                </CardTitle>
                <CardDescription>
                  Track your Etsy affiliate performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Analytics data will appear here once available.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Configure your Etsy affiliate account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input id="apiKey" placeholder="Enter your Etsy API Key" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret</Label>
                <Input id="apiSecret" type="password" placeholder="Enter your Etsy API Secret" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">OAuth Access Token</Label>
                <Input id="accessToken" placeholder="Enter your OAuth Access Token" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code</Label>
                <Input id="referralCode" placeholder="Enter your Etsy referral code" />
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="outline">Test Connection</Button>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}