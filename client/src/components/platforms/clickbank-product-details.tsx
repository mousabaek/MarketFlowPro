import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  ExternalLink, 
  Clipboard, 
  Check, 
  DollarSign, 
  Star, 
  Tag, 
  BarChart, 
  TrendingUp,
  Users,
  RefreshCw,
  ThumbsUp,
  HeartPulse,
  Briefcase,
  GraduationCap
} from "lucide-react";

interface ClickBankProductDetailsProps {
  platformId: number;
  productId: string;
  onClose?: () => void;
}

export function ClickBankProductDetails({ platformId, productId, onClose }: ClickBankProductDetailsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: product, isLoading, isError } = useQuery({
    queryKey: [`/api/platforms/${platformId}/clickbank/products/${productId}`],
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

  // Open product in ClickBank
  const handleOpenInClickBank = (url: string) => {
    window.open(url, "_blank");
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case "health & fitness":
        return <HeartPulse className="h-5 w-5 text-green-500" />;
      case "business/investing":
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case "education":
        return <GraduationCap className="h-5 w-5 text-purple-500" />;
      default:
        return <Tag className="h-5 w-5 text-gray-500" />;
    }
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
          There was an error loading the product information from ClickBank.
        </p>
        <Button onClick={onClose} variant="outline" className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{product.title}</h2>
          <div className="flex items-center mt-1 space-x-2">
            <Badge variant="outline" className="flex items-center">
              {getCategoryIcon(product.category)}
              <span className="ml-1">{product.category}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              {product.pricing.formattedPrice}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Gravity: {product.vendor.gravity}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleCopyLink(product.affiliate.hopLink)}
          >
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Clipboard className="h-4 w-4 mr-1" />
            )}
            Copy Affiliate Link
          </Button>
          <Button 
            size="sm"
            onClick={() => handleOpenInClickBank(`https://vendor.clickbank.net/cbid=${productId}`)}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View on ClickBank
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-center bg-gray-50 p-4 rounded-md">
                <img
                  src={product.content.images[0]}
                  alt={product.title}
                  className="max-h-64 object-contain"
                />
              </div>
              {product.content.images.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {product.content.images.slice(1).map((img, idx) => (
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
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Commission:</span>
                  <span className="font-semibold">{product.affiliate.commission}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Earnings/Sale:</span>
                  <span className="font-semibold text-green-600">${product.affiliate.averageEarningsPerSale}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conversion Rate:</span>
                  <span className="font-semibold">{product.affiliate.conversionRate}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Billing Type:</span>
                  <span>
                    {product.pricing.hasRebill 
                      ? `Initial + ${product.pricing.billingFrequency} rebills` 
                      : "One-time payment"}
                  </span>
                </div>
                {product.pricing.hasTrialPeriod && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trial Period:</span>
                    <span>{product.pricing.trialPeriodDays} days</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Has Upsells:</span>
                  <span>{product.pricing.hasUpsells ? "Yes" : "No"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Users className="h-4 w-4 mr-1 text-blue-600" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vendor:</span>
                  <span className="font-semibold">{product.vendor.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gravity Score:</span>
                  <span className="font-semibold">{product.vendor.gravity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Sales:</span>
                  <span>{product.vendor.totalSales.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
              <TabsTrigger value="statistics" className="flex-1">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {product.description}
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
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    {product.content.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle>Testimonials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.content.testimonials.map((testimonial, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <ThumbsUp className="h-4 w-4 text-primary" />
                          </div>
                          <div className="ml-2">
                            <p className="font-medium text-sm">{testimonial.name}</p>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3 w-3 ${i < testimonial.rating ? 'text-yellow-500' : 'text-gray-300'}`} 
                                  fill={i < testimonial.rating ? 'currentColor' : 'none'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm">{testimonial.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="statistics" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BarChart className="h-4 w-4 mr-2 text-primary" />
                    Performance Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Refund Rate</span>
                        <span className="font-medium">{product.stats.refundRate}</span>
                      </div>
                      <Progress 
                        value={parseFloat(product.stats.refundRate) * 100} 
                        className="h-2" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Active Affiliates</span>
                        <span className="font-medium">{product.stats.activeAffiliates}</span>
                      </div>
                      <Progress 
                        value={Math.min((product.stats.activeAffiliates / 500) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Competition Level</span>
                        <span className="font-medium">{product.stats.competitionScore}</span>
                      </div>
                      <Progress 
                        value={
                          product.stats.competitionScore === "Low" ? 30 :
                          product.stats.competitionScore === "Medium" ? 60 : 90
                        } 
                        className="h-2" 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Market Comparison</h3>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Commission Rate</div>
                          <div className="font-medium flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            {product.affiliate.commission}
                            <span className="text-xs text-green-500 ml-1">
                              (15% above avg.)
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Gravity Score</div>
                          <div className="font-medium flex items-center mt-1">
                            {product.vendor.gravity > 100 ? (
                              <>
                                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                                <span className="text-xs text-green-500 ml-1">
                                  (Top 10%)
                                </span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1 text-yellow-500" />
                                <span className="text-xs text-yellow-500 ml-1">
                                  (Average)
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-primary" />
                Promotion Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2 text-sm">
                <p>
                  This product performs well with email marketing and review blogs. Consider creating a review 
                  article or comparison with similar products in the {product.category} niche.
                </p>
                <div className="flex justify-between mt-2">
                  <Button variant="outline" size="sm">
                    <Clipboard className="h-4 w-4 mr-1" />
                    Generate Review Template
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart className="h-4 w-4 mr-1" />
                    View Similar Products
                  </Button>
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
          <Button variant="secondary" onClick={() => handleCopyLink(product.affiliate.hopLink)}>
            <Clipboard className="h-4 w-4 mr-1" />
            Copy Affiliate Link
          </Button>
          <Button>
            Add to Campaign
          </Button>
        </div>
      </div>
    </div>
  );
}