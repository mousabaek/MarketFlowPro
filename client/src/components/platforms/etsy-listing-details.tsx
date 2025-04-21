import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Clipboard, Check, Store, Star, Tag, BarChart4, Heart, MessageCircle, ShoppingBag, Clock } from "lucide-react";
import { format } from "date-fns";

interface EtsyListingDetailsProps {
  platformId: number;
  listingId: number;
  onClose?: () => void;
}

interface ShopInfo {
  shopId: number;
  shopName: string;
  url: string;
  iconUrl?: string;
  saleCount: number;
  reviewCount: number;
  rating: number;
}

interface ListingData {
  listingId: number;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    formattedPrice: string;
  };
  url: string;
  imageUrl: string;
  images: string[];
  shop: ShopInfo;
  tags: string[];
  categories: string[];
  creationDate: string;
  lastModified: string;
  views: number;
  favorites: number;
  inStock: boolean;
  quantity: number;
  affiliateLink?: string;
  estimatedCommission?: number;
  shippingInfo?: {
    primaryCountry: string;
    processingDays: string;
  };
}

export function EtsyListingDetails({ platformId, listingId, onClose }: EtsyListingDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: [`/api/platforms/${platformId}/etsy/listings/${listingId}`],
    retry: 1,
  });

  // Handle copy to clipboard
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link copied",
        description: "Affiliate link copied to clipboard"
      });
    });
  };

  // Open listing in Etsy
  const handleOpenInEtsy = (url: string) => {
    window.open(url, "_blank");
  };

  // View Shop
  const handleViewShop = (shopUrl: string) => {
    window.open(shopUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading listing details...</span>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="text-center p-12">
        <p className="text-lg font-semibold text-red-500">
          Failed to load listing details
        </p>
        <p className="text-gray-500 mt-2">
          There was an error loading the listing information from Etsy.
        </p>
        <Button onClick={onClose} variant="outline" className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  // Format the estimated commission with two decimal places
  const formattedCommission = listing.estimatedCommission 
    ? `$${listing.estimatedCommission.toFixed(2)}` 
    : 'Estimated 3-5% of sale price';

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{listing.title}</h2>
          <div className="flex items-center mt-1 space-x-2">
            <Badge className="bg-[#F56400] hover:bg-[#E05800]">Etsy</Badge>
            <Badge variant="outline">ID: {listing.listingId}</Badge>
            <div className="flex items-center">
              <div className="flex items-center">
                <Heart className="h-4 w-4 text-rose-500 mr-1" />
                <span className="text-sm font-medium">{listing.favorites || 0}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleCopyLink(listing.affiliateLink || listing.url)}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Clipboard className="h-4 w-4 mr-1" />
            )}
            Copy Link
          </Button>
          <Button 
            size="sm"
            onClick={() => handleOpenInEtsy(listing.url)}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View on Etsy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Listing Image */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-center bg-gray-50 p-4 rounded-md">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="max-h-64 object-contain"
                />
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {listing.images.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="bg-gray-50 p-1 rounded">
                      <img
                        src={img}
                        alt={`Product view ${idx + 1}`}
                        className="h-16 w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Store className="h-4 w-4 mr-1 text-[#F56400]" />
                Shop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center space-x-3 mb-3">
                {listing.shop.iconUrl ? (
                  <img 
                    src={listing.shop.iconUrl} 
                    alt={listing.shop.shopName} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Store className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{listing.shop.shopName}</h3>
                  <div className="flex items-center text-sm">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <span>{listing.shop.rating} ({listing.shop.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="text-sm">
                <div className="flex justify-between my-1">
                  <span className="text-muted-foreground">Total Sales:</span>
                  <span>{listing.shop.saleCount.toLocaleString()}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => handleViewShop(listing.shop.url)}
              >
                <Store className="h-4 w-4 mr-1" /> View Shop
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <ShoppingBag className="h-4 w-4 mr-1 text-green-600" />
                Listing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold">{listing.price?.formattedPrice || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Commission:</span>
                  <span className="font-semibold text-green-600">{formattedCommission}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className={listing.inStock ? "text-green-600" : "text-red-500"}>
                    {listing.inStock ? `In Stock (${listing.quantity})` : "Out of Stock"}
                  </span>
                </div>
                {listing.shippingInfo && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ships From:</span>
                      <span>{listing.shippingInfo.primaryCountry}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing Time:</span>
                      <span>{listing.shippingInfo.processingDays}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>
                    {listing.creationDate && format(new Date(listing.creationDate), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Listing Details */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Description</TabsTrigger>
              <TabsTrigger value="tags" className="flex-1">Tags & Categories</TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {listing.description || "No detailed description available for this listing."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tags" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>
                    Tags used by the seller to categorize this item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {listing.tags && listing.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No tags available.</p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Etsy categories for this listing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {listing.categories && listing.categories.length > 0 ? (
                    <div className="space-y-1">
                      {listing.categories.map((category, idx) => (
                        <div key={idx} className="text-sm">
                          {category}
                          {idx < listing.categories.length - 1 && (
                            <Separator className="my-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No category information available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BarChart4 className="h-4 w-4 mr-2 text-primary" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-muted-foreground text-xs mb-1">Views</div>
                      <div className="font-semibold text-lg flex justify-center items-center">
                        <ExternalLink className="h-3 w-3 mr-1 text-primary" />
                        {listing.views || 0}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-muted-foreground text-xs mb-1">Favorites</div>
                      <div className="font-semibold text-lg flex justify-center items-center">
                        <Heart className="h-3 w-3 mr-1 text-rose-500" />
                        {listing.favorites || 0}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-muted-foreground text-xs mb-1">Click Rate</div>
                      <div className="font-semibold text-lg">3.2%</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                      <div className="text-muted-foreground text-xs mb-1">Conversion</div>
                      <div className="font-semibold text-lg">1.8%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p>Similar listings in this category typically convert at 2.5% and generate an average of $3.75 in commission per sale. Top traffic sources include Pinterest (42%), Instagram (35%), and organic search (15%).</p>
                    <div className="flex items-center justify-end mt-2">
                      <Button variant="outline" size="sm">View Detailed Analytics</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <MessageCircle className="h-4 w-4 mr-1 text-primary" />
                Marketing Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>This listing has high engagement metrics and would be ideal for Pinterest promotion due to its strong visual appeal. Consider creating a "Gift Ideas" collection that includes this item to increase conversion rates.</p>
                <div className="bg-primary/5 p-3 rounded-md mt-3">
                  <p className="font-medium text-xs text-primary mb-1">Suggested Caption:</p>
                  <p className="text-sm italic">
                    "Perfect for any occasion! Check out this beautiful handmade item that's getting rave reviews. #handmade #giftideas"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <div className="flex space-x-2">
          <Button variant="secondary">
            <Clipboard className="h-4 w-4 mr-1" />
            Create Promotion
          </Button>
          <Button>
            Add to Workflow
          </Button>
        </div>
      </div>
    </div>
  );
}