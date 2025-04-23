import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Loader2, 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  Wallet, 
  Download, 
  ArrowDownCircle, 
  ArrowRightCircle, 
  CheckCircle2, 
  PiggyBank, 
  AlertCircle, 
  AlertTriangle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ProfessionalCard, 
  ProfessionalMetricCard 
} from "@/components/ui/professional-card";
import { FaPaypal, FaCcVisa, FaCcMastercard, FaCcStripe } from "react-icons/fa";

// Form validation schemas
const withdrawalSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((value) => !isNaN(Number(value)), "Amount must be a number")
    .refine((value) => Number(value) >= 50, "Minimum withdrawal amount is $50"),
  paymentMethod: z.enum(["paypal", "bank", "stripe"], {
    required_error: "Please select a payment method",
  }),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;

export default function PaymentsPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [paymentLinkCopied, setPaymentLinkCopied] = useState(false);
  const { toast } = useToast();
  
  // Define types for our API responses
  type FinancialData = {
    balance: number;
    pendingEarnings: number;
    totalEarnings: number;
    platformFees: number;
    earningsBreakdown: Array<{
      platform: string;
      amount: number;
      percentage: number;
    }>;
  };

  type PaymentMethod = {
    id: number;
    type: string;
    details: string;
    isDefault: boolean;
    lastUsed: string | null;
  };

  type Withdrawal = {
    id: string;
    date: string;
    type: string;
    amount: string;
    status: string;
    method: string;
  };

  // Fetch user financial data
  const { 
    data: financials, 
    isLoading: isLoadingFinancials 
  } = useQuery<FinancialData>({
    queryKey: ['/api/payments/financials'],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Fetch payment methods
  const { 
    data: paymentMethods, 
    isLoading: isLoadingPaymentMethods 
  } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payments/methods'],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Fetch withdrawal history
  const { 
    data: withdrawals, 
    isLoading: isLoadingWithdrawals 
  } = useQuery<Withdrawal[]>({
    queryKey: ['/api/payments/withdrawal-history'],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Set up withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalFormValues) => {
      const withdrawalData = {
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod,
        accountDetails: data.paymentMethod === 'paypal' ? 'PayPal Email' : 
                       data.paymentMethod === 'bank' ? 'Bank Account Details' : 'Stripe Account'
      };
      
      const response = await fetch('/api/payments/withdrawal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(withdrawalData)
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to process withdrawal');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal request submitted",
        description: `Your withdrawal will be processed in 1-3 business days.`,
      });
      
      withdrawalForm.reset();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/payments/financials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/withdrawal-history'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message || "There was an error processing your withdrawal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const withdrawalForm = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "paypal",
    },
  });

  async function onWithdrawalSubmit(values: WithdrawalFormValues) {
    withdrawalMutation.mutate(values);
  }

  const copyPaymentLink = () => {
    navigator.clipboard.writeText("https://wolf-auto-marketer.com/payment/user123");
    setPaymentLinkCopied(true);
    toast({
      title: "Payment link copied",
      description: "The payment link has been copied to your clipboard.",
    });
    
    setTimeout(() => setPaymentLinkCopied(false), 3000);
  };

  // Format transactions from withdrawal history
  const recentTransactions = withdrawals || [];
  
  // Format earnings breakdown from financial data
  const earningsBreakdown = financials?.earningsBreakdown || [];
  
  // Loading states
  const isLoading = isLoadingFinancials || isLoadingPaymentMethods || isLoadingWithdrawals;
  

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Earnings</h1>
          <p className="text-muted-foreground">
            Manage your earnings and payments from all connected platforms
          </p>
        </div>
      </div>
      
      {/* Payment Overview */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border p-6 bg-card">
                <div className="h-12 animate-pulse w-1/2 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="h-6 animate-pulse w-full bg-muted-foreground/10 rounded"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <ProfessionalMetricCard
              title="Available Balance"
              value={`$${(financials?.balance || 0).toFixed(2)}`}
              description="Ready to withdraw"
              icon={<Wallet className="h-5 w-5" />}
            />
            <ProfessionalMetricCard
              title="Pending Earnings"
              value={`$${(financials?.pendingEarnings || 0).toFixed(2)}`}
              description="Processing (3-5 days)"
              icon={<DollarSign className="h-5 w-5" />}
            />
            <ProfessionalMetricCard
              title="Total Earnings"
              value={`$${(financials?.totalEarnings || 0).toFixed(2)}`}
              description="Lifetime earnings"
              icon={<CreditCard className="h-5 w-5" />}
            />
            <ProfessionalMetricCard
              title="Admin Fee"
              value="20%"
              description={`$${(financials?.platformFees || 0).toFixed(2)} total fees`}
              icon={<PiggyBank className="h-5 w-5" />}
            />
          </>
        )}
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
          <TabsTrigger value="payment-links">Payment Links</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            {/* Earnings Breakdown */}
            <ProfessionalCard 
              title="Earnings Breakdown" 
              description="Last 30 days by platform"
              className="lg:col-span-2"
            >
              <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                {earningsBreakdown.map((item: { platform: string; amount: number; percentage: number }, idx: number) => (
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
              
              <div className="mt-6 flex justify-between items-center pt-4 border-t">
                <span className="font-medium">Total Earnings</span>
                <span className="font-semibold">${earningsBreakdown.reduce((acc: number, item: { amount: number }) => acc + item.amount, 0).toFixed(2)}</span>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span>Platform fee (20%) is automatically deducted from earnings</span>
                </div>
              </div>
            </ProfessionalCard>
            
            {/* Withdrawal Rules */}
            <ProfessionalCard 
              title="Withdrawal Rules" 
              description="Important payment information"
            >
              <div className="space-y-4">
                <div className="rounded-lg border p-3 bg-muted/40">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Minimum Withdrawal</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        The minimum amount you can withdraw is $50.00
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-3 bg-muted/40">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Processing Time</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Withdrawals are processed within 1-3 business days
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-3 bg-muted/40">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Platform Fee</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Wolf Auto Marketer retains 20% of all earnings as a platform fee
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-3 bg-muted/40">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium">Payment Methods</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Available withdrawal methods: PayPal, Bank Transfer, Stripe
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  onClick={() => setActiveTab("withdraw")} 
                  className="w-full"
                >
                  Withdraw Funds
                </Button>
              </div>
            </ProfessionalCard>
          </div>
          
          {/* Recent Transactions */}
          <ProfessionalCard 
            title="Recent Transactions" 
            description="Your latest payment activity"
            footer={
              <Button variant="outline" size="sm" className="ml-auto gap-1">
                View All Transactions
                <ArrowRightCircle className="ml-1 h-3.5 w-3.5" />
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction: Withdrawal) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      {transaction.type === "Withdrawal" ? (
                        <Badge variant="outline" className="gap-1">
                          <ArrowUpRight className="h-3 w-3" />
                          Withdrawal
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                          <ArrowDownCircle className="h-3 w-3" />
                          Commission
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ProfessionalCard>
        </TabsContent>
        
        <TabsContent value="withdraw" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>
                  Transfer your earnings to your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...withdrawalForm}>
                  <form onSubmit={withdrawalForm.handleSubmit(onWithdrawalSubmit)} className="space-y-4">
                    <FormField
                      control={withdrawalForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount to Withdraw</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="50.00" 
                                className="pl-8" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={withdrawalForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="paypal" className="flex items-center">
                                <div className="flex items-center">
                                  <FaPaypal className="mr-2 h-4 w-4 text-[#0070ba]" />
                                  PayPal
                                </div>
                              </SelectItem>
                              <SelectItem value="bank">
                                <div className="flex items-center">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Bank Transfer
                                </div>
                              </SelectItem>
                              <SelectItem value="stripe">
                                <div className="flex items-center">
                                  <FaCcStripe className="mr-2 h-4 w-4 text-[#6772e5]" />
                                  Stripe
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Available Balance:</span>
                        <span className="font-medium">${(financials?.balance || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum Withdrawal:</span>
                        <span className="font-medium">$50.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Time:</span>
                        <span className="font-medium">1-3 business days</span>
                      </div>
                    </div>
                    
                    <Alert variant="destructive">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <AlertTitle>Important Notice</AlertTitle>
                      </div>
                      <AlertDescription className="mt-1 text-xs">
                        Make sure your payment information is correct. Incorrect details may result in delayed or failed withdrawals.
                      </AlertDescription>
                    </Alert>
                    
                    <Button type="submit" className="w-full" disabled={withdrawalMutation.isPending}>
                      {withdrawalMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Withdraw Funds"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Your connected payment accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FaPaypal className="h-6 w-6 text-[#0070ba] mr-3" />
                    <div>
                      <h4 className="font-medium">PayPal</h4>
                      <p className="text-xs text-muted-foreground">mousa.baek90@gmail.com</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Connected</Badge>
                </div>
                
                <div className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-6 w-6 mr-3" />
                    <div>
                      <h4 className="font-medium">Bank Account</h4>
                      <p className="text-xs text-muted-foreground">IBAN ending in •••• 4832</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Connected</Badge>
                </div>
                
                <div className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <FaCcStripe className="h-6 w-6 text-[#6772e5] mr-3" />
                    <div>
                      <h4 className="font-medium">Stripe</h4>
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="payment-links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Payment Links</CardTitle>
              <CardDescription>
                Share these links to receive payments directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex flex-col space-y-3">
                  <h3 className="font-medium">Personal Payment Link</h3>
                  <div className="flex">
                    <Input 
                      value="https://wolf-auto-marketer.com/payment/user123" 
                      readOnly 
                      className="rounded-r-none"
                    />
                    <Button 
                      onClick={copyPaymentLink} 
                      variant="secondary" 
                      className="rounded-l-none"
                    >
                      {paymentLinkCopied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Platform Fee:</span>
                      <span className="font-medium">5% per transaction</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available Payment Methods:</span>
                      <span className="font-medium">Credit Card, PayPal</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 py-2">
                <FaCcVisa className="h-8 w-8 text-[#1434CB]" />
                <FaCcMastercard className="h-8 w-8 text-[#EB001B]" />
                <FaPaypal className="h-8 w-8 text-[#0070ba]" />
                <FaCcStripe className="h-8 w-8 text-[#6772e5]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Configure your payment preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-payment">Default Payment Method</Label>
                <Select defaultValue="paypal">
                  <SelectTrigger id="default-payment">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">
                      <div className="flex items-center">
                        <FaPaypal className="mr-2 h-4 w-4 text-[#0070ba]" />
                        PayPal
                      </div>
                    </SelectItem>
                    <SelectItem value="bank">
                      <div className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="stripe">
                      <div className="flex items-center">
                        <FaCcStripe className="mr-2 h-4 w-4 text-[#6772e5]" />
                        Stripe
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auto-withdraw">Automatic Withdrawals</Label>
                <Select defaultValue="manual">
                  <SelectTrigger id="auto-withdraw">
                    <SelectValue placeholder="Select withdrawal method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Withdrawals Only</SelectItem>
                    <SelectItem value="weekly">Auto-withdraw Weekly (min $100)</SelectItem>
                    <SelectItem value="biweekly">Auto-withdraw Bi-weekly (min $100)</SelectItem>
                    <SelectItem value="monthly">Auto-withdraw Monthly (min $50)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="eur">EUR - Euro</SelectItem>
                    <SelectItem value="gbp">GBP - British Pound</SelectItem>
                    <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="aud">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
              <CardDescription>
                Manage your tax documentation and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800">Tax Documents Required</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Please provide your tax information to ensure compliance with local tax regulations.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Tax Information
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Tax Documents</h3>
                <p className="text-sm text-muted-foreground">
                  No tax documents have been submitted yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Alert({
  variant = "default",
  children,
  className,
  ...props
}: {
  variant?: "default" | "destructive";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border rounded-lg p-3 ${
        variant === "destructive"
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-muted/50 border-border"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }: { className?: string; children: React.ReactNode }) {
  return <h5 className={`font-medium text-sm ${className}`} {...props} />;
}

function AlertDescription({ className, ...props }: { className?: string; children: React.ReactNode }) {
  return <div className={`text-sm ${className}`} {...props} />;
}