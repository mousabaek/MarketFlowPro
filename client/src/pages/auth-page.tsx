import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundPattern } from "@/components/ui/background-pattern";
import { Loader2, Eye, EyeOff, Mail, Key, UserCheck, Lock, Facebook, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { FaGoogle, FaTwitter } from "react-icons/fa";

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  fullName: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }),
  confirmPassword: z.string(),
  agreeTerms: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.agreeTerms === true, {
  message: "You must accept the terms and conditions",
  path: ["agreeTerms"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  async function onLoginSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(values);
      toast({
        title: "Login successful",
        description: "Welcome back to Wolf Auto Marketer",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onRegisterSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(values);
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Background pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full">
        <BackgroundPattern variant="dots" />
      </div>
      
      <div className="container relative flex flex-col items-center justify-center h-screen md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Button 
          variant="ghost" 
          className="absolute right-4 top-4 md:right-8 md:top-8" 
          onClick={() => setLocation("/")}
        >
          Back to Home
        </Button>
        
        {/* Left side - Auth forms */}
        <div className="relative flex flex-col items-center justify-center px-5 md:px-10 lg:px-16 py-12 md:py-24">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Wolf Auto Marketer</h1>
              <p className="text-sm text-muted-foreground">
                {activeTab === "login" 
                  ? "Sign in to access your account" 
                  : "Create an account to get started"}
              </p>
            </div>
            
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="email@example.com" 
                                    className="pl-9" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="********" 
                                    className="pl-9 pr-9" 
                                    {...field} 
                                  />
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-1 top-1 h-7 w-7" 
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex items-center justify-between">
                          <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  Remember me
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          <Button variant="link" className="px-0 text-sm" type="button">
                            Forgot password?
                          </Button>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <Button variant="outline" type="button" className="w-full">
                          <FaGoogle className="mr-2 h-4 w-4" />
                          Google
                        </Button>
                        <Button variant="outline" type="button" className="w-full">
                          <Facebook className="mr-2 h-4 w-4" />
                          Facebook
                        </Button>
                        <Button variant="outline" type="button" className="w-full">
                          <Github className="mr-2 h-4 w-4" />
                          Github
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register" className="mt-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Enter your details to create a new account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="John Doe" 
                                    className="pl-9" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    placeholder="email@example.com" 
                                    className="pl-9" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="********" 
                                    className="pl-9 pr-9" 
                                    {...field} 
                                  />
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-1 top-1 h-7 w-7" 
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="********" 
                                    className="pl-9 pr-9" 
                                    {...field} 
                                  />
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-1 top-1 h-7 w-7" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="agreeTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  I agree to the{" "}
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-sm h-auto leading-none" 
                                    type="button"
                                    onClick={() => window.open("/terms", "_blank")}
                                  >
                                    terms of service
                                  </Button>{" "}
                                  and{" "}
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-sm h-auto leading-none" 
                                    type="button"
                                    onClick={() => window.open("/privacy", "_blank")}
                                  >
                                    privacy policy
                                  </Button>
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <Button variant="outline" type="button" className="w-full">
                          <FaGoogle className="mr-2 h-4 w-4" />
                          Google
                        </Button>
                        <Button variant="outline" type="button" className="w-full">
                          <Facebook className="mr-2 h-4 w-4" />
                          Facebook
                        </Button>
                        <Button variant="outline" type="button" className="w-full">
                          <Github className="mr-2 h-4 w-4" />
                          Github
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                By continuing, you acknowledge that Wolf Auto Marketer may use cookies as outlined in our{" "}
                <Button 
                  variant="link" 
                  className="p-0 text-sm h-auto" 
                  type="button"
                  onClick={() => window.open("/privacy", "_blank")}
                >
                  Privacy Policy
                </Button>
              </span>
            </div>
          </div>
        </div>
        
        {/* Right side - Hero Section */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{ 
              backgroundImage: "linear-gradient(to bottom, rgba(2, 8, 23, 0.75), rgba(2, 8, 23, 0.95))"
            }}
          />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Wolf Auto Marketer
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "Wolf Auto Marketer has revolutionized how I manage my freelance and affiliate marketing opportunities. 
                The automated workflows and AI-powered recommendations have increased my revenue by 45%."
              </p>
              <footer className="text-sm">Sarah Johnson, Professional Marketer</footer>
            </blockquote>
          </div>
          
          <div className="relative z-20 mt-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="font-bold text-xl mb-1">45%</div>
                <div className="text-xs">Increased Revenue</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="font-bold text-xl mb-1">92%</div>
                <div className="text-xs">Time Saved</div>
              </div>
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="font-bold text-xl mb-1">5k+</div>
                <div className="text-xs">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}