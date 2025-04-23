import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface StoryGenerationParams {
  industry?: string;
  targetAudience?: string;
  storyType?: 'case_study' | 'success_story' | 'personal_narrative' | 'product_story';
  toneOfVoice?: 'professional' | 'friendly' | 'authoritative' | 'conversational';
  keywords?: string[];
  includeCallToAction?: boolean;
  maxLength?: number;
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

/**
 * AI Service for generating professional marketing stories
 */
export class OpenAIService {
  /**
   * Generate a professional marketing story based on provided parameters
   */
  static async generateStory(params: StoryGenerationParams): Promise<GeneratedStory> {
    try {
      // Set default values for parameters
      const industry = params.industry || 'Digital Marketing';
      const targetAudience = params.targetAudience || 'Small business owners';
      const storyType = params.storyType || 'success_story';
      const toneOfVoice = params.toneOfVoice || 'professional';
      const keywords = params.keywords || [];
      const includeCallToAction = params.includeCallToAction ?? true;
      const maxLength = params.maxLength || 500;
      const affiliateProduct = params.affiliateProduct || '';
      const platformName = params.platformName || '';

      // Create the prompt for the AI
      const prompt = this.createStoryPrompt({
        industry,
        targetAudience,
        storyType,
        toneOfVoice,
        keywords,
        includeCallToAction,
        maxLength,
        affiliateProduct,
        platformName
      });

      // Generate story content with GPT-4o
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are an expert content creator specializing in creating professional marketing stories for freelancers and affiliate marketers.
            You create compelling, authentic content that helps professionals showcase their expertise and drive conversions.
            Always respond in JSON format with the requested fields.`
          },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      // Parse the generated content
      const result = JSON.parse(completion.choices[0].message.content || '{}');

      // Return the formatted story
      return {
        title: result.title || `Professional Story: ${industry}`,
        content: result.content || "An error occurred while generating story content.",
        summary: result.summary || "No summary available.",
        suggestedTags: result.suggestedTags || [],
        platformRecommendations: result.platformRecommendations || []
      };
    } catch (error) {
      console.error('Error generating story with OpenAI:', error);
      throw new Error('Failed to generate story. Please try again later.');
    }
  }

  /**
   * Create the story generation prompt based on parameters
   */
  private static createStoryPrompt(params: StoryGenerationParams): string {
    const {
      industry,
      targetAudience,
      storyType,
      toneOfVoice,
      keywords,
      includeCallToAction,
      maxLength,
      affiliateProduct,
      platformName
    } = params;

    // Map story types to descriptions
    const storyTypeDescriptions = {
      case_study: "A detailed analysis of a specific project or client engagement, highlighting the problem, solution, and measurable results.",
      success_story: "A narrative that showcases how specific strategies or techniques led to significant achievements or outcomes.",
      personal_narrative: "A first-person account that shares personal experiences, challenges overcome, and lessons learned in a relatable way.",
      product_story: "A compelling narrative that showcases how a specific product solved problems or transformed results for users."
    };

    // Build the prompt
    let prompt = `Please generate a professional marketing story with the following specifications:

Industry: ${industry}
Target Audience: ${targetAudience}
Story Type: ${storyType} (${storyTypeDescriptions[storyType as keyof typeof storyTypeDescriptions]})
Tone of Voice: ${toneOfVoice}
`;

    if (keywords && keywords.length > 0) {
      prompt += `Keywords to include: ${keywords.join(', ')}\n`;
    }

    if (affiliateProduct && affiliateProduct.trim() !== '') {
      prompt += `Affiliate Product to Feature: ${affiliateProduct}\n`;
    }

    if (platformName && platformName.trim() !== '') {
      prompt += `Platform to Target: ${platformName}\n`;
    }

    prompt += `Maximum Length: ${maxLength} words\n`;
    prompt += `Include Call to Action: ${includeCallToAction ? 'Yes' : 'No'}\n\n`;

    prompt += `Please format your response as a JSON object with the following fields:
- title: A catchy, SEO-friendly title for the story
- content: The full story text
- summary: A brief 2-3 sentence summary of the story
- suggestedTags: An array of 5-7 relevant hashtags or tags for social media
- platformRecommendations: An array of objects containing:
  * platform: Name of a specific platform where this story would perform well
  * suitabilityScore: A number from 1-10 indicating how suitable the content is for that platform
  * adaptationTips: Brief tips on how to adapt the story for that specific platform

Make the story authentic, relatable, and focused on delivering value to the reader. Avoid generic or overly promotional language.`;

    return prompt;
  }
}