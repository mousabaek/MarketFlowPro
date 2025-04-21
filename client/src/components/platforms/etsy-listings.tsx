import React, { useState } from 'react';
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, ExternalLink, Tag, Heart, Search, Share2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EtsyListingsProps {
  platformId: number;
}

interface SearchOptions {
  keywords: string;
  sort_on?: string;
  sort_order?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
}

export default function EtsyListings({ platformId }: EtsyListingsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    keywords: '',
    sort_on: 'created',
    sort_order: 'desc',
    min_price: undefined,
    max_price: undefined,
    limit: 20
  });

  const sortOptions = [
    { value: 'created', label: 'Newest' },
    { value: 'price', label: 'Price' },
    { value: 'relevancy', label: 'Relevancy' }
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Descending' },
    { value: 'asc', label: 'Ascending' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchOptions({
      ...searchOptions,
      [name]: name === 'min_price' || name === 'max_price' || name === 'limit' ? 
        (value ? parseFloat(value) : undefined) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setSearchOptions({
      ...searchOptions,
      [name]: value
    });
  };

  const searchListings = async () => {
    if (!searchOptions.keywords.trim()) {
      toast({
        title: "Search keywords required",
        description: "Please enter keywords to search for listings",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest(
        'POST', 
        `/api/platforms/${platformId}/etsy/listings`, 
        searchOptions
      );
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to search listings');
      }
      
      setSearchResults(data.data.results || []);
      
      toast({
        title: "Search complete",
        description: `Found ${data.data.results?.length || 0} listings matching "${searchOptions.keywords}"`
      });
    } catch (error) {
      console.error('Error searching Etsy listings:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Failed to search listings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAffiliateLink = (listingId: string) => {
    // In a real implementation, this would generate a proper affiliate link
    const link = `https://www.etsy.com/listing/${listingId}?utm_source=affiliate`;
    
    navigator.clipboard.writeText(link)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Affiliate link copied to clipboard"
        });
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: "Failed to copy",
          description: "Unable to copy link to clipboard",
          variant: "destructive"
        });
      });
  };

  const openListingPage = (listingId: string) => {
    window.open(`https://www.etsy.com/listing/${listingId}`, '_blank', 'noopener,noreferrer');
  };

  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    
    // Handle different price formats
    if (typeof price === 'string') return price;
    if (typeof price === 'number') return `$${price.toFixed(2)}`;
    
    if (price.amount && price.currency_code) {
      return `${price.currency_code} ${parseFloat(price.amount).toFixed(2)}`;
    }
    
    if (price.formatted_amount) {
      return price.formatted_amount;
    }
    
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Etsy Listing Search</CardTitle>
          <CardDescription>
            Search for handmade and vintage items on Etsy to promote as an affiliate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="keywords">Search Keywords</Label>
              <Input 
                id="keywords" 
                name="keywords" 
                placeholder="Enter keywords..."
                value={searchOptions.keywords}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && searchListings()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort_on">Sort By</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('sort_on', value)}
                defaultValue={searchOptions.sort_on}
              >
                <SelectTrigger id="sort_on">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('sort_order', value)}
                defaultValue={searchOptions.sort_order}
              >
                <SelectTrigger id="sort_order">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  {sortOrderOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="limit">Result Count</Label>
              <Input 
                id="limit" 
                name="limit" 
                type="number" 
                min={1} 
                max={100}
                value={searchOptions.limit}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min_price">Min Price</Label>
              <Input 
                id="min_price" 
                name="min_price" 
                type="number" 
                placeholder="Min Price"
                value={searchOptions.min_price || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_price">Max Price</Label>
              <Input 
                id="max_price" 
                name="max_price" 
                type="number" 
                placeholder="Max Price"
                value={searchOptions.max_price || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <Button 
            onClick={searchListings} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</>
            ) : (
              <><Search className="mr-2 h-4 w-4" /> Search Listings</>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((listing) => {
            const listingId = listing.listing_id;
            const title = listing.title || 'Unknown Item';
            const imageUrl = listing.images?.[0]?.url_570xN || '';
            const price = listing.price?.amount || 0;
            const currency = listing.price?.currency_code || 'USD';
            const shopName = listing.shop?.shop_name || 'Etsy Shop';
            const isCustomizable = listing.is_customizable;
            const isFavorite = listing.num_favorers > 10;

            return (
              <Card key={listingId} className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base line-clamp-2" title={title}>
                      {title}
                    </CardTitle>
                    <div className="flex gap-1">
                      {isCustomizable && (
                        <Badge variant="outline" className="shrink-0">Customizable</Badge>
                      )}
                      {isFavorite && (
                        <Badge className="shrink-0 bg-pink-100 text-pink-800 hover:bg-pink-100">
                          <Heart className="h-3 w-3 mr-1 fill-current" /> Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {shopName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="aspect-square relative mb-3 bg-gray-100 rounded-md overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-lg">
                      {`${currency} ${parseFloat(price).toFixed(2)}`}
                    </div>
                    {listing.tags && listing.tags.length > 0 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Tag className="h-3 w-3 mr-1" />
                        {listing.tags[0]}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" className="flex-1" onClick={() => openListingPage(listingId)}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Open listing page
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="flex-1" onClick={() => copyAffiliateLink(listingId)}>
                          <Share2 className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Copy affiliate link
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {searchResults.length === 0 && searchOptions.keywords && !isLoading && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">No listings found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters to find more items
          </p>
        </div>
      )}
    </div>
  );
}