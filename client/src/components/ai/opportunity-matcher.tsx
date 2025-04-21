import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Icons
import { Loader2, Zap, Brain, Target, Clock, DollarSign, Award, CheckCircle, Briefcase, ChevronRight, 
         ShoppingCart, AlertCircle, Info, Lightbulb, TrendingUp, ArrowRight, 
         BarChart3, FileText, BookOpen, BarChart, ListChecks, ClipboardList } from "lucide-react";

// Form schema
const formSchema = z.object({
  skills: z.array(z.string()).min(1, { message: "Add at least one skill" }),
  interests: z.array(z.string()).min(1, { message: "Add at least one interest" }),
  experience: z.string().optional(),
  preferredPlatforms: z.array(z.string()).optional(),
  preferredCategories: z.array(z.string()).optional(),
  preferredEarningModel: z.string().optional(),
  timeAvailability: z.string().optional(),
  matchCount: z.number().int().min(1).max(10).default(5),
});

type FormValues = z.infer<typeof formSchema>;

type Recommendation = {
  id: string;
  platform: string;
  title: string;
  description: string;
  category: string;
  matchScore: number;
  estimatedEarnings: string;
  timeCommitment: string;
  difficulty: string;
  reasonForRecommendation: string;
  nextSteps?: string[];
  requiresApplication: boolean;
  opportunityType: 'freelance' | 'affiliate' | 'both';
  keywords?: string[];
  expiresAt?: string;
  directLink?: string;
};

// Platform options
const platformOptions = [
  { value: "Freelancer", label: "Freelancer.com" },
  { value: "ClickBank", label: "ClickBank" },
  { value: "Amazon Associates", label: "Amazon Associates" },
  { value: "Etsy", label: "Etsy" },
];

// Category options
const categoryOptions = [
  { value: "Web Development", label: "Web Development" },
  { value: "Mobile Development", label: "Mobile Development" },
  { value: "Design", label: "Design" },
  { value: "Writing", label: "Writing" },
  { value: "Health & Fitness", label: "Health & Fitness" },
  { value: "Business/Investing", label: "Business/Investing" },
  { value: "Education", label: "Education" },
  { value: "Arts & Entertainment", label: "Arts & Entertainment" },
  { value: "Home & Garden", label: "Home & Garden" },
  { value: "Technology", label: "Technology" },
];

// Earning model options
const earningModelOptions = [
  { value: "hourly", label: "Hourly Rate" },
  { value: "fixed", label: "Fixed Price" },
  { value: "commission", label: "Commission" },
  { value: "recurring", label: "Recurring Income" },
];

// Time availability options
const timeAvailabilityOptions = [
  { value: "full-time", label: "Full-time (40+ hours/week)" },
  { value: "part-time", label: "Part-time (20-40 hours/week)" },
  { value: "side-hustle", label: "Side Hustle (5-20 hours/week)" },
  { value: "occasional", label: "Occasional (< 5 hours/week)" },
];

// Get difficulty badge color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "intermediate":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "advanced":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

// Get platform icon
const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "freelancer":
      return <Briefcase className="h-4 w-4" />;
    case "clickbank":
      return <ShoppingCart className="h-4 w-4" />;
    case "amazon associates":
      return <ShoppingCart className="h-4 w-4" />;
    case "etsy":
      return <ShoppingCart className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

// Get opportunity type icon
const getOpportunityTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "freelance":
      return <Briefcase className="h-4 w-4" />;
    case "affiliate":
      return <ShoppingCart className="h-4 w-4" />;
    case "both":
      return <Zap className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

