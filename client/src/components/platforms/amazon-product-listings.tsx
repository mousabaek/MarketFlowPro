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
import { Loader2, Link2, ExternalLink, Tag, DollarSign, Search, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AmazonProductListingsProps {
  platformId: number;
}

interface SearchOptions {
  keyword: string;
  searchIndex: string;
  itemCount: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

export default function AmazonProductListings({ platformId }: AmazonProductListingsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    keyword: '',
    searchIndex: 'All',
    itemCount: 10,
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'Relevance'
  });

  const searchIndexes = [
    { value: 'All', label: 'All Categories' },
    { value: 'Apparel', label: 'Clothing & Accessories' },
    { value: 'Automotive', label: 'Automotive' },
    { value: 'Baby', label: 'Baby' },
    { value: 'Beauty', label: 'Beauty' },
    { value: 'Books', label: 'Books' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'HomeGarden', label: 'Home & Garden' },
    { value: 'Kitchen', label: 'Kitchen' },
    { value: 'PetSupplies', label: 'Pet Supplies' },
    { value: 'Sports', label: 'Sports & Outdoors' },
    { value: 'Toys', label: 'Toys & Games' }
  ];

  const sortOptions = [
    { value: 'Relevance', label: 'Relevance' },
    { value: 'Price:HighToLow', label: 'Price: High to Low' },
    { value: 'Price:LowToHigh', label: 'Price: Low to High' },
    { value: 'Featured', label: 'Featured' },
    { value: 'NewestArrivals', label: 'Newest Arrivals' },
    { value: 'AvgCustomerReviews', label: 'Customer Reviews' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchOptions({
      ...searchOptions,
      [name]: name === 'minPrice' || name === 'maxPrice' ? 
        (value ? parseFloat(value) : undefined) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setSearchOptions({
      ...searchOptions,
      [name]: value
    });
  };

  const searchProducts = async () => {
    if (!searchOptions.keyword.trim()) {
      toast({
        title: "Search keyword required",
        description: "Please enter a keyword to search for products",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest(
        'POST', 
        `/api/platforms/${platformId}/amazon/products`, 
        searchOptions
      );
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to search products');
      }
      
      setSearchResults(data.data.items || []);
      
      toast({
        title: "Search complete",
        description: `Found ${data.data.items?.length || 0} products matching "${searchOptions.keyword}"`
      });
    } catch (error) {
      console.error('Error searching Amazon products:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Failed to search products",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAffiliateLink = (asin: string) => {
    // In a real implementation, this would generate a proper affiliate link
    // using the user's Associate Tag from the platform settings
    const link = `https://www.amazon.com/dp/${asin}?tag=yourtag-20`;
    
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

  const openProductPage = (asin: string) => {
    window.open(`https://www.amazon.com/dp/${asin}`, '_blank', 'noopener,noreferrer');
  };

  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    
    // Handle different price formats
    if (typeof price === 'string') return price;
    if (typeof price === 'number') return `$${price.toFixed(2)}`;
    
    if (price.amount && price.currency) {
      return `${price.currency} ${parseFloat(price.amount).toFixed(2)}`;
    }
    
    if (price.displayAmount) {
      return price.displayAmount;
    }
    
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Amazon Product Search</CardTitle>
          <CardDescription>
            Search for products on Amazon to promote as an affiliate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="keyword">Search Keywords</Label>
              <Input 
                id="keyword" 
                name="keyword" 
                placeholder="Enter product keywords..."
                value={searchOptions.keyword}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="searchIndex">Category</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('searchIndex', value)}
                defaultValue={searchOptions.searchIndex}
              >
                <SelectTrigger id="searchIndex">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {searchIndexes.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select 
                onValueChange={(value) => handleSelectChange('sortBy', value)}
                defaultValue={searchOptions.sortBy}
              >
                <SelectTrigger id="sortBy">
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
              <Label htmlFor="itemCount">Result Count</Label>
              <Input 
                id="itemCount" 
                name="itemCount" 
                type="number" 
                min={1} 
                max={25}
                value={searchOptions.itemCount}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price</Label>
              <Input 
                id="minPrice" 
                name="minPrice" 
                type="number" 
                placeholder="Min Price"
                value={searchOptions.minPrice || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input 
                id="maxPrice" 
                name="maxPrice" 
                type="number" 
                placeholder="Max Price"
                value={searchOptions.maxPrice || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <Button 
            onClick={searchProducts} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...</>
            ) : (
              <><Search className="mr-2 h-4 w-4" /> Search Products</>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((product, index) => {
            const asin = product.ASIN;
            const title = product.ItemInfo?.Title?.DisplayValue || 'Unknown Product';
            const imageUrl = product.Images?.Primary?.Medium?.URL || '';
            const price = product.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Price not available';
            const savingBasis = product.Offers?.Listings?.[0]?.SavingBasis?.DisplayAmount;
            const isOnSale = !!savingBasis;

            return (
              <Card key={asin || index} className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base line-clamp-2" title={title}>
                      {title}
                    </CardTitle>
                    {isOnSale && (
                      <Badge variant="destructive" className="shrink-0">Sale</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="aspect-square relative mb-3 bg-gray-100 rounded-md overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={title}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-lg">
                      {price}
                    </div>
                    {isOnSale && (
                      <div className="text-gray-400 line-through text-sm">
                        {savingBasis}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" className="flex-1" onClick={() => openProductPage(asin)}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Open product page
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" className="flex-1" onClick={() => copyAffiliateLink(asin)}>
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
      
      {searchResults.length === 0 && searchOptions.keyword && !isLoading && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">No products found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters to find more products
          </p>
        </div>
      )}
    </div>
  );
}