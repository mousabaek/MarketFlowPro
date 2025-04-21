import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ProfessionalCard, 
  ProfessionalMetricCard 
} from "@/components/ui/professional-card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Lock, 
  UserCheck, 
  UserX, 
  Search, 
  Download, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  Plus, 
  Loader2, 
  MoreHorizontal, 
  Trash, 
  Edit, 
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  // Mock Admin User
  const adminUser = {
    name: "Mousa AL Qawasmeh",
    email: "mousa.baek90@gmail.com",
    role: "Admin"
  };
  
  // Filter users or payments based on search query
  const filterItems = (items: any[], query: string) => {
    if (!query) return items;
    return items.filter(item => 
      Object.values(item).some(
        value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(query.toLowerCase())
      )
    );
  };
  
  // Toggle user selection
  const toggleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  // Toggle select all users
  const toggleSelectAllUsers = () => {
    if (selectedUsers.length === recentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(recentUsers.map(user => user.id));
    }
  };
  
  // Export data function
  const exportData = async (type: string) => {
    setIsExporting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export successful",
        description: `${type} data has been exported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Mock data for users
  const recentUsers = [
    { 
      id: "USER123", 
      name: "John Smith", 
      email: "john.smith@example.com", 
      joined: "Apr 15, 2025", 
      status: "Active",
      earnings: "$856.40",
      commissions: "$214.10"
    },
    { 
      id: "USER124", 
      name: "Emily Johnson", 
      email: "emily.j@example.com", 
      joined: "Apr 12, 2025", 
      status: "Active",
      earnings: "$1,245.80",
      commissions: "$311.45"
    },
    { 
      id: "USER125", 
      name: "Michael Brown", 
      email: "michael.b@example.com", 
      joined: "Apr 10, 2025", 
      status: "Pending",
      earnings: "$0.00",
      commissions: "$0.00"
    },
    { 
      id: "USER126", 
      name: "Sarah Wilson", 
      email: "sarah.w@example.com", 
      joined: "Apr 5, 2025", 
      status: "Active",
      earnings: "$432.60",
      commissions: "$108.15"
    },
    { 
      id: "USER127", 
      name: "David Lee", 
      email: "david.lee@example.com", 
      joined: "Mar 28, 2025", 
      status: "Suspended",
      earnings: "$125.20",
      commissions: "$31.30"
    },
  ];
  
  // Mock data for recent payments
  const recentPayments = [
    { 
      id: "PMT3245", 
      user: "John Smith", 
      email: "john.smith@example.com",
      date: "Apr 18, 2025", 
      amount: "$150.00", 
      status: "Completed",
      method: "PayPal",
      platformFee: "$30.00"
    },
    { 
      id: "PMT3244", 
      user: "Emily Johnson", 
      email: "emily.j@example.com",
      date: "Apr 16, 2025", 
      amount: "$275.50", 
      status: "Completed",
      method: "Bank Transfer",
      platformFee: "$55.10"
    },
    { 
      id: "PMT3243", 
      user: "Sarah Wilson", 
      email: "sarah.w@example.com",
      date: "Apr 14, 2025", 
      amount: "$120.80", 
      status: "Processing",
      method: "Stripe",
      platformFee: "$24.16"
    },
    { 
      id: "PMT3242", 
      user: "David Lee", 
      email: "david.lee@example.com",
      date: "Apr 12, 2025", 
      amount: "$95.40", 
      status: "Failed",
      method: "PayPal",
      platformFee: "$19.08"
    },
    { 
      id: "PMT3241", 
      user: "John Smith", 
      email: "john.smith@example.com",
      date: "Apr 10, 2025", 
      amount: "$200.00", 
      status: "Completed",
      method: "PayPal",
      platformFee: "$40.00"
    },
  ];
  
  // Mock data for platform stats
  const platformStats = {
    totalUsers: 287,
    activeUsers: 194,
    totalRevenue: 12684.75,
    platformCommissions: 2536.95,
    userEarnings: 10147.80,
    pendingPayouts: 1845.60,
    failedPayments: 342.30,
    growthRate: 18.5,
    conversionRate: 8.4,
    activeIntegrations: 347
  };
  
  // Platform revenue by month
  const revenueByMonth = [
    { month: "January", revenue: 1245.60, commissions: 249.12 },
    { month: "February", revenue: 1560.80, commissions: 312.16 },
    { month: "March", revenue: 1875.40, commissions: 375.08 },
    { month: "April", revenue: 2210.30, commissions: 442.06 },
    { month: "May", revenue: 2540.75, commissions: 508.15 },
  ];
  
  // Commission by platform
  const commissionByPlatform = [
    { platform: "Amazon Associates", amount: 845.20, percentage: 33 },
    { platform: "ClickBank", amount: 760.80, percentage: 30 },
    { platform: "Etsy", amount: 432.45, percentage: 17 },
    { platform: "Freelancer", amount: 498.50, percentage: 20 },
  ];
  
  // Filtered users and payments
  const filteredUsers = filterItems(recentUsers, searchQuery);
  const filteredPayments = filterItems(recentPayments, searchQuery);
  
  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            <Lock className="h-3.5 w-3.5 mr-1" />
            Admin Access
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, monitor platform activity, and track revenue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-right">
            <p className="font-medium">{adminUser.name}</p>
            <p className="text-muted-foreground">{adminUser.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <span>MA</span>
          </div>
        </div>
      </div>
      
      {/* Admin Dashboard Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ProfessionalMetricCard
          title="Total Users"
          value={platformStats.totalUsers.toString()}
          description={`${platformStats.activeUsers} active users`}
          trend={{ value: 12, isPositive: true }}
          icon={<Users className="h-5 w-5" />}
        />
        <ProfessionalMetricCard
          title="Total Revenue"
          value={`$${platformStats.totalRevenue.toFixed(2)}`}
          description="All time"
          trend={{ value: platformStats.growthRate, isPositive: true }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <ProfessionalMetricCard
          title="Platform Commissions"
          value={`$${platformStats.platformCommissions.toFixed(2)}`}
          description="20% of total revenue"
          trend={{ value: platformStats.growthRate, isPositive: true }}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <ProfessionalMetricCard
          title="Active Integrations"
          value={platformStats.activeIntegrations.toString()}
          description={`${platformStats.conversionRate}% conversion rate`}
          trend={{ value: 8, isPositive: true }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            {/* Monthly Revenue Chart */}
            <ProfessionalCard 
              title="Revenue Overview" 
              description="Platform revenue and commissions by month"
              className="lg:col-span-2"
            >
              <div className="space-y-8">
                {revenueByMonth.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.month}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold">
                          ${item.revenue.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          (${item.commissions.toFixed(2)} commission)
                        </span>
                      </div>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-100 text-green-800">
                            Revenue
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-100 text-blue-800">
                            Commission
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
                        <div style={{ width: "80%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                        <div style={{ width: "20%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${revenueByMonth.reduce((acc, item) => acc + item.revenue, 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-right">Total Commissions</p>
                  <p className="text-2xl font-bold text-right text-primary">
                    ${revenueByMonth.reduce((acc, item) => acc + item.commissions, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </ProfessionalCard>
            
            {/* Platform Distribution */}
            <ProfessionalCard 
              title="Commission by Platform" 
              description="Distribution of platform commissions"
            >
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {commissionByPlatform.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.platform}</span>
                      <span className="text-sm font-semibold">${item.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={item.percentage} className="h-2" />
                      <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Commissions</span>
                  <span className="font-semibold">
                    ${commissionByPlatform.reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </ProfessionalCard>
          </div>
          
          {/* Latest Activity */}
          <ProfessionalCard 
            title="Latest Activity" 
            description="Recent users and payments"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium mb-2">Recent Users</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUsers.slice(0, 4).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                user.status === "Active" ? "outline" :
                                user.status === "Pending" ? "secondary" : "destructive"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.earnings}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => setActiveTab("users")}
                >
                  View All Users
                </Button>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Recent Payments</h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPayments.slice(0, 4).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.user}</p>
                              <p className="text-xs text-muted-foreground">{payment.date}</p>
                            </div>
                          </TableCell>
                          <TableCell>{payment.amount}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                payment.status === "Completed" ? "outline" :
                                payment.status === "Processing" ? "secondary" : "destructive"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => setActiveTab("payments")}
                >
                  View All Payments
                </Button>
              </div>
            </div>
          </ProfessionalCard>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Export Reports</CardTitle>
                <CardDescription>Download platform data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => exportData("User")}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    Export User Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => exportData("Revenue")}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    Export Revenue Data
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => exportData("Platform")}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    Export Platform Data
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">User Management</CardTitle>
                <CardDescription>Manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("users")}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    View All Users
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New User
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Manage Suspensions
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Payment Management</CardTitle>
                <CardDescription>Manage platform payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("payments")}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    View All Payments
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Review Pending Payments
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Process Manual Payments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-full sm:w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportData("Users")}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedUsers.length === recentUsers.length} 
                        onCheckedChange={toggleSelectAllUsers}
                        aria-label="Select all users"
                      />
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      <Button variant="ghost" className="gap-1 p-0">
                        User 
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                    <TableHead className="text-right">Commissions (20%)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedUsers.includes(user.id)} 
                            onCheckedChange={() => toggleSelectUser(user.id)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.id}</div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.joined}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === "Active" ? "outline" :
                              user.status === "Pending" ? "secondary" : "destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{user.earnings}</TableCell>
                        <TableCell className="text-right">{user.commissions}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {user.status === "Active" ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Suspend User
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate User
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-10 w-10 mb-2 opacity-20" />
                          <p>No users found matching your search.</p>
                          {searchQuery && (
                            <Button 
                              variant="link" 
                              onClick={() => setSearchQuery("")}
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {recentUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search payments..."
                  className="pl-8 w-full sm:w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportData("Payments")}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Payment
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">
                      <Button variant="ghost" className="gap-1 p-0">
                        Payment ID 
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Platform Fee (20%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>
                          <div>{payment.user}</div>
                          <div className="text-xs text-muted-foreground">{payment.email}</div>
                        </TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell className="text-right">{payment.amount}</TableCell>
                        <TableCell className="text-right">{payment.platformFee}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              payment.status === "Completed" ? "outline" :
                              payment.status === "Processing" ? "secondary" : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {payment.status === "Processing" && (
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve Payment
                                </DropdownMenuItem>
                              )}
                              {payment.status === "Failed" && (
                                <DropdownMenuItem>
                                  <ArrowUpDown className="mr-2 h-4 w-4" />
                                  Retry Payment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download Receipt
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-10 w-10 mb-2 opacity-20" />
                          <p>No payments found matching your search.</p>
                          {searchQuery && (
                            <Button 
                              variant="link" 
                              onClick={() => setSearchQuery("")}
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {filteredPayments.length} of {recentPayments.length} payments
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Reports</CardTitle>
                <CardDescription>Platform revenue and earnings analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Report</SelectItem>
                      <SelectItem value="weekly">Weekly Report</SelectItem>
                      <SelectItem value="monthly">Monthly Report</SelectItem>
                      <SelectItem value="quarterly">Quarterly Report</SelectItem>
                      <SelectItem value="annual">Annual Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" placeholder="Start date" />
                    <Input type="date" placeholder="End date" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="amazon">Amazon Associates</SelectItem>
                      <SelectItem value="clickbank">ClickBank</SelectItem>
                      <SelectItem value="etsy">Etsy</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Reports</CardTitle>
                <CardDescription>User activity and earnings reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select defaultValue="activity">
                    <SelectTrigger id="user-report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activity">User Activity</SelectItem>
                      <SelectItem value="earnings">User Earnings</SelectItem>
                      <SelectItem value="commissions">Platform Commissions</SelectItem>
                      <SelectItem value="onboarding">User Onboarding</SelectItem>
                      <SelectItem value="retention">User Retention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" placeholder="Start date" />
                    <Input type="date" placeholder="End date" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>User Status</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="user-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active Users</SelectItem>
                      <SelectItem value="pending">Pending Users</SelectItem>
                      <SelectItem value="suspended">Suspended Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Configure automated report generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weekly Revenue Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Sent every Monday at 8:00 AM
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Monthly User Activity Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Sent on the 1st of each month
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Quarterly Financial Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Sent at the end of each quarter
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Scheduled Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform settings and behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="commission-rate">Platform Commission Rate</Label>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <Slider id="commission-rate" defaultValue={[20]} max={50} step={1} />
                  <p className="text-xs text-muted-foreground">
                    Platform retains 20% of all user earnings as commission
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>User Registration</Label>
                      <p className="text-xs text-muted-foreground">Allow new user registrations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Verification</Label>
                      <p className="text-xs text-muted-foreground">Require email verification for new accounts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automated Payouts</Label>
                      <p className="text-xs text-muted-foreground">Process payouts automatically</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure payment options and processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Minimum Withdrawal Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input defaultValue="50.00" className="pl-8" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum amount users can withdraw from their earnings
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Processing Time</Label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue placeholder="Select processing time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 business day</SelectItem>
                      <SelectItem value="2">2 business days</SelectItem>
                      <SelectItem value="3">3 business days</SelectItem>
                      <SelectItem value="5">5 business days</SelectItem>
                      <SelectItem value="7">7 business days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Time to process withdrawal requests
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Available Payment Methods</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="paypal" defaultChecked />
                      <label
                        htmlFor="paypal"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        PayPal
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bank" defaultChecked />
                      <label
                        htmlFor="bank"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Bank Transfer
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="stripe" defaultChecked />
                      <label
                        htmlFor="stripe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Stripe
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="crypto" />
                      <label
                        htmlFor="crypto"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Cryptocurrency
                      </label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Payment Notifications</Label>
                      <p className="text-xs text-muted-foreground">Send emails for payment events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button>Save Payment Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Admin Accounts</CardTitle>
              <CardDescription>Manage administrator access to platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Mousa AL Qawasmeh</TableCell>
                    <TableCell>mousa.baek90@gmail.com</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>Just now</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <div className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Admin User
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Slider component for admin settings
function Slider({ 
  className, 
  defaultValue = [0], 
  max = 100, 
  step = 1, 
  id 
}: { 
  className?: string; 
  defaultValue?: number[]; 
  max?: number; 
  step?: number; 
  id?: string 
}) {
  return (
    <div className={className}>
      <div className="relative flex items-center select-none touch-none w-full">
        <div className="relative w-full h-2 bg-muted overflow-hidden rounded-full">
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${defaultValue[0] || 0}%` }}
          />
        </div>
        <div
          className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background cursor-pointer"
          style={{ left: `calc(${defaultValue[0] || 0}% - 10px)` }}
        />
      </div>
    </div>
  );
}