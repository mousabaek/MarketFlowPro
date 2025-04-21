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
import { Slider } from '@/components/ui/slider';
import { Loader2, Search, ExternalLink, Copy, CheckCircle, Store, Tag } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface EtsyPlatformProps {
  platformId: number;
}

export default function EtsyPlatform({ platformId }: EtsyPlatformProps) {
  const { toast } = useToast();
  const [searchKeywords, setSearchKeywords] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentListingId, setCurrentListingId] = useState<number | null>(null);
  const [copiedLinks, setCopiedLinks] = useState<Record<string, boolean>>({});

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/platforms', platformId, 'etsy', 'categories'],
    enabled: !!platformId,
  });

  const { data: affiliateStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/platforms', platformId, 'etsy', 'affiliate-stats'],
    enabled: !!platformId,
  });

  const { data: trendingListings, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['/api/platforms', platformId, 'etsy', 'trending'],
    enabled: !!platformId,
  });

  const handleSearch = async () => {
    if (!searchKeywords && !selectedCategory) {
      toast({
        title: "Search Required",
        description: "Please enter search keywords or select a category",
        variant: "destructive"
      });
      return;
    }

    setSearchLoading(true);
    
    try {
      const params = new URLSearchParams();
      
      if (searchKeywords) {
        params.append('keywords', searchKeywords);
      }
      
      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }
      
      params.append('minPrice', priceRange[0].toString());
      params.append('maxPrice', priceRange[1].toString());
      
      const response = await apiRequest(`/api/platforms/${platformId}/etsy/listings?${params.toString()}`);
      setSearchResults(response.results || []);
    } catch (error) {
      console.error('Error searching Etsy listings:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search Etsy listings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleListingDetails = async (listingId: number) => {
    setCurrentListingId(listingId);
    try {
      await queryClient.prefetchQuery({
        queryKey: ['/api/platforms', platformId, 'etsy', 'listings', listingId],
      });
    } catch (error) {
      console.error('Error fetching listing details:', error);
    }
  };

  const handleCopyLink = (listingId: number) => {
    // In a real implementation, this would use the platform's affiliate link structure
    const affiliateLink = `https://www.etsy.com/listing/${listingId}?utm_source=affiliate&utm_medium=api&utm_campaign=youraffiliateid`;
    navigator.clipboard.writeText(affiliateLink);
    
    setCopiedLinks({
      ...copiedLinks,
      [listingId]: true
    });
    
    toast({
      title: "Link Copied",
      description: "Affiliate link copied to clipboard",
    });
    
    // Reset the copy state after 2 seconds
    setTimeout(() => {
      setCopiedLinks({
        ...copiedLinks,
        [listingId]: false
      });
    }, 2000);
  };

  const { data: listingDetails } = useQuery({
    queryKey: ['/api/platforms', platformId, 'etsy', 'listings', currentListingId],
    enabled: !!currentListingId,
  });

  return (
    <div className="grid gap-4">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="search">Listing Search</TabsTrigger>
          <TabsTrigger value="trending">Trending Items</TabsTrigger>
          <TabsTrigger value="stats">Affiliate Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Etsy Listings</CardTitle>
              <CardDescription>
                Find handmade, vintage, and unique items to promote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="search">Search Keywords</Label>
                    <Input
                      id="search"
                      placeholder="Enter keywords..."
                      value={searchKeywords}
                      onChange={(e) => setSearchKeywords(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories?.results?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="price-range">Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                  </div>
                  <Slider
                    id="price-range"
                    defaultValue={[0, 500]}
                    max={1000}
                    step={5}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="my-4"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSearch} 
                    disabled={searchLoading || (!searchKeywords && !selectedCategory)}
                  >
                    {searchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search
                  </Button>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {searchResults.map((listing: any) => (
                      <Card key={listing.listing_id} className="overflow-hidden">
                        <div className="aspect-square relative overflow-hidden">
                          {listing.images?.[0]?.url_570xN && (
                            <img
                              src={listing.images[0].url_570xN}
                              alt={listing.title}
                              className="object-cover w-full h-full transition-transform hover:scale-105"
                            />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-sm line-clamp-2 h-10">
                            {listing.title}
                          </h3>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold">
                              ${listing.price.amount / listing.price.divisor}
                            </span>
                            <Badge variant="outline">
                              {listing.shop?.shop_name || 'Etsy Shop'}
                            </Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleListingDetails(listing.listing_id)}
                          >
                            Details
                          </Button>
                          <div className="flex gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    size="icon" 
                                    variant="outline"
                                    onClick={() => handleCopyLink(listing.listing_id)}
                                  >
                                    {copiedLinks[listing.listing_id] ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{copiedLinks[listing.listing_id] ? 'Copied!' : 'Copy Affiliate Link'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => window.open(`https://www.etsy.com/listing/${listing.listing_id}`, '_blank')}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Open in Etsy</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : searchLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mb-2 opacity-20" />
                    <p>Search for listings to display results</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {currentListingId && listingDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="line-clamp-2">{listingDetails.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {listingDetails.shop.shop_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {listingDetails.images?.[0]?.url_fullxfull && (
                      <img 
                        src={listingDetails.images[0].url_fullxfull} 
                        alt={listingDetails.title}
                        className="rounded-md object-contain w-full"
                      />
                    )}
                    
                    <div className="grid grid-cols-4 gap-2">
                      {listingDetails.images?.slice(1, 5).map((image: any, index: number) => (
                        <div key={index} className="aspect-square rounded-md overflow-hidden">
                          <img 
                            src={image.url_75x75} 
                            alt={`${listingDetails.title} - Image ${index + 2}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Price</h3>
                      <p className="text-2xl font-bold">
                        ${listingDetails.price.amount / listingDetails.price.divisor}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Description</h3>
                      <p className="text-sm text-muted-foreground line-clamp-6">
                        {listingDetails.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Tags</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {listingDetails.tags?.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {listingDetails.shipping_profile && (
                      <div>
                        <h3 className="text-lg font-medium">Shipping</h3>
                        <p className="text-sm">
                          {listingDetails.shipping_profile.origin_country_name} to{' '}
                          {listingDetails.shipping_profile.destination_country_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentListingId(null)}
                >
                  Back to Search
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary"
                    onClick={() => handleCopyLink(currentListingId)}
                  >
                    {copiedLinks[currentListingId] ? (
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
                    onClick={() => window.open(`https://www.etsy.com/listing/${currentListingId}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Etsy
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle>Trending Items</CardTitle>
              <CardDescription>
                Popular listings on Etsy right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTrending ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : trendingListings?.results?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trendingListings.results.map((listing: any) => (
                    <Card key={listing.listing_id} className="overflow-hidden">
                      <div className="aspect-square relative overflow-hidden">
                        {listing.images?.[0]?.url_570xN && (
                          <img
                            src={listing.images[0].url_570xN}
                            alt={listing.title}
                            className="object-cover w-full h-full transition-transform hover:scale-105"
                          />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm line-clamp-2 h-10">
                          {listing.title}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold">
                            ${listing.price.amount / listing.price.divisor}
                          </span>
                          <Badge variant="outline">
                            {listing.shop?.shop_name || 'Etsy Shop'}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleListingDetails(listing.listing_id)}
                        >
                          Details
                        </Button>
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="outline"
                                  onClick={() => handleCopyLink(listing.listing_id)}
                                >
                                  {copiedLinks[listing.listing_id] ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{copiedLinks[listing.listing_id] ? 'Copied!' : 'Copy Affiliate Link'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => window.open(`https://www.etsy.com/listing/${listing.listing_id}`, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Open in Etsy</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <p>No trending listings available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Statistics</CardTitle>
              <CardDescription>
                Your Etsy Affiliate Program performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : affiliateStats ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${affiliateStats.result?.revenue.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {affiliateStats.result?.period}
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
                          {affiliateStats.result?.clicks}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total clicks
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Conversions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {affiliateStats.result?.conversions}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total conversions
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
                          {affiliateStats.result?.conversionRate.toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Percentage of clicks that converted
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Commission Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {affiliateStats.result?.commissionRate.toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Current commission rate
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <p>No affiliate statistics available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}