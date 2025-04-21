import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Loader2, Search, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface AmazonAssociatesProps {
  platformId: number;
}

export default function AmazonAssociatesPlatform({ platformId }: AmazonAssociatesProps) {
  const { toast } = useToast();
  const [searchKeywords, setSearchKeywords] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentAsin, setCurrentAsin] = useState<string | null>(null);
  const [copiedLinks, setCopiedLinks] = useState<Record<string, boolean>>({});

  const { data: commissionRates, isLoading: isLoadingRates } = useQuery({
    queryKey: ['/api/platforms', platformId, 'amazon', 'commission-rates'],
    enabled: !!platformId,
  });

  const { data: earningsReport, isLoading: isLoadingReport } = useQuery({
    queryKey: ['/api/platforms', platformId, 'amazon', 'earnings'],
    enabled: !!platformId,
  });

  const handleSearch = async () => {
    if (!searchKeywords) {
      toast({
        title: "Search Required",
        description: "Please enter search keywords",
        variant: "destructive"
      });
      return;
    }

    setSearchLoading(true);
    
    try {
      const params = new URLSearchParams();
      params.append('keywords', searchKeywords);
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      
      const response = await apiRequest(`/api/platforms/${platformId}/amazon/products?${params.toString()}`);
      setSearchResults(response.SearchResult?.Items || []);
    } catch (error) {
      console.error('Error searching Amazon products:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search Amazon products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductDetails = async (asin: string) => {
    setCurrentAsin(asin);
    try {
      await queryClient.prefetchQuery({
        queryKey: ['/api/platforms', platformId, 'amazon', 'products', asin],
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleCopyLink = (asin: string) => {
    // In a real implementation, this would use the platform's affiliate link structure
    const affiliateLink = `https://amazon.com/dp/${asin}?tag=yourassociateid`;
    navigator.clipboard.writeText(affiliateLink);
    
    setCopiedLinks({
      ...copiedLinks,
      [asin]: true
    });
    
    toast({
      title: "Link Copied",
      description: "Affiliate link copied to clipboard",
    });
    
    // Reset the copy state after 2 seconds
    setTimeout(() => {
      setCopiedLinks({
        ...copiedLinks,
        [asin]: false
      });
    }, 2000);
  };

  const { data: productDetails } = useQuery({
    queryKey: ['/api/platforms', platformId, 'amazon', 'products', currentAsin],
    enabled: !!currentAsin,
  });

  return (
    <div className="grid gap-4">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="search">Product Search</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="rates">Commission Rates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Amazon Products</CardTitle>
              <CardDescription>
                Find products to promote through your Amazon Associates account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Keywords</Label>
                    <Input
                      id="search"
                      placeholder="Enter keywords..."
                      value={searchKeywords}
                      onChange={(e) => setSearchKeywords(e.target.value)}
                    />
                  </div>
                  <div className="w-64">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="HomeAndKitchen">Home & Kitchen</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Beauty">Beauty</SelectItem>
                        <SelectItem value="HealthPersonalCare">Health & Personal Care</SelectItem>
                        <SelectItem value="Sports">Sports & Outdoors</SelectItem>
                        <SelectItem value="Tools">Tools & Home Improvement</SelectItem>
                        <SelectItem value="ToysAndGames">Toys & Games</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleSearch} 
                      disabled={searchLoading || !searchKeywords}
                    >
                      {searchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                      Search
                    </Button>
                  </div>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((product: any) => (
                          <TableRow key={product.ASIN}>
                            <TableCell className="font-medium">
                              {product.ItemInfo?.Title?.DisplayValue}
                            </TableCell>
                            <TableCell>
                              {product.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {product.ItemInfo?.Rating || 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleCopyLink(product.ASIN)}
                                      >
                                        {copiedLinks[product.ASIN] ? (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{copiedLinks[product.ASIN] ? 'Copied!' : 'Copy Affiliate Link'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleProductDetails(product.ASIN)}
                                >
                                  Details
                                </Button>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(`https://amazon.com/dp/${product.ASIN}`, '_blank')}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Open in Amazon</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : searchLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mb-2 opacity-20" />
                    <p>Search for products to display results</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {currentAsin && productDetails && (
            <Card>
              <CardHeader>
                <CardTitle>{productDetails.ItemInfo?.Title?.DisplayValue}</CardTitle>
                <CardDescription>
                  ASIN: {currentAsin}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    {productDetails.Images?.Primary?.Large?.URL && (
                      <img 
                        src={productDetails.Images.Primary.Large.URL} 
                        alt={productDetails.ItemInfo?.Title?.DisplayValue}
                        className="rounded-md object-contain w-full max-h-80"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Price</h3>
                      <p className="text-2xl font-bold">{productDetails.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Features</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {productDetails.ItemInfo?.Features?.DisplayValues?.map((feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Categories</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {productDetails.ItemInfo?.Classifications?.ProductGroup?.DisplayValue && (
                          <Badge variant="outline">
                            {productDetails.ItemInfo.Classifications.ProductGroup.DisplayValue}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentAsin(null)}
                >
                  Back to Search
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary"
                    onClick={() => handleCopyLink(currentAsin)}
                  >
                    {copiedLinks[currentAsin] ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Affiliate Link
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => window.open(`https://amazon.com/dp/${currentAsin}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Amazon
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Report</CardTitle>
              <CardDescription>
                Your Amazon Associates earnings overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingReport ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : earningsReport ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Earnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${earningsReport.result?.earnings.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {earningsReport.result?.period}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Clicks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {earningsReport.result?.clicks}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total clicks
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Ordered Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {earningsReport.result?.orderedItems}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total items ordered
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Conversion Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {earningsReport.result?.conversionRate.toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Percentage of clicks that resulted in purchases
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Average Commission
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${earningsReport.result?.averageCommission.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Average commission per ordered item
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <p>No earnings data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rates">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rates</CardTitle>
              <CardDescription>
                Current Amazon Associates commission rates by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRates ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : commissionRates ? (
                <div className="border rounded-md">
                  <Table>
                    <TableCaption>Commission rates are subject to change by Amazon</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Commission Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(commissionRates.result?.rates || {}).map(([category, rate]) => (
                        <TableRow key={category}>
                          <TableCell className="font-medium">{category}</TableCell>
                          <TableCell className="text-right">{rate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <p>No commission rate data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}