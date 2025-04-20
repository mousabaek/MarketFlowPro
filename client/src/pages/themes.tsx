import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { themeColors, styleVariants, updateThemeConfig, getThemeConfig } from "@/lib/theme-utils";

export default function ThemesPage() {
  const { setTheme, theme } = useTheme();
  const { toast } = useToast();
  const [selectedPrimary, setSelectedPrimary] = useState("#6366F1");
  const [selectedVariant, setSelectedVariant] = useState("professional");
  const [appearance, setAppearance] = useState(theme || "system");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load current theme configuration on mount
  useEffect(() => {
    async function loadThemeConfig() {
      try {
        setIsLoading(true);
        const config = await getThemeConfig();
        setSelectedPrimary(config.primary);
        setSelectedVariant(config.variant);
        setAppearance(config.appearance);
      } catch (error) {
        console.error("Error loading theme configuration:", error);
        toast({
          title: "Error",
          description: "Could not load theme configuration",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadThemeConfig();
  }, [toast]);

  // Function to update theme
  const updateTheme = async () => {
    setIsUpdating(true);
    try {
      // Update the appearance
      setTheme(appearance);
      
      // Update the theme configuration
      const success = await updateThemeConfig(selectedPrimary, selectedVariant, appearance);
      
      if (success) {
        toast({
          title: "Theme updated",
          description: "Your theme preferences have been saved.",
        });
      } else {
        throw new Error("Failed to update theme");
      }
    } catch (error) {
      toast({
        title: "Failed to update theme",
        description: "There was an error updating your theme.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Theme Customization</h1>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading theme preferences...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Theme selection */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Primary Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {themeColors.map((themeColor) => (
                  <div 
                    key={themeColor.name}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all
                      ${selectedPrimary === themeColor.color ? 'ring-2 ring-primary' : 'hover:border-primary'}
                    `}
                    onClick={() => setSelectedPrimary(themeColor.color)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div 
                        className={`w-8 h-8 rounded-full ${themeColor.previewColors.primary}`} 
                      />
                      {selectedPrimary === themeColor.color && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <h3 className="font-medium">{themeColor.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{themeColor.description}</p>
                    
                    <div className="flex space-x-2 mt-3">
                      <div className={`w-4 h-4 rounded-full ${themeColor.previewColors.primary}`} />
                      <div className={`w-4 h-4 rounded-full ${themeColor.previewColors.secondary}`} />
                      <div className={`w-4 h-4 rounded-full ${themeColor.previewColors.accent}`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Style Variant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {styleVariants.map((variant) => (
                  <div 
                    key={variant.name}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all
                      ${selectedVariant === variant.value ? 'ring-2 ring-primary' : 'hover:border-primary'}
                    `}
                    onClick={() => setSelectedVariant(variant.value)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{variant.name}</h3>
                      {selectedVariant === variant.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{variant.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={appearance} onValueChange={setAppearance} className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="light">Light</TabsTrigger>
                  <TabsTrigger value="dark">Dark</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column: Preview and apply */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-background">
                <h3 className="text-lg font-semibold mb-2">Wolf Auto Marketer</h3>
                
                <div className="flex gap-2 mb-4">
                  <Button 
                    style={{ backgroundColor: selectedPrimary }}
                  >
                    Primary Button
                  </Button>
                  <Button variant="outline">Secondary</Button>
                </div>
                
                <div className="border rounded p-3 my-3">
                  <h4 className="font-medium" style={{ color: selectedPrimary }}>
                    Primary Text
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This is how your content will appear with the selected theme.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="h-2 w-3/4 rounded" style={{ backgroundColor: selectedPrimary }}></div>
                  <div className="h-2 w-1/2 rounded bg-muted"></div>
                  <div className="h-2 w-5/6 rounded bg-muted"></div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={updateTheme}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Applying...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Apply Theme
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}