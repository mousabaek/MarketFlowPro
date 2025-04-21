import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, BarChart2, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectAnalyzerProps {
  projectTitle: string;
  projectDescription: string;
  requiredSkills: string[];
  userSkills: string[];
  budget?: string;
  onAnalysisComplete?: (score: number, reasoning: string, suggestedBid?: string) => void;
}

export function ProjectAnalyzer({
  projectTitle,
  projectDescription,
  requiredSkills,
  userSkills,
  budget,
  onAnalysisComplete
}: ProjectAnalyzerProps) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<{
    suitabilityScore: number;
    reasoning: string;
    suggestedBid?: string;
  } | null>(null);
  
  // Analysis mutation
  const analyzeProject = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/ai/analyze-project", {
        method: "POST",
        body: JSON.stringify({
          projectTitle,
          projectDescription,
          requiredSkills,
          userSkills,
          budget
        }),
      });
    },
    onSuccess: (data) => {
      setAnalysis(data);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(
          data.suitabilityScore,
          data.reasoning,
          data.suggestedBid
        );
      }
      
      toast({
        title: "Analysis complete",
        description: "Project suitability analysis has been completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing this project. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-amber-600";
    return "text-red-600";
  };
  
  // Get progress color based on score
  const getProgressColor = (score: number) => {
    if (score >= 8) return "bg-green-600";
    if (score >= 5) return "bg-amber-600";
    return "bg-red-600";
  };
  
  // Get recommendation badge
  const getRecommendation = (score: number) => {
    if (score >= 8) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <ThumbsUp className="h-3 w-3 mr-1" /> 
          Excellent Match
        </Badge>
      );
    }
    if (score >= 5) {
      return (
        <Badge variant="outline" className="border-amber-600 text-amber-700">
          <BarChart2 className="h-3 w-3 mr-1" /> 
          Consider Bidding
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <ThumbsDown className="h-3 w-3 mr-1" /> 
        Not Recommended
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          AI Project Analysis
        </CardTitle>
        <CardDescription>
          Evaluate if this project is a good match for your skills
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {analysis ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">Match Score</div>
                <div className={`text-xl font-bold ${getScoreColor(analysis.suitabilityScore)}`}>
                  {analysis.suitabilityScore}/10
                </div>
              </div>
              <Progress 
                value={analysis.suitabilityScore * 10} 
                className="h-2"
                indicatorClassName={getProgressColor(analysis.suitabilityScore)}
              />
              <div className="flex justify-end mt-1">
                {getRecommendation(analysis.suitabilityScore)}
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="font-medium">Analysis</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {analysis.reasoning}
              </p>
            </div>
            
            {analysis.suggestedBid && (
              <div className="bg-muted/50 p-3 rounded-md border">
                <div className="font-medium mb-1">Bid Suggestion</div>
                <p className="text-sm">{analysis.suggestedBid}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
            <div>
              <h3 className="font-medium text-lg">Analyze Project Match</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use AI to evaluate if this project is a good match for your skills and experience.
              </p>
            </div>
            <Button
              onClick={() => analyzeProject.mutate()}
              disabled={analyzeProject.isPending}
              className="mt-2"
            >
              {analyzeProject.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Project
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/20 border-t px-6 py-3">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Powered by OpenAI GPT-4o</span>
        </div>
      </CardFooter>
    </Card>
  );
}