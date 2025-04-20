import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { themeColors, styleVariants } from "@/lib/theme-utils";

export default function ThemesPage() {
  const { setTheme, theme } = useTheme();
  const [selectedPrimary, setSelectedPrimary] = useState("#6366F1");
  const [selectedVariant, setSelectedVariant] = useState("professional");
  const [appearance, setAppearance] = useState(theme || "system");

  // Function to update theme.json (in a real app, this would be an API call)
  const updateTheme = () => {
    // This would update theme.json in a real implementation
    // For now, we'll just update the primary color via CSS variables
    document.documentElement.style.setProperty(
      "--primary", 
      selectedPrimary === "#6366F1" ? "240 95% 64%" : 
      selectedPrimary === "#3B82F6" ? "217 91% 60%" :
      selectedPrimary === "#10B981" ? "160 84% 39%" :
      selectedPrimary === "#F59E0B" ? "38 93% 51%" :
      selectedPrimary === "#F43F5E" ? "350 89% 60%" :
      selectedPrimary === "#8B5CF6" ? "262 83% 58%" :
      "240 95% 64%"
    );

    // Update the appearance
    setTheme(appearance);

    // In a real app, we would save these settings to a theme.json file or database
    console.log("Theme updated:", {
      primary: selectedPrimary,
      variant: selectedVariant,
      appearance: appearance
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Theme Customization</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Theme selection */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Primary Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {themeOptions.map((themeOption) => (
                  <div 
                    key={themeOption.name}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all
                      ${selectedPrimary === themeOption.primaryColor ? 'ring-2 ring-primary' : 'hover:border-primary'}
                    `}
                    onClick={() => setSelectedPrimary(themeOption.primaryColor)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div 
                        className={`w-8 h-8 rounded-full ${themeOption.previewColors.primary}`} 
                      />
                      {selectedPrimary === themeOption.primaryColor && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <h3 className="font-medium">{themeOption.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{themeOption.description}</p>
                    
                    <div className="flex space-x-2 mt-3">
                      <div className={`w-4 h-4 rounded-full ${themeOption.previewColors.primary}`} />
                      <div className={`w-4 h-4 rounded-full ${themeOption.previewColors.secondary}`} />
                      <div className={`w-4 h-4 rounded-full ${themeOption.previewColors.accent}`} />
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
                >
                  Apply Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}