import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProfessionalCard } from "@/components/ui/professional-card";

// Icons
import {
  ArrowLeft,
  ArrowRight,
  Building as BankIcon,
  CheckCircle2,
  CreditCard,
  DollarSign,
  HelpCircle,
  Loader2,
  Lock as LockIcon,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

// Validation schema for bank transfer
const transferSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((value) => !isNaN(Number(value)), "Amount must be a number")
    .refine((value) => Number(value) >= 50, "Minimum withdrawal amount is $50"),
  accountId: z.string({
    required_error: "Please select a bank account",
  }),
  saveAccount: z.boolean().default(false),
  agreeToTerms: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type TransferFormValues = z.infer<typeof transferSchema>;

// Bank account type
type BankAccount = {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  isDefault: boolean;
};

export default function BankTransferPage() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [transferDetails, setTransferDetails] = useState<TransferFormValues | null>(null);
  const [transferComplete, setTransferComplete] = useState<boolean>(false);
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [transferId, setTransferId] = useState<string>("");
  const { toast } = useToast();

  // Fetch bank accounts from API
  const { 
    data: bankAccountsData, 
    isLoading: isLoadingBankAccounts 
  } = useQuery({
    queryKey: ['/api/payments/bank-accounts'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Format bank accounts data or use defaults if none are available
  const bankAccounts: BankAccount[] = useMemo(() => {
    if (bankAccountsData && Array.isArray(bankAccountsData) && bankAccountsData.length > 0) {
      return bankAccountsData.map(account => ({
        id: account.id.toString(),
        name: account.accountName || "Bank Account",
        accountNumber: account.accountDetails?.includes("Account:") 
          ? account.accountDetails.split("Account:")[1].trim() 
          : account.accountDetails || "",
        bankName: account.accountDetails?.includes("(") && account.accountDetails?.includes(")") 
          ? account.accountDetails.split("(")[1].split(")")[0]
          : "Bank",
        isDefault: account.isDefault,
      }));
    }
    
    // Default accounts if none are available
    return [
      {
        id: "1",
        name: "Primary Checking",
        accountNumber: "****4832",
        bankName: "Chase Bank",
        isDefault: true,
      },
      {
        id: "2",
        name: "Savings Account",
        accountNumber: "****7569",
        bankName: "Bank of America",
        isDefault: false,
      },
    ];
  }, [bankAccountsData]);

  // Define financial data type
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

  // Fetch user financial data
  const { 
    data: financials, 
    isLoading: isLoadingFinancials 
  } = useQuery<FinancialData>({
    queryKey: ['/api/payments/financials'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Set up transfer form
  const transferForm = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: "",
      accountId: bankAccounts.find(account => account.isDefault)?.id || "",
      saveAccount: false,
      agreeToTerms: false,
    },
  });

  // Confirmation code form
  const confirmationCodeForm = useForm({
    defaultValues: {
      code: "",
    },
  });

  // Set up bank transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormValues) => {
      const transferData = {
        amount: parseFloat(data.amount),
        accountId: data.accountId,
        paymentMethod: "bank",
        saveAccount: data.saveAccount,
        // Include bank name and account name from selected account if available
        bankName: bankAccounts.find(acc => acc.id === data.accountId)?.bankName,
        accountName: bankAccounts.find(acc => acc.id === data.accountId)?.name,
      };
      
      const response = await apiRequest("POST", "/api/payments/bank-transfer", transferData);
      return response;
    },
    onSuccess: async (response) => {
      toast({
        title: "Transfer initiated",
        description: "Verification code has been sent to your email",
      });
      
      // Parse the response data
      const data = await response.json();
      
      // Store transferId from response
      if (data && data.transferId) {
        setTransferId(data.transferId);
        // For demo purposes, show the verification code from response
        if (data.verificationCode) {
          toast({
            title: "Demo Verification Code",
            description: `Your verification code is: ${data.verificationCode}`,
          });
        }
      }
      
      setCurrentStep(1);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/payments/financials'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer failed",
        description: error.message || "There was an error processing your transfer. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Set up verification mutation
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const verifyData = {
        code,
        transferId,
        // The server only needs the code and transferId for verification
        // Other fields are only for display purposes on the client
      };
      
      const response = await apiRequest("POST", "/api/payments/verify-transfer", verifyData);
      return response;
    },
    onSuccess: async (response) => {
      // Parse the response data if needed
      try {
        const data = await response.json();
      } catch (e) {
        // If not JSON, that's fine, we don't need the data
      }
      
      toast({
        title: "Transfer verified",
        description: "Your transfer is being processed and will be completed in 1-3 business days",
      });
      
      setCurrentStep(2);
      setTransferComplete(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/payments/financials'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission for bank transfer
  function onTransferSubmit(values: TransferFormValues) {
    setTransferDetails(values);
    transferMutation.mutate(values);
  }

  // Handle verification code submission
  function onVerifySubmit() {
    verifyMutation.mutate(confirmationCode);
  }

  // Get selected bank account
  const selectedAccount = transferDetails?.accountId 
    ? bankAccounts.find(account => account.id === transferDetails.accountId) 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Transfer</h1>
          <p className="text-muted-foreground">
            Transfer your earnings to your bank account
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation("/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
      </div>

      {/* Progress tracker */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm px-2">
          <span className={currentStep >= 0 ? "font-medium" : "text-muted-foreground"}>Amount & Account</span>
          <span className={currentStep >= 1 ? "font-medium" : "text-muted-foreground"}>Verification</span>
          <span className={currentStep >= 2 ? "font-medium" : "text-muted-foreground"}>Confirmation</span>
        </div>
        <Progress value={(currentStep / 2) * 100} className="h-2" />
      </div>

      {/* Step 1: Transfer Details */}
      {currentStep === 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <ProfessionalCard title="Transfer Amount" description="Enter the amount you want to transfer">
            <Form {...transferForm}>
              <form onSubmit={transferForm.handleSubmit(onTransferSubmit)} className="space-y-6">
                <FormField
                  control={transferForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount to Transfer</FormLabel>
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
                  control={transferForm.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Bank Account</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a bank account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex flex-col">
                                <span>{account.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {account.bankName} • {account.accountNumber}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Available Balance:</span>
                    <span className="text-sm font-medium">${(financials?.balance || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Processing Time:</span>
                    <span className="text-sm font-medium">1-3 business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Transfer Fee:</span>
                    <span className="text-sm font-medium">$0.00</span>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Important</AlertTitle>
                  <AlertDescription className="text-amber-700 text-xs mt-1">
                    Bank transfers typically take 1-3 business days to process. Minimum transfer amount is $50.
                  </AlertDescription>
                </Alert>
                
                <FormField
                  control={transferForm.control}
                  name="saveAccount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Save this account for future transfers</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={transferForm.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I agree to the terms and conditions</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={transferMutation.isPending}>
                  {transferMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Verification
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </ProfessionalCard>
          
          <div className="space-y-6">
            <ProfessionalCard title="Transfer Guide" description="How bank transfers work">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                    <BankIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Bank Information</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Make sure your bank information is correct before initiating a transfer.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                    <LockIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Secure Verification</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      For security, you'll need to verify your transfer with a code sent to your email.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-0.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Safe & Secure</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      All transfers are encrypted and processed through secure banking channels.
                    </p>
                  </div>
                </div>
              </div>
            </ProfessionalCard>
            
            <ProfessionalCard title="Need Help?" description="Contact our support team">
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-8 w-8 text-primary/70" />
                  <div>
                    <h4 className="font-medium">Support Team</h4>
                    <p className="text-xs text-muted-foreground">Available 24/7 for assistance</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Contact</Button>
              </div>
            </ProfessionalCard>
          </div>
        </div>
      )}

      {/* Step 2: Verification */}
      {currentStep === 1 && (
        <div className="max-w-md mx-auto">
          <ProfessionalCard title="Verify Your Transfer" description="Enter the verification code sent to your email">
            <div className="space-y-6">
              <div className="bg-muted/40 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Transfer Amount:</span>
                  <span className="text-sm font-medium">${transferDetails?.amount}</span>
                </div>
                {selectedAccount && (
                  <div className="flex justify-between">
                    <span className="text-sm">Bank Account:</span>
                    <span className="text-sm font-medium">
                      {selectedAccount.bankName} ({selectedAccount.accountNumber})
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-medium">
                  Verification Code
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    (Check your email)
                  </span>
                </label>
                <Input
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="text-center text-xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  We've sent a verification code to your email address. The code will expire in 10 minutes.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setCurrentStep(0)}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1"
                  onClick={onVerifySubmit}
                  disabled={confirmationCode.length !== 6 || verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Transfer"
                  )}
                </Button>
              </div>
              
              <div className="flex justify-center">
                <Button variant="link" size="sm" className="text-xs">
                  Didn't receive a code? Resend
                </Button>
              </div>
            </div>
          </ProfessionalCard>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 2 && (
        <div className="max-w-md mx-auto">
          <ProfessionalCard title="Transfer Confirmation" description="Your transfer is being processed">
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold">Transfer Successful!</h2>
              <p className="text-muted-foreground">
                Your transfer of ${transferDetails?.amount} has been initiated and will be processed in 1-3 business days.
              </p>
              
              <div className="bg-muted/40 rounded-lg p-4 w-full space-y-3 mt-4">
                <div className="flex justify-between">
                  <span className="text-sm">Transfer Amount:</span>
                  <span className="text-sm font-medium">${transferDetails?.amount}</span>
                </div>
                {selectedAccount && (
                  <div className="flex justify-between">
                    <span className="text-sm">Bank Account:</span>
                    <span className="text-sm font-medium">
                      {selectedAccount.bankName} ({selectedAccount.accountNumber})
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm">Transaction ID:</span>
                  <span className="text-sm font-medium">TRX-{Math.floor(Math.random() * 10000000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <span className="text-sm font-medium text-amber-600">Processing</span>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setLocation("/payments")}>
                  View Payments
                </Button>
                <Button className="flex-1" onClick={() => setLocation("/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </ProfessionalCard>
        </div>
      )}
    </div>
  );
}