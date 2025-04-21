import { OpportunityMatcher } from "../components/ai/opportunity-matcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Zap, Target, TrendingUp } from "lucide-react";

export default function OpportunityMatcherPage() {
  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Opportunity Matcher</h1>
        <p className="text-muted-foreground">
          AI-powered opportunity matching for freelance and affiliate marketing
        </p>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertTitle>Powered by AI</AlertTitle>
        <AlertDescription>
          Our AI analyzes your skills, interests, and preferences to find the best opportunities across all connected platforms.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-1 text-primary" />
              Enhanced Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Higher relevance with AI matching</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="h-4 w-4 mr-1 text-primary" />
              Multi-Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Integrated marketplaces searched</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-primary" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2x</div>
            <p className="text-xs text-muted-foreground">Higher conversion on matched opportunities</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-1 text-primary" />
              Time Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.5 hrs</div>
            <p className="text-xs text-muted-foreground">Average weekly time savings</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="matcher" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matcher">Opportunity Matcher</TabsTrigger>
          <TabsTrigger value="history">Match History</TabsTrigger>
          <TabsTrigger value="insights">Performance Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="matcher" className="mt-4">
          <OpportunityMatcher />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Match History</CardTitle>
              <CardDescription>
                View your past opportunity matches and track their status
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">No match history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start using the Opportunity Matcher to build your history
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="insights" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                AI-generated insights about your opportunity matching performance
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">No insights available yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Insights will be generated as you use the Opportunity Matcher
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}