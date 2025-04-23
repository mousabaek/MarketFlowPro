import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MaintenanceRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  Loader2, 
  AlertTriangle, 
  Check, 
  X, 
  Clock, 
  ArrowRight, 
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  BugIcon,
  Lightbulb, 
  WrenchIcon,
  HelpCircle,
  MoreHorizontal
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

// Helper function to get badge color based on status
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    case "pending_approval":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending Approval</Badge>;
    case "approved":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
    case "in_progress":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">In Progress</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
    case "failed":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Helper function to get icon for request type
const getTypeIcon = (type: string) => {
  switch (type) {
    case "bug":
      return <BugIcon className="h-4 w-4" />;
    case "feature":
      return <Lightbulb className="h-4 w-4" />;
    case "improvement":
      return <WrenchIcon className="h-4 w-4" />;
    case "question":
      return <HelpCircle className="h-4 w-4" />;
    default:
      return <MoreHorizontal className="h-4 w-4" />;
  }
};

// Helper function to get badge for priority
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "low":
      return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Low</Badge>;
    case "medium":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Medium</Badge>;
    case "high":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>;
    case "critical":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Critical</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export default function MaintenanceRequestList() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  // Fetch maintenance requests
  const { data: requests, isLoading, error } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance"],
    queryFn: async () => {
      const res = await fetch("/api/maintenance");
      if (!res.ok) {
        throw new Error("Failed to fetch maintenance requests");
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error Loading Maintenance Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">
            {error instanceof Error ? error.message : "An unknown error occurred"}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-red-200 text-red-700 hover:bg-red-100"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle className="text-slate-700 flex items-center">
            <Info className="mr-2 h-5 w-5" />
            No Maintenance Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            There are no maintenance requests to display. Use the form to create a new request.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <Card key={request.id} className="overflow-hidden">
          <div 
            className={`h-1 w-full ${
              request.status === "completed" ? "bg-green-500" :
              request.status === "rejected" || request.status === "failed" ? "bg-red-500" :
              request.status === "in_progress" ? "bg-purple-500" :
              request.status === "approved" ? "bg-green-400" :
              request.status === "pending_approval" ? "bg-blue-500" :
              "bg-yellow-500"
            }`}
          />
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{request.title}</span>
                  <span className="text-sm font-normal">#{request.id}</span>
                </CardTitle>
                <CardDescription className="mt-1 flex flex-wrap gap-2 items-center">
                  <span>
                    Submitted {formatDistanceToNow(new Date(request.createdAt || Date.now()), { addSuffix: true })}
                  </span>
                  <span className="flex items-center space-x-1">
                    {getTypeIcon(request.type)}
                    <span className="capitalize">{request.type}</span>
                  </span>
                  <span className="capitalize">{request.area}</span>
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {getStatusBadge(request.status)}
                {getPriorityBadge(request.priority)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-sm text-gray-600 whitespace-pre-line">
              {request.description}
            </div>
            
            {request.aiAnalysis && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">AI Analysis</h4>
                <div className="bg-slate-50 p-3 rounded-md text-sm">
                  <p><strong>Root Cause:</strong> {request.aiAnalysis.rootCause}</p>
                  <p className="mt-1"><strong>Impact:</strong> {request.aiAnalysis.impactSeverity}</p>
                  <p className="mt-1"><strong>Affected Components:</strong> {request.aiAnalysis.affectedComponents.join(", ")}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-gray-500">
              {request.adminApproval !== undefined && (
                <div className="flex items-center space-x-1">
                  {request.adminApproval ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Approved by admin</span>
                    </>
                  ) : request.status === "rejected" ? (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Rejected by admin</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>Awaiting admin approval</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {isAdmin && request.status === "pending_approval" && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => {
                    // Implement reject logic
                    toast({
                      title: "Not implemented",
                      description: "Rejection functionality will be added soon",
                    });
                  }}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // Implement approve logic
                    toast({
                      title: "Not implemented",
                      description: "Approval functionality will be added soon",
                    });
                  }}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}
            
            {request.status === "in_progress" && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                Processing...
              </Badge>
            )}
            
            {request.status === "completed" && request.completedAt && (
              <span className="text-sm text-gray-500">
                Completed {formatDistanceToNow(new Date(request.completedAt), { addSuffix: true })}
              </span>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}