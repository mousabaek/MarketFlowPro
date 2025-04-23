import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Loader2, Wand2, Copy, Download, Share2, FileText, Star, Sparkles, TrendingUp } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

interface StoryGenerationParams {
  industry?: string;
  targetAudience?: string;
  storyType: 'case_study' | 'success_story' | 'personal_narrative' | 'product_story';
  toneOfVoice: 'professional' | 'friendly' | 'authoritative' | 'conversational';
  keywords: string[];
  includeCallToAction: boolean;
  maxLength: number;
  affiliateProduct?: string;
  platformName?: string;
}

interface GeneratedStory {
  title: string;
  content: string;
  summary: string;
  suggestedTags: string[];
  platformRecommendations: {
    platform: string;
    suitabilityScore: number;
    adaptationTips: string;
  }[];
}

export default function StoryGeneratorPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [activeTab, setActiveTab] = useState('story');
  
  // Form state
  const [params, setParams] = useState<StoryGenerationParams>({
    industry: 'Digital Marketing',
    targetAudience: 'Small Business Owners',
    storyType: 'success_story',
    toneOfVoice: 'professional',
    keywords: [],
    includeCallToAction: true,
    maxLength: 500,
    affiliateProduct: '',
    platformName: ''
  });
  
  // Add a keyword
  const addKeyword = () => {
    if (keywordInput.trim() && params.keywords.length < 10) {
      setParams({
        ...params,
        keywords: [...params.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };
  
  // Remove a keyword
  const removeKeyword = (index: number) => {
    setParams({
      ...params,
      keywords: params.keywords.filter((_, i) => i !== index)
    });
  };
  
  // Handle form field changes
  const handleChange = (
    field: keyof StoryGenerationParams, 
    value: string | boolean | number | string[]
  ) => {
    setParams({
      ...params,
      [field]: value
    });
  };
  
  // Generate the story
  const generateStory = async () => {
    setLoading(true);
    try {
      // Using the updated apiRequest function
      const response = await apiRequest('POST', '/api/ai/generate-story', params);
      const data = await response.json();
      
      setStory(data);
      setActiveTab('story');
      
      toast({
        title: "Story generated successfully!",
        description: "Your professional marketing story is ready.",
      });
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Failed to generate story",
        description: "There was an error generating your story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Copy story to clipboard
  const copyStory = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    });
  };
  
  // Download story as text file
  const downloadStory = () => {
    if (!story) return;
    
    const element = document.createElement('a');
    const file = new Blob([
      `${story.title}\n\n${story.content}\n\nSummary: ${story.summary}\n\nTags: ${story.suggestedTags.join(', ')}`
    ], { type: 'text/plain' });
    
    element.href = URL.createObjectURL(file);
    element.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Story downloaded",
      description: "Your story has been downloaded as a text file.",
    });
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wand2 className="h-8 w-8" />
            Professional Story Generator
          </h1>
          <p className="text-muted-foreground">
            Create compelling marketing stories for your freelance and affiliate projects
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story Generation Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Story Parameters</CardTitle>
            <CardDescription>
              Customize your story settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g. Digital Marketing, E-commerce, Health & Fitness"
                value={params.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g. Small Business Owners, Entrepreneurs"
                value={params.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="storyType">Story Type</Label>
              <Select
                value={params.storyType}
                onValueChange={(value) => handleChange('storyType', value as any)}
              >
                <SelectTrigger id="storyType">
                  <SelectValue placeholder="Select a story type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success_story">Success Story</SelectItem>
                  <SelectItem value="case_study">Case Study</SelectItem>
                  <SelectItem value="personal_narrative">Personal Narrative</SelectItem>
                  <SelectItem value="product_story">Product Story</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toneOfVoice">Tone of Voice</Label>
              <Select
                value={params.toneOfVoice}
                onValueChange={(value) => handleChange('toneOfVoice', value as any)}
              >
                <SelectTrigger id="toneOfVoice">
                  <SelectValue placeholder="Select a tone of voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (up to 10)</Label>
              <div className="flex gap-2">
                <Input
                  id="keywords"
                  placeholder="Add keyword"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword} type="button" variant="outline">
                  Add
                </Button>
              </div>
              {params.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {params.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(index)}
                        className="ml-1 text-xs rounded-full hover:bg-muted p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="affiliateProduct">Affiliate Product (optional)</Label>
              <Input
                id="affiliateProduct"
                placeholder="e.g. Product name to promote"
                value={params.affiliateProduct}
                onChange={(e) => handleChange('affiliateProduct', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platformName">Target Platform (optional)</Label>
              <Input
                id="platformName"
                placeholder="e.g. Upwork, Fiverr, ClickBank"
                value={params.platformName}
                onChange={(e) => handleChange('platformName', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="maxLength">Max Length (words): {params.maxLength}</Label>
              </div>
              <Slider
                id="maxLength"
                min={100}
                max={1000}
                step={50}
                value={[params.maxLength]}
                onValueChange={(value) => handleChange('maxLength', value[0])}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="callToAction"
                checked={params.includeCallToAction}
                onCheckedChange={(checked) => handleChange('includeCallToAction', checked)}
              />
              <Label htmlFor="callToAction">Include Call to Action</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={generateStory}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Story
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Story Results */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Content</CardTitle>
                {story && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyStory(story.content)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={downloadStory}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>
                Your AI-generated marketing story
              </CardDescription>
              
              <TabsList className="mt-3">
                <TabsTrigger value="story" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Story
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Platform Recommendations
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {!story && !loading ? (
              <div className="flex flex-col items-center justify-center h-96 text-center p-6">
                <Wand2 className="h-16 w-16 mb-4 text-primary/20" />
                <h3 className="text-lg font-medium mb-2">No story generated yet</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Configure your story parameters and click "Generate Story" to create professional 
                  marketing content for your freelance or affiliate business.
                </p>
                <p className="text-sm text-muted-foreground">
                  The AI will generate a complete story based on your specifications,
                  including a compelling title, engaging content, and strategic recommendations.
                </p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Generating your story...</h3>
                <p className="text-muted-foreground max-w-md text-center">
                  Our AI is crafting a compelling marketing story based on your specifications.
                  This may take a few moments.
                </p>
              </div>
            ) : (
              <div>
                <TabsContent value="story" className="mt-0 p-0">
                  <ScrollArea className="h-[600px] pr-4">
                    {story && (
                      <div className="space-y-4">
                        <h2 className="text-2xl font-bold">{story.title}</h2>
                        <div className="whitespace-pre-line">{story.content}</div>
                        
                        <div className="mt-6">
                          <h3 className="text-sm font-medium mb-2">Suggested Tags:</h3>
                          <div className="flex flex-wrap gap-1">
                            {story.suggestedTags.map((tag, index) => (
                              <Badge key={index} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="summary" className="mt-0 p-0">
                  <div className="space-y-4">
                    {story && (
                      <>
                        <div className="bg-muted p-4 rounded-md">
                          <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
                          <p>{story.summary}</p>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Industry</h4>
                            <p className="text-sm text-muted-foreground">{params.industry}</p>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium mb-1">Target Audience</h4>
                            <p className="text-sm text-muted-foreground">{params.targetAudience}</p>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium mb-1">Story Type</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {params.storyType.replace('_', ' ')}
                            </p>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium mb-1">Tone of Voice</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {params.toneOfVoice}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations" className="mt-0 p-0">
                  {story && (
                    <div className="space-y-6">
                      <ScrollArea className="h-[500px] pr-4">
                        {story.platformRecommendations.map((rec, index) => (
                          <div key={index} className="mb-4 p-4 border rounded-md">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">{rec.platform}</h3>
                              <div className="flex items-center">
                                <span className="text-sm mr-2">Suitability:</span>
                                <div className="flex">
                                  {Array(10).fill(0).map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`h-1.5 w-3 rounded-full mx-0.5 ${
                                        i < rec.suitabilityScore ? 'bg-primary' : 'bg-muted'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium ml-2">
                                  {rec.suitabilityScore}/10
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.adaptationTips}</p>
                          </div>
                        ))}
                      </ScrollArea>
                      
                      <div className="bg-muted/30 p-4 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Share2 className="h-4 w-4 text-primary" />
                          <h3 className="font-medium">Cross-Platform Strategy</h3>
                        </div>
                        <p className="text-sm">
                          You can adapt this story for multiple platforms based on the recommendations above.
                          Focus on platforms with higher suitability scores for better results.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}