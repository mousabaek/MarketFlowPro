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
import AmazonProductListings from '@/components/platforms/amazon-product-listings';
import { AmazonProductDetails } from '@/components/platforms/amazon-product-details';
import { ShoppingCart, Wallet, TrendingUp, AreaChart, Tag, History, Settings } from 'lucide-react';
import { useParams } from 'wouter';

export default function AmazonAssociatesPage() {
  const { id } = useParams();
  const platformId = parseInt(id || '1');
  const [activeTab, setActiveTab] = useState('products');
  const [selectedAsin, setSelectedAsin] = useState<string | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const { toast } = useToast();

  // Fetch platform details
  const { data: platform, isLoading } = useQuery({
    queryKey: [`/api/platforms/${platformId}`],
    enabled: !!platformId,
  });

  // Fetch commission rates
  const { data: commissionRates } = useQuery({
    queryKey: [`/api/platforms/${platformId}/amazon/commission-rates`],
    enabled: !!platformId,
  });

  // Fetch earnings report
  const { data: earningsReport } = useQuery({
    queryKey: [`/api/platforms/${platformId}/amazon/earnings`],
    enabled: !!platformId,
  });

  const handleProductSelect = (asin: string) => {
    setSelectedAsin(asin);
    setShowProductDetails(true);
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Amazon Associates</h1>
          <p className="text-muted-foreground mt-1">
            Manage your Amazon affiliate marketing campaigns
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          Connected
        </Badge>
      </div>

      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="products">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Products
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

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="col-span-3">
              {showProductDetails && selectedAsin ? (
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProductDetails(false)}
                    className="mb-4"
                  >
                    ← Back to product listings
                  </Button>
                  <AmazonProductDetails
                    platformId={platformId}
                    asin={selectedAsin}
                    onClose={() => setShowProductDetails(false)}
                  />
                </div>
              ) : (
                <AmazonProductListings platformId={platformId} />
              )}
            </div>
          </div>
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
                  Your recent Amazon Associates earnings activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {earningsReport ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                      <p className="text-2xl font-bold">${earningsReport.data?.summary?.earnings.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Clicks</p>
                      <p className="text-2xl font-bold">{earningsReport.data?.summary?.clicks || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Orders</p>
                      <p className="text-2xl font-bold">{earningsReport.data?.summary?.orders || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold">{earningsReport.data?.summary?.conversion.toFixed(2) || '0.00'}%</p>
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

          {commissionRates && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-primary" />
                  Commission Rates
                </CardTitle>
                <CardDescription>
                  Current commission rates by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium">Category</th>
                        <th className="text-right py-2 px-4 font-medium">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionRates?.data?.categories?.map((category: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{category.name}</td>
                          <td className="text-right py-2 px-4">{category.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
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
                  Track your Amazon Associates performance metrics
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
                Configure your Amazon Associates account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessKey">API Access Key</Label>
                <Input id="accessKey" placeholder="Enter your Amazon API Access Key" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">API Secret Key</Label>
                <Input id="secretKey" type="password" placeholder="Enter your Amazon API Secret Key" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="associateTag">Associate Tag</Label>
                <Input id="associateTag" placeholder="Enter your Amazon Associate Tag" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketplace">Default Marketplace</Label>
                <Select defaultValue="US">
                  <SelectTrigger id="marketplace">
                    <SelectValue placeholder="Select marketplace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="JP">Japan</SelectItem>
                    <SelectItem value="IT">Italy</SelectItem>
                    <SelectItem value="ES">Spain</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="BR">Brazil</SelectItem>
                    <SelectItem value="MX">Mexico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="mt-4">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}