import { useState } from "react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, PanelLeftIcon, PanelRightIcon, Layers3 } from "lucide-react";
// Import the components with named imports
import { AmazonProductDetails } from "@/components/platforms/amazon-product-details";
import { EtsyListingDetails } from "@/components/platforms/etsy-listing-details";
import { FreelancerProjectDetails } from "@/components/platforms/freelancer-project-details";
import { ClickBankProductDetails } from "@/components/platforms/clickbank-product-details";
import { ClickBankProductListings } from "@/components/platforms/clickbank-product-listings";

export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState("amazon");
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  
  // Demo IDs
  const amazonAsin = "B07PXGQC1Q";
  const etsyListingId = 1234567890;
  const freelancerProjectId = 12345;
  const clickbankProductId = "cb123";
  
  // Demo platformId (could be any number since we're using mock data)
  const platformId = 1;
  
  const togglePanel = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/dashboard" className="text-primary hover:underline flex items-center mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Component Showcase</h1>
        </div>
        
        <Button variant="outline" size="sm" onClick={togglePanel}>
          {isPanelExpanded ? (
            <PanelLeftIcon className="h-4 w-4 mr-1" />
          ) : (
            <PanelRightIcon className="h-4 w-4 mr-1" />
          )}
          {isPanelExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        </Button>
      </div>

      <div className={`grid grid-cols-1 ${isPanelExpanded ? 'lg:grid-cols-4' : 'lg:grid-cols-8'} gap-6`}>
        {/* Sidebar */}
        {isPanelExpanded && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers3 className="h-5 w-5 mr-2 text-primary" />
                  Platform Components
                </CardTitle>
                <CardDescription>
                  View detailed components for different platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    variant={activeTab === "amazon" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("amazon")}
                  >
                    Amazon Product Details
                  </Button>
                  <Button 
                    variant={activeTab === "etsy" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("etsy")}
                  >
                    Etsy Listing Details
                  </Button>
                  <Button 
                    variant={activeTab === "freelancer" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("freelancer")}
                  >
                    Freelancer Project Details
                  </Button>
                  <Button 
                    variant={activeTab === "clickbank" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("clickbank")}
                  >
                    ClickBank Product Details
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  These components display detailed information for platform items
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
        
        {/* Main Content */}
        <div className={`${isPanelExpanded ? 'lg:col-span-3' : 'lg:col-span-8'}`}>
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">
                {activeTab === "amazon" && "Amazon Product Details"}
                {activeTab === "etsy" && "Etsy Listing Details"}
                {activeTab === "freelancer" && "Freelancer Project Details"}
                {activeTab === "clickbank" && "ClickBank Product Details"}
              </CardTitle>
              <CardDescription>
                {activeTab === "amazon" && "Displays detailed information about an Amazon product with affiliate data"}
                {activeTab === "etsy" && "Shows a comprehensive view of an Etsy listing with shop information"}
                {activeTab === "freelancer" && "Presents project details from Freelancer.com with bid submission options"}
                {activeTab === "clickbank" && "Provides complete information about a ClickBank product including affiliate metrics and promotion suggestions"}
              </CardDescription>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden">
                <TabsList>
                  <TabsTrigger value="amazon">Amazon</TabsTrigger>
                  <TabsTrigger value="etsy">Etsy</TabsTrigger>
                  <TabsTrigger value="freelancer">Freelancer</TabsTrigger>
                  <TabsTrigger value="clickbank">ClickBank</TabsTrigger>
                </TabsList>
                
                <TabsContent value="amazon">
                  <AmazonProductDetails platformId={platformId} asin={amazonAsin} />
                </TabsContent>
                
                <TabsContent value="etsy">
                  <EtsyListingDetails platformId={platformId} listingId={etsyListingId} />
                </TabsContent>
                
                <TabsContent value="freelancer">
                  <FreelancerProjectDetails platformId={platformId} projectId={freelancerProjectId} />
                </TabsContent>
                
                <TabsContent value="clickbank">
                  <ClickBankProductDetails platformId={platformId} productId={clickbankProductId} />
                </TabsContent>
              </Tabs>
              
              {/* Show active component directly */}
              {activeTab === "amazon" && <AmazonProductDetails platformId={platformId} asin={amazonAsin} />}
              {activeTab === "etsy" && <EtsyListingDetails platformId={platformId} listingId={etsyListingId} />}
              {activeTab === "freelancer" && <FreelancerProjectDetails platformId={platformId} projectId={freelancerProjectId} />}
              {activeTab === "clickbank" && <ClickBankProductDetails platformId={platformId} productId={clickbankProductId} />}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Component Documentation</h2>
        <p className="text-muted-foreground mb-4">
          These components are designed to be integrated with the platform's API to display detailed information about items from each platform.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-medium mb-2">AmazonProductDetails</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Displays product information, pricing, features, and affiliate details for Amazon products.
            </p>
            <Badge>Affiliate</Badge>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-medium mb-2">EtsyListingDetails</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Shows listing information, shop details, images, tags, and categories for Etsy items.
            </p>
            <Badge>Affiliate</Badge>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-medium mb-2">FreelancerProjectDetails</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Presents project information, client details, bid statistics, and allows submitting proposals.
            </p>
            <Badge>Freelance</Badge>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-medium mb-2">ClickBankProductDetails</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Shows comprehensive product information, affiliate metrics, testimonials, and promotion suggestions for ClickBank products.
            </p>
            <Badge>Affiliate</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}