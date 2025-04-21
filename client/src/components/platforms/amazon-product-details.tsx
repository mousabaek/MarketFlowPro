import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, Clipboard, Check, DollarSign, Star, Tag, BarChart4 } from "lucide-react";

interface AmazonProductDetailsProps {
  platformId: number;
  asin: string;
  onClose?: () => void;
}

interface ProductData {
  title: string;
  asin: string;
  price: {
    amount: number;
    currency: string;
    formattedPrice: string;
  };
  imageUrl: string;
  images?: string[];
  detailPageUrl: string;
  rating?: {
    value: number;
    totalReviews: number;
  };
  categories: string[];
  features?: string[];
  description?: string;
  availability: string;
  brand?: string;
  affiliateLink?: string;
  estimatedCommission?: number;
}

export function AmazonProductDetails({ platformId, asin, onClose }: AmazonProductDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: product, isLoading, isError } = useQuery({
    queryKey: [`/api/platforms/${platformId}/amazon/products/${asin}`],
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

  // Open product in Amazon
  const handleOpenInAmazon = (url: string) => {
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading product details...</span>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center p-12">
        <p className="text-lg font-semibold text-red-500">
          Failed to load product details
        </p>
        <p className="text-gray-500 mt-2">
          There was an error loading the product information from Amazon.
        </p>
        <Button onClick={onClose} variant="outline" className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  // Format the estimated commission with two decimal places
  const formattedCommission = product.estimatedCommission 
    ? `$${product.estimatedCommission.toFixed(2)}` 
    : 'Varies based on category';

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{product.title}</h2>
          <div className="flex items-center mt-1 space-x-2">
            <Badge variant="outline">{product.brand || "Amazon"}</Badge>
            <Badge variant="outline">ASIN: {product.asin}</Badge>
            {product.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{product.rating.value} ({product.rating.totalReviews})</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleCopyLink(product.affiliateLink || product.detailPageUrl)}
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
            onClick={() => handleOpenInAmazon(product.detailPageUrl)}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View on Amazon
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Product Image */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-center bg-gray-50 p-4 rounded-md">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="max-h-64 object-contain"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {product.images.slice(0, 4).map((img, idx) => (
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
                <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                Affiliate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-semibold">{product.price?.formattedPrice || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Commission:</span>
                  <span className="font-semibold text-green-600">{formattedCommission}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className={product.availability.includes("In Stock") ? "text-green-600" : "text-red-500"}>
                    {product.availability}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Product Details */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="features" className="flex-1">Features & Specs</TabsTrigger>
              <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {product.description || "No detailed description available for this product."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="features" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Product Features</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.features && product.features.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      {product.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No features available for this product.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Product Categories</CardTitle>
                  <CardDescription>
                    Categories help determine commission rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.categories && product.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          {category}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No category information available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <BarChart4 className="h-4 w-4 mr-1 text-primary" />
                Marketing Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>Items in this category typically convert at 3.2% and generate an average of $12.50 in commission per sale. Top traffic sources include Pinterest (32%), Instagram (24%), and organic search (18%).</p>
                <div className="flex items-center justify-end mt-2">
                  <Button variant="outline" size="sm">View Detailed Analytics</Button>
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