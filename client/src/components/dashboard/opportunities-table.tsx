import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { OpportunityWithPlatform } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OpportunitiesTableProps {
  opportunities?: OpportunityWithPlatform[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
  isLoading: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function OpportunitiesTable({ 
  opportunities, 
  pagination, 
  isLoading,
  currentPage = 1,
  onPageChange
}: OpportunitiesTableProps) {
  const getPlatformStyles = (platformType: string) => {
    switch (platformType) {
      case 'clickbank':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          icon: 'CB'
        };
      case 'fiverr':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          icon: 'FV'
        };
      case 'upwork':
        return {
          bg: 'bg-teal-100',
          text: 'text-teal-600',
          icon: 'UW'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          icon: 'P'
        };
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Opportunity</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24 ml-4" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : !opportunities || opportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                  No opportunities found
                </TableCell>
              </TableRow>
            ) : (
              opportunities.map((opportunity) => {
                const platformStyle = getPlatformStyles(opportunity.platformType);
                const metadata = opportunity.metadata as any || {};
                
                return (
                  <TableRow key={opportunity.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", platformStyle.bg)}>
                          <span className={cn("font-bold text-xs", platformStyle.text)}>
                            {opportunity.platformIcon || platformStyle.icon}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {opportunity.platformName || opportunity.platformType.charAt(0).toUpperCase() + opportunity.platformType.slice(1)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{opportunity.title}</div>
                      <div className="text-xs text-gray-500">{opportunity.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{opportunity.value}</div>
                      <div className="text-xs text-gray-500">{metadata.commission || metadata.priceType || metadata.estimatedHours}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        getStatusBadgeStyles(opportunity.status)
                      )}>
                        {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-gray-500">
                      {metadata.date || new Date(opportunity.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" className="text-primary h-auto p-0 text-sm font-medium">View</Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination && pagination.total > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.offset + pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> opportunities
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  // Show pages around the current page
                  let pageNumber = currentPage - 2 + idx;
                  
                  // Adjust if we're at the start or end
                  if (currentPage < 3) {
                    pageNumber = idx + 1;
                  } else if (currentPage > totalPages - 2) {
                    pageNumber = totalPages - 4 + idx;
                  }
                  
                  // Skip invalid page numbers
                  if (pageNumber < 1 || pageNumber > totalPages) {
                    return null;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      className="rounded-none"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
