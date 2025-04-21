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
import { ClickBankProductListings } from '@/components/platforms/clickbank-product-listings';
import { ClickBankProductDetails } from '@/components/platforms/clickbank-product-details';
import { 
  ShoppingCart, 
  Wallet, 
  TrendingUp, 
  AreaChart, 
  Tag, 
  Settings, 
  Award,
  Heart,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { useParams } from 'wouter';

export default function ClickBankPlatform() {
  const { id } = useParams();
  const platformId = parseInt(id || '1');
  const [activeTab, setActiveTab] = useState('products');
  const { toast } = useToast();

  // Fetch platform details
  const { data: platform, isLoading } = useQuery({
    queryKey: [`/api/platforms/${platformId}`],
    enabled: !!platformId,
  });

  // Fetch commission rates
  const { data: commissionRates } = useQuery({
    queryKey: [`/api/platforms/${platformId}/clickbank/commission-rates`],
    enabled: !!platformId,
  });

  // Fetch earnings report
  const { data: earningsReport } = useQuery({
    queryKey: [`/api/platforms/${platformId}/clickbank/earnings`],
    enabled: !!platformId,
  });

  // Fetch top products
  const { data: topProducts } = useQuery({
    queryKey: [`/api/platforms/${platformId}/clickbank/top-products`],
    enabled: !!platformId,
  });

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">ClickBank Platform</h1>
          <p className="text-muted-foreground mt-1">
            Manage your ClickBank affiliate marketing campaigns
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
          <TabsTrigger value="top-products">
            <Award className="h-4 w-4 mr-2" />
            Top Products
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
          <div className="grid grid-cols-1 gap-4">
            <ClickBankProductListings platformId={platformId} />
          </div>
        </TabsContent>

        <TabsContent value="top-products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-primary" />
                Top Performing Products
              </CardTitle>
              <CardDescription>
                Highest converting ClickBank products to promote
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts?.products ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topProducts.products.map((product: any, index: number) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold line-clamp-2 mb-1">{product.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">by {product.vendor}</p>
                          </div>
                          {product.category && (
                            <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                              {product.category === "Health & Fitness" ? (
                                <Heart className="h-3 w-3 mr-1 text-rose-500" />
                              ) : product.category === "Business/Investing" ? (
                                <Briefcase className="h-3 w-3 mr-1 text-blue-500" />
                              ) : product.category === "Education" ? (
                                <GraduationCap className="h-3 w-3 mr-1 text-purple-500" />
                              ) : (
                                <Tag className="h-3 w-3 mr-1" />
                              )}
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-xs text-muted-foreground">Gravity</p>
                            <p className="font-medium">{product.gravity}</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-xs text-muted-foreground">Commission</p>
                            <p className="font-medium">{product.commission}</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-xs text-muted-foreground">Initial Price</p>
                            <p className="font-medium">${product.initialPrice.toFixed(2)}</p>
                          </div>
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-xs text-muted-foreground">Avg. Earnings</p>
                            <p className="font-medium">${product.avgEarningsPerSale.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Button variant="default" size="sm" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Top products data will appear here once available.</p>
                </div>
              )}
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
                  Your recent ClickBank earnings activity
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
                      <p className="text-sm font-medium text-muted-foreground">Sales</p>
                      <p className="text-2xl font-bold">{earningsReport.data?.summary?.sales || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Refunds</p>
                      <p className="text-2xl font-bold">{earningsReport.data?.summary?.refunds || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                    </div>
                    <div className="bg-background border rounded-lg p-4">
                      <p className="text-sm font-medium text-muted-foreground">Refund Rate</p>
                      <p className="text-2xl font-bold">{earningsReport.data?.summary?.refundRate.toFixed(2) || '0.00'}%</p>
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
                  Track your ClickBank marketing performance metrics
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
                Configure your ClickBank account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input id="apiKey" placeholder="Enter your ClickBank API Key" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="developerKey">Developer API Key</Label>
                <Input id="developerKey" type="password" placeholder="Enter your ClickBank Developer Key" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clerk">Clerk ID (Nickname)</Label>
                <Input id="clerk" placeholder="Enter your ClickBank Clerk ID" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingId">Tracking ID</Label>
                <Input id="trackingId" placeholder="Enter your tracking ID (optional)" />
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