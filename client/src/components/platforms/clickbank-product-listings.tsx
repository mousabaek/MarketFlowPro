import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Search, 
  Filter, 
  DollarSign, 
  Eye, 
  TrendingUp,
  ArrowUpDown,
  Star,
  HeartPulse,
  Briefcase,
  GraduationCap,
  SlidersHorizontal
} from "lucide-react";
import { ClickBankProductDetails } from "./clickbank-product-details";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClickBankProductListingsProps {
  platformId: number;
}

export function ClickBankProductListings({ platformId }: ClickBankProductListingsProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState("gravity");

  const queryClient = useQueryClient();

  // Query products
  const { data, isLoading, isError } = useQuery({
    queryKey: [`/api/platforms/${platformId}/clickbank/products`, { search, category, page, limit, sortBy }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("query", search);
      if (category) queryParams.set("category", category);
      queryParams.set("page", page.toString());
      queryParams.set("limit", limit.toString());
      
      const resp = await apiRequest("GET", `/api/platforms/${platformId}/clickbank/products?${queryParams.toString()}`);
      return resp.json();
    },
  });

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch(category.toLowerCase()) {
      case "health & fitness":
        return <HeartPulse className="h-4 w-4 text-green-500" />;
      case "business/investing":
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case "education":
        return <GraduationCap className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(1); // Reset to first page on new search
  };

  // View product details
  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsProductDialogOpen(true);
  };

  // Generate pagination
  const generatePagination = () => {
    if (!data?.pagination) return null;
    
    const { page, totalPages } = data.pagination;
    const pageNumbers = [];
    
    // Always include first page
    pageNumbers.push(1);
    
    // Add pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Always include last page if there are more than 1 page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    // Remove duplicates and sort
    const uniquePages = Array.from(new Set(pageNumbers)).sort((a, b) => a - b);
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPage(Math.max(1, page - 1))}
              className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {uniquePages.map((pageNum, index) => {
            // Add ellipsis if there's a gap
            if (index > 0 && pageNum > uniquePages[index - 1] + 1) {
              return (
                <PaginationItem key={`ellipsis-${pageNum}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={page === pageNum}
                  onClick={() => setPage(pageNum)}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>ClickBank Products</CardTitle>
              <CardDescription>
                Browse and search for affiliate products on ClickBank
              </CardDescription>
            </div>
            <Tabs defaultValue="all" className="w-[400px]">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setCategory("")}>All Products</TabsTrigger>
                <TabsTrigger value="health" onClick={() => setCategory("Health & Fitness")}>
                  <HeartPulse className="h-4 w-4 mr-1" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="business" onClick={() => setCategory("Business/Investing")}>
                  <Briefcase className="h-4 w-4 mr-1" />
                  Business
                </TabsTrigger>
                <TabsTrigger value="education" onClick={() => setCategory("Education")}>
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Education
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by keyword..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gravity">Popularity (Gravity)</SelectItem>
                  <SelectItem value="commission">Commission Rate</SelectItem>
                  <SelectItem value="price">Price (High to Low)</SelectItem>
                  <SelectItem value="earnings">Avg. Earnings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-500 font-medium">Failed to load products</p>
              <p className="text-muted-foreground mt-1">Please try again later</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ 
                  queryKey: [`/api/platforms/${platformId}/clickbank/products`] 
                })}
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.products.map((product: any) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewProduct(product.id)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base line-clamp-1">{product.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            {getCategoryIcon(product.category)}
                            <span className="ml-1">{product.category}</span>
                          </CardDescription>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {product.gravity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium flex items-center">
                            <DollarSign className="h-3 w-3 mr-0.5" />
                            {product.initialPrice}
                            {product.recurring && (
                              <span className="text-xs ml-1 text-muted-foreground">+ rebills</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Commission</p>
                          <p className="font-medium text-green-600">{product.commission}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg. Earnings</p>
                          <p className="font-medium">${product.avgEarningsPerSale}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion</p>
                          <p className="font-medium">{product.conversionRate}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="ghost" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, data.pagination.total)} 
                  of {data.pagination.total} products
                </div>
                {generatePagination()}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View detailed information and affiliate resources for this product
            </DialogDescription>
          </DialogHeader>
          {selectedProductId && (
            <ClickBankProductDetails 
              platformId={platformId} 
              productId={selectedProductId} 
              onClose={() => setIsProductDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}