import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import OpportunitiesTable from "@/components/dashboard/opportunities-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Opportunities() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  
  // Calculate offset based on pagination
  const offset = (currentPage - 1) * itemsPerPage;
  
  // Fetch opportunities with pagination
  const { data: opportunitiesData, isLoading } = useQuery({
    queryKey: ['/api/opportunities', { limit: itemsPerPage, offset, status: activeTab !== 'all' ? activeTab : undefined }],
    queryFn: async ({ queryKey }) => {
      const [_, params] = queryKey;
      const searchParams = new URLSearchParams({
        limit: params.limit.toString(),
        offset: params.offset.toString()
      });
      
      if (params.status) {
        searchParams.append('status', params.status as string);
      }
      
      const res = await fetch(`/api/opportunities?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch opportunities');
      return res.json();
    }
  });
  
  // Filter opportunities based on search term and platform filter
  const filteredOpportunities = opportunitiesData?.opportunities.filter(opp => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (opp.description && opp.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by platform
    const matchesPlatform = platformFilter === "all" || opp.platformType === platformFilter;
    
    return matchesSearch && matchesPlatform;
  });
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Opportunities</h1>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search opportunities..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="clickbank">Clickbank</SelectItem>
            <SelectItem value="fiverr">Fiverr</SelectItem>
            <SelectItem value="upwork">Upwork</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Opportunity Status Tabs */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="missed">Missed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <OpportunitiesTable 
            opportunities={filteredOpportunities} 
            pagination={{
              total: opportunitiesData?.pagination.total || 0,
              limit: itemsPerPage,
              offset
            }}
            isLoading={isLoading}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <OpportunitiesTable 
            opportunities={filteredOpportunities} 
            pagination={{
              total: opportunitiesData?.pagination.total || 0,
              limit: itemsPerPage,
              offset
            }}
            isLoading={isLoading}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          <OpportunitiesTable 
            opportunities={filteredOpportunities} 
            pagination={{
              total: opportunitiesData?.pagination.total || 0,
              limit: itemsPerPage,
              offset
            }}
            isLoading={isLoading}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <OpportunitiesTable 
            opportunities={filteredOpportunities} 
            pagination={{
              total: opportunitiesData?.pagination.total || 0,
              limit: itemsPerPage,
              offset
            }}
            isLoading={isLoading}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </TabsContent>
        
        <TabsContent value="missed" className="mt-4">
          <OpportunitiesTable 
            opportunities={filteredOpportunities} 
            pagination={{
              total: opportunitiesData?.pagination.total || 0,
              limit: itemsPerPage,
              offset
            }}
            isLoading={isLoading}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
