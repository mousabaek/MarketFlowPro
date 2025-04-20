export interface ThemeConfig {
  primary: string;
  variant: 'professional' | 'tint' | 'vibrant';
  appearance: 'light' | 'dark' | 'system';
  radius: number;
}

/**
 * Updates the theme configuration by applying a new theme 
 */
export async function updateThemeConfig(primary: string, variant: string, appearance: string): Promise<boolean> {
  try {
    // In a real app, we would send this to the backend
    // For now, we'll just manipulate the CSS variables directly
    document.documentElement.style.setProperty(
      "--primary", 
      primary === "#6366F1" ? "240 95% 64%" : 
      primary === "#3B82F6" ? "217 91% 60%" :
      primary === "#10B981" ? "160 84% 39%" :
      primary === "#F59E0B" ? "38 93% 51%" :
      primary === "#F43F5E" ? "350 89% 60%" :
      primary === "#8B5CF6" ? "262 83% 58%" :
      "240 95% 64%"
    );
    
    // This simulates a backend call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Failed to update theme configuration:', error);
    return false;
  }
}

/**
 * Gets the current theme configuration
 */
export async function getThemeConfig(): Promise<ThemeConfig> {
  // In a real app, we would fetch this from the backend
  return {
    primary: '#6366F1',
    variant: 'professional',
    appearance: 'system',
    radius: 0.5
  };
}

// Theme color options
export const themeColors = [
  { 
    name: "Indigo", 
    color: "#6366F1", 
    description: "Professional and modern indigo theme",
    previewColors: {
      primary: "bg-[#6366F1]",
      secondary: "bg-[#34D399]",
      accent: "bg-[#F59E0B]"
    }
  },
  { 
    name: "Blue", 
    color: "#3B82F6", 
    description: "Classic blue theme for a corporate look",
    previewColors: {
      primary: "bg-[#3B82F6]",
      secondary: "bg-[#10B981]",
      accent: "bg-[#F59E0B]"
    }
  },
  { 
    name: "Emerald", 
    color: "#10B981", 
    description: "Fresh and eco-friendly green theme",
    previewColors: {
      primary: "bg-[#10B981]",
      secondary: "bg-[#6366F1]",
      accent: "bg-[#F59E0B]"
    }
  },
  { 
    name: "Amber", 
    color: "#F59E0B", 
    description: "Warm and energetic amber theme",
    previewColors: {
      primary: "bg-[#F59E0B]",
      secondary: "bg-[#6366F1]",
      accent: "bg-[#10B981]"
    }
  },
  { 
    name: "Rose", 
    color: "#F43F5E", 
    description: "Bold and vibrant rose theme",
    previewColors: {
      primary: "bg-[#F43F5E]",
      secondary: "bg-[#3B82F6]",
      accent: "bg-[#F59E0B]"
    }
  },
  { 
    name: "Purple", 
    color: "#8B5CF6", 
    description: "Creative and rich purple theme",
    previewColors: {
      primary: "bg-[#8B5CF6]",
      secondary: "bg-[#10B981]",
      accent: "bg-[#F59E0B]"
    }
  }
];

// Style variants
export const styleVariants = [
  { name: "Professional", value: "professional", description: "Clean, minimal interface for business use" },
  { name: "Vibrant", value: "vibrant", description: "Bold, energetic style with stronger colors" },
  { name: "Tint", value: "tint", description: "Subtle, tinted style with softer colors" }
];