export function OpportunityMatcher() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [currentSkill, setCurrentSkill] = useState("");
  const [currentInterest, setCurrentInterest] = useState("");
  const [activeTab, setActiveTab] = useState("form");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: [],
      interests: [],
      preferredPlatforms: [],
      preferredCategories: [],
      matchCount: 5,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Create request payload
      const payload = {
        userProfile: {
          skills: data.skills,
          interests: data.interests,
          experience: data.experience,
          preferredPlatforms: data.preferredPlatforms,
          preferredCategories: data.preferredCategories,
          preferredEarningModel: data.preferredEarningModel,
          timeAvailability: data.timeAvailability,
        },
        matchCount: data.matchCount,
      };

      // Call API
      const response = await apiRequest("/api/opportunities/match", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Handle response
      setRecommendations(response.matches);
      setSelectedRecommendation(response.matches[0] || null);
      setActiveTab("results");
      
      toast({
        title: "Opportunities Found!",
        description: `Found ${response.matches.length} matching opportunities.`,
      });
    } catch (error) {
      console.error("Failed to find opportunities:", error);
      toast({
        variant: "destructive",
        title: "Error finding opportunities",
        description: "There was a problem matching you with opportunities. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a skill to the form
  const addSkill = () => {
    if (!currentSkill.trim()) return;
    const updatedSkills = [...form.getValues().skills, currentSkill.trim()];
    form.setValue("skills", updatedSkills, { shouldValidate: true });
    setCurrentSkill("");
  };

  // Remove a skill from the form
  const removeSkill = (index: number) => {
    const updatedSkills = form.getValues().skills.filter((_, i) => i !== index);
    form.setValue("skills", updatedSkills, { shouldValidate: true });
  };

  // Add an interest to the form
  const addInterest = () => {
    if (!currentInterest.trim()) return;
    const updatedInterests = [...form.getValues().interests, currentInterest.trim()];
    form.setValue("interests", updatedInterests, { shouldValidate: true });
    setCurrentInterest("");
  };

  // Remove an interest from the form
  const removeInterest = (index: number) => {
    const updatedInterests = form.getValues().interests.filter((_, i) => i !== index);
    form.setValue("interests", updatedInterests, { shouldValidate: true });
  };

  // Get optimization suggestions for a specific opportunity
  const getOptimizationSuggestions = async (opportunityId: string, platformName: string) => {
    try {
      const response = await apiRequest(
        `/api/opportunities/${opportunityId}/${platformName}/optimize`,
        { method: "GET" }
      );
      return response.suggestions;
    } catch (error) {
      console.error("Failed to get optimization suggestions:", error);
      return [];
    }
  };

  // Generate a strategy for a specific opportunity
  const generateStrategy = async (opportunityId: string, platformName: string) => {
    try {
      const payload = {
        platformName,
        userProfile: form.getValues(),
      };

      const response = await apiRequest(`/api/opportunities/${opportunityId}/strategy`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return response.strategy;
    } catch (error) {
      console.error("Failed to generate strategy:", error);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                AI Opportunity Matcher
              </CardTitle>
              <CardDescription>
                Find the best freelance and affiliate marketing opportunities matched to your skills and interests
              </CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="form">Profile</TabsTrigger>
                <TabsTrigger value="results" disabled={recommendations.length === 0}>
                  Results {recommendations.length > 0 && `(${recommendations.length})`}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          <TabsContent value="form" className="mt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Skills Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Skills & Expertise</h3>
                    <p className="text-sm text-muted-foreground">
                      Tell us about your skills and interests so we can find the best opportunities for you
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Skills</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              placeholder="Enter a skill (e.g., Web Development)"
                              value={currentSkill}
                              onChange={(e) => setCurrentSkill(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            />
                          </FormControl>
                          <Button type="button" onClick={addSkill}>
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="p-1.5">
                              {skill}
                              <button
                                type="button"
                                className="ml-2 text-muted-foreground hover:text-foreground"
                                onClick={() => removeSkill(index)}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Interests</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input
                              placeholder="Enter an interest (e.g., Digital Marketing)"
                              value={currentInterest}
                              onChange={(e) => setCurrentInterest(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                            />
                          </FormControl>
                          <Button type="button" onClick={addInterest}>
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((interest, index) => (
                            <Badge key={index} variant="secondary" className="p-1.5">
                              {interest}
                              <button
                                type="button"
                                className="ml-2 text-muted-foreground hover:text-foreground"
                                onClick={() => removeInterest(index)}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner (&lt; 1 year)</SelectItem>
                            <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                            <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                            <SelectItem value="expert">Expert (5+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Preferences Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize your opportunity search with these optional preferences
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="preferredPlatforms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Platforms (Optional)</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {platformOptions.map((platform) => (
                            <div key={platform.value} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(platform.value)}
                                onCheckedChange={(checked) => {
                                  let updatedPlatforms = [...(field.value || [])];
                                  if (checked) {
                                    updatedPlatforms.push(platform.value);
                                  } else {
                                    updatedPlatforms = updatedPlatforms.filter(
                                      (value) => value !== platform.value
                                    );
                                  }
                                  field.onChange(updatedPlatforms);
                                }}
                              />
                              <label className="text-sm">{platform.label}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredCategories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Categories (Optional)</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryOptions.map((category) => (
                            <div key={category.value} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(category.value)}
                                onCheckedChange={(checked) => {
                                  let updatedCategories = [...(field.value || [])];
                                  if (checked) {
                                    updatedCategories.push(category.value);
                                  } else {
                                    updatedCategories = updatedCategories.filter(
                                      (value) => value !== category.value
                                    );
                                  }
                                  field.onChange(updatedCategories);
                                }}
                              />
                              <label className="text-sm">{category.label}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preferredEarningModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Earning Model (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preferred earning model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {earningModelOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeAvailability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Availability (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time availability" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeAvailabilityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="matchCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of matches to find: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            className="w-full"
                            min={1}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>How many opportunities would you like us to find?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Find Opportunities
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            {recommendations.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No recommendations yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete your profile to get personalized opportunity recommendations
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("form")}>
                  Go to Profile
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recommendations List */}
                <div className="lg:col-span-1 border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Matched Opportunities</h3>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedRecommendation?.id === rec.id
                              ? "bg-primary/5 border-primary/50"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedRecommendation(rec)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm line-clamp-1">{rec.title}</h4>
                            <Badge variant="outline" className="ml-2 flex-shrink-0">
                              {getPlatformIcon(rec.platform)}
                              <span className="ml-1">{rec.platform}</span>
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {rec.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">Match Score</span>
                              <div className="flex items-center">
                                <Progress value={rec.matchScore} className="h-2 w-16" />
                                <span className="ml-2 text-xs font-medium">{rec.matchScore}%</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {rec.opportunityType}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Selected Recommendation Details */}
                <div className="lg:col-span-2">
                  {selectedRecommendation ? (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="mb-2" variant="outline">
                              {getPlatformIcon(selectedRecommendation.platform)}
                              <span className="ml-1">{selectedRecommendation.platform}</span>
                            </Badge>
                            <CardTitle>{selectedRecommendation.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {selectedRecommendation.description}
                            </CardDescription>
                          </div>
                          <div className="text-center ml-4">
                            <div className="relative inline-flex items-center justify-center">
                              <svg className="w-16 h-16">
                                <circle
                                  className="text-muted-foreground/20"
                                  strokeWidth="4"
                                  stroke="currentColor"
                                  fill="transparent"
                                  r="26"
                                  cx="32"
                                  cy="32"
                                />
                                <circle
                                  className="text-primary"
                                  strokeWidth="4"
                                  strokeDasharray={2 * Math.PI * 26}
                                  strokeDashoffset={
                                    2 * Math.PI * 26 * (1 - selectedRecommendation.matchScore / 100)
                                  }
                                  strokeLinecap="round"
                                  stroke="currentColor"
                                  fill="transparent"
                                  r="26"
                                  cx="32"
                                  cy="32"
                                />
                              </svg>
                              <span className="absolute text-sm font-medium">{selectedRecommendation.matchScore}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Match Score</p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs text-muted-foreground">Earnings Potential</span>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                              <span className="font-medium">{selectedRecommendation.estimatedEarnings}</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs text-muted-foreground">Time Commitment</span>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-blue-600 mr-1" />
                              <span className="font-medium">{selectedRecommendation.timeCommitment}</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="text-xs text-muted-foreground">Difficulty</span>
                            <Badge className={getDifficultyColor(selectedRecommendation.difficulty)}>
                              {selectedRecommendation.difficulty}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Why this is a good match:</h4>
                          <p className="text-sm">{selectedRecommendation.reasonForRecommendation}</p>
                        </div>

                        {selectedRecommendation.keywords && selectedRecommendation.keywords.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Matching Keywords:</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedRecommendation.keywords.map((keyword, index) => (
                                <Badge key={index} variant="outline">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedRecommendation.nextSteps && selectedRecommendation.nextSteps.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Recommended Next Steps:</h4>
                            <ul className="space-y-2">
                              {selectedRecommendation.nextSteps.map((step, index) => (
                                <li key={index} className="flex items-start">
                                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 mr-2 flex-shrink-0" />
                                  <span className="text-sm">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="flex flex-col space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          <Button className="w-full">
                            <Target className="mr-2 h-4 w-4" />
                            View Full Details
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Get Optimization Tips
                          </Button>
                        </div>
                        {selectedRecommendation.expiresAt && (
                          <div className="text-center w-full">
                            <p className="text-xs text-muted-foreground">
                              {new Date(selectedRecommendation.expiresAt) > new Date()
                                ? `Expires: ${new Date(selectedRecommendation.expiresAt).toLocaleDateString()}`
                                : "This opportunity has expired"}
                            </p>
                          </div>
                        )}
                      </CardFooter>
                    </Card>
                  ) : (
                    <div className="border rounded-lg p-8 text-center">
                      <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <h3 className="font-medium">No opportunity selected</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select an opportunity from the list to view details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>

        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center text-sm text-muted-foreground">
              <Brain className="h-4 w-4 mr-1" />
              <span>Powered by AI opportunity matching</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